// F-010: Nachtrag erfassen (informelle Kulanz, BR1/W2). Ein Nachtrag ist ein
// Termin ohne Slot: BR5 bleibt gewahrt, weil kein Slot belegt wird.

import type { PrismaClient } from "@/generated/prisma/client";
import { pruefeNachtrag } from "./rules.ts";

export type NachtragsWunsch = {
  nummer: string;
  terminartId: number;
  aerztinId: number;
  abspracheMitId: number;
  datum: Date;
  notiz?: string | null;
  erfasstVonId?: number | null;
};

export type NachtragsErgebnis =
  | { ok: true; terminId: number }
  | { ok: false; grund: string };

export async function erfasseNachtrag(
  prisma: PrismaClient,
  wunsch: NachtragsWunsch,
): Promise<NachtragsErgebnis> {
  const pruefung = pruefeNachtrag({
    datum: wunsch.datum,
    abspracheMitId: wunsch.abspracheMitId,
  });
  if (!pruefung.ok) return { ok: false, grund: pruefung.grund };

  const patient = await prisma.patient.findFirst({
    where: {
      OR: [
        { versichertennummer: wunsch.nummer.trim() },
        { patientennummer: wunsch.nummer.trim() },
      ],
    },
  });
  if (!patient) return { ok: false, grund: "Kein Patient mit dieser Nummer gefunden." };

  const terminart = await prisma.terminart.findUnique({
    where: { id: wunsch.terminartId },
  });
  if (!terminart) return { ok: false, grund: "Diese Terminart gibt es nicht." };

  const aerztin = await prisma.aerztin.findUnique({ where: { id: wunsch.aerztinId } });
  if (!aerztin) return { ok: false, grund: "Diese Ärztin gibt es nicht." };

  const absprache = await prisma.aerztin.findUnique({
    where: { id: wunsch.abspracheMitId },
  });
  if (!absprache) {
    return { ok: false, grund: "Die Ärztin für die Absprache gibt es nicht." };
  }

  const terminId = await prisma.$transaction(async (tx) => {
    // Kein Slot: slotId bleibt null, der Termin wird als nachtraeglich markiert.
    const termin = await tx.termin.create({
      data: {
        patientId: patient.id,
        aerztinId: wunsch.aerztinId,
        terminartId: terminart.id,
        slotId: null,
        kanal: "TELEFON",
        status: "GEBUCHT",
        nachtraeglichErfasst: true,
        erfasstVonId: wunsch.erfasstVonId ?? null,
      },
    });

    await tx.nachtrag.create({
      data: {
        terminId: termin.id,
        abspracheMitId: wunsch.abspracheMitId,
        datum: wunsch.datum,
        notiz: wunsch.notiz?.trim() || null,
      },
    });

    return termin.id;
  });

  return { ok: true, terminId };
}

export function getNachtraege(prisma: PrismaClient) {
  return prisma.nachtrag.findMany({
    orderBy: [{ datum: "desc" }],
    include: {
      abspracheMit: true,
      termin: {
        include: { patient: true, aerztin: true, terminart: true },
      },
    },
  });
}
