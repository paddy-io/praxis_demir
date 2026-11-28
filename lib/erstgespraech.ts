// F-009: Erstgespraech telefonisch vorklaeren und Termin vergeben (BR6, BR8).
// Die MFA klaert vor; das Erstgespraech selbst fuehrt eine Aerzt:in und ist nicht
// online buchbar. Neupatient:innen koennen hier angelegt werden (SPEC-Annahme §7).

import type { PrismaClient } from "@/generated/prisma/client";
import { pruefeVorklaerung, darfTerminVergeben } from "./rules.ts";
import { belegeSlot } from "./slots.ts";

export type VorklaerungsWunsch = {
  // Entweder eine bestehende Nummer oder eine neue Patient:in.
  nummer?: string | null;
  neuerPatient?: {
    name: string;
    versicherungsart: "GESETZLICH" | "PRIVAT";
    nummer: string;
  } | null;
  mfaId: number;
  aerztinId: number;
  slotId: number;
  situation: string;
  dringlichkeit: string;
  aufnahmeMoeglich: boolean;
};

export type ErstgespraechErgebnis =
  | { ok: true; erstgespraechId: number; terminId: number }
  | { ok: false; grund: string };

export async function erfasseErstgespraech(
  prisma: PrismaClient,
  wunsch: VorklaerungsWunsch,
): Promise<ErstgespraechErgebnis> {
  const vorklaerung = pruefeVorklaerung({
    situation: wunsch.situation,
    dringlichkeit: wunsch.dringlichkeit,
    aerztinId: wunsch.aerztinId,
  });
  if (!vorklaerung.ok) return { ok: false, grund: vorklaerung.grund };

  if (!darfTerminVergeben(wunsch.aufnahmeMoeglich)) {
    return {
      ok: false,
      grund: "Ohne „Aufnahme möglich“ wird kein Erstgesprächstermin vergeben.",
    };
  }

  // BR6: Das Erstgespraech ist nicht online buchbar. Es muss die passende
  // Terminart sein.
  const terminart = await prisma.terminart.findFirst({
    where: { bezeichnung: "Erstgespraech" },
  });
  if (!terminart) {
    return { ok: false, grund: "Die Terminart „Erstgespraech“ fehlt." };
  }

  const mfa = await prisma.mFA.findUnique({ where: { id: wunsch.mfaId } });
  if (!mfa) return { ok: false, grund: "Diese MFA gibt es nicht." };

  const aerztin = await prisma.aerztin.findUnique({ where: { id: wunsch.aerztinId } });
  if (!aerztin) return { ok: false, grund: "Diese Ärztin gibt es nicht." };

  const slot = await prisma.slot.findUnique({ where: { id: wunsch.slotId } });
  if (!slot) return { ok: false, grund: "Dieser Slot existiert nicht mehr." };
  if (slot.status !== "FREI") return { ok: false, grund: "Dieser Slot ist schon belegt." };
  if (slot.aerztinId !== wunsch.aerztinId) {
    return { ok: false, grund: "Der Slot gehört zu einer anderen Ärztin." };
  }

  const abwesenheiten = await prisma.abwesenheit.findMany();
  const gesperrt = abwesenheiten.some((a) => {
    const tag = new Date(slot.datum).setHours(0, 0, 0, 0);
    const von = new Date(a.von).setHours(0, 0, 0, 0);
    const bis = new Date(a.bis).setHours(0, 0, 0, 0);
    if (tag < von || tag > bis) return false;
    return a.geltungsbereich === "PRAXIS" || a.aerztinId === slot.aerztinId;
  });
  if (gesperrt) {
    return { ok: false, grund: "Der Termin liegt in einer Abwesenheit oder Schließung." };
  }

  // Patient:in bestimmen oder neu anlegen.
  const patientId = await ermittlePatientId(prisma, wunsch);
  if (typeof patientId !== "number") {
    return { ok: false, grund: patientId.grund };
  }

  try {
    const ergebnis = await prisma.$transaction(async (tx) => {
      const belegt = await belegeSlot(tx, slot.id);
      if (!belegt) throw new Error("SLOT_BELEGT");

      const termin = await tx.termin.create({
        data: {
          patientId,
          aerztinId: wunsch.aerztinId,
          terminartId: terminart.id,
          slotId: slot.id,
          kanal: "TELEFON",
          status: "GEBUCHT",
          dringlichkeit: wunsch.dringlichkeit.trim(),
          erfasstVonId: wunsch.mfaId,
        },
      });

      const erstgespraech = await tx.erstgespraech.create({
        data: {
          patientId,
          mfaId: wunsch.mfaId,
          aerztinId: wunsch.aerztinId,
          terminId: termin.id,
          situation: wunsch.situation.trim(),
          dringlichkeit: wunsch.dringlichkeit.trim(),
          aufnahmeMoeglich: wunsch.aufnahmeMoeglich,
        },
      });

      return { terminId: termin.id, erstgespraechId: erstgespraech.id };
    });
    return { ok: true, ...ergebnis };
  } catch (fehler) {
    if (fehler instanceof Error && fehler.message === "SLOT_BELEGT") {
      return { ok: false, grund: "Dieser Slot wurde gerade vergeben." };
    }
    throw fehler;
  }
}

// Liefert eine patientId oder ein Fehlerobjekt.
async function ermittlePatientId(
  prisma: PrismaClient,
  wunsch: VorklaerungsWunsch,
): Promise<number | { grund: string }> {
  if (wunsch.neuerPatient) {
    const nummer = wunsch.neuerPatient.nummer.trim();
    if (!nummer) return { grund: "Bitte eine Nummer für die neue Patient:in angeben." };
    const vorhanden = await prisma.patient.findFirst({
      where: {
        OR: [{ versichertennummer: nummer }, { patientennummer: nummer }],
      },
    });
    if (vorhanden) {
      return { grund: "Diese Nummer ist schon vergeben. Bitte bestehende Patient:in wählen." };
    }
    const angelegt = await prisma.patient.create({
      data: {
        name: wunsch.neuerPatient.name.trim() || "Neue Patient:in",
        versicherungsart: wunsch.neuerPatient.versicherungsart,
        status: "NEU",
        ...(wunsch.neuerPatient.versicherungsart === "GESETZLICH"
          ? { versichertennummer: nummer }
          : { patientennummer: nummer }),
      },
    });
    return angelegt.id;
  }

  const nummer = wunsch.nummer?.trim();
  if (!nummer) return { grund: "Bitte eine Patient:innennummer angeben." };
  const patient = await prisma.patient.findFirst({
    where: { OR: [{ versichertennummer: nummer }, { patientennummer: nummer }] },
  });
  if (!patient) return { grund: "Kein Patient mit dieser Nummer gefunden." };
  return patient.id;
}

export function getErstgespraeche(prisma: PrismaClient) {
  return prisma.erstgespraech.findMany({
    orderBy: [{ erfasstAm: "desc" }],
    include: { patient: true, mfa: true, aerztin: true, termin: { include: { slot: true } } },
  });
}
