// F-005: Termine an Telefon und Tresen erfassen, aendern und absagen (BR5, BR7).
// Alles laeuft in Transaktionen, damit BR5 ("ein Slot, ein Termin") auch bei
// gleichzeitigen Aenderungen haelt. Anders als online sind hier alle Terminarten
// erlaubt; eine hinterlegte Abwesenheit sperrt den Slot trotzdem.

import type { PrismaClient } from "@/generated/prisma/client";
import { abwesenheitSperrtSlot, terminAenderbar, terminAbsagbar } from "./rules.ts";
import { belegeSlot, gibSlotFrei } from "./slots.ts";

export type TerminKanal = "TELEFON" | "TRESEN";

export type ErfassungsWunsch = {
  nummer: string;
  terminartId: number;
  slotId: number;
  kanal: TerminKanal;
  dringlichkeit?: string | null;
  erfasstVonId?: number | null;
};

export type AenderungsWunsch = {
  slotId: number;
  terminartId: number;
};

export type TerminErgebnis =
  | { ok: true; terminId: number }
  | { ok: false; grund: string };

async function findePatient(prisma: PrismaClient, nummer: string) {
  return prisma.patient.findFirst({
    where: { OR: [{ versichertennummer: nummer }, { patientennummer: nummer }] },
  });
}

export async function erfasseTermin(
  prisma: PrismaClient,
  wunsch: ErfassungsWunsch,
): Promise<TerminErgebnis> {
  const patient = await findePatient(prisma, wunsch.nummer.trim());
  if (!patient) {
    return { ok: false, grund: "Kein Patient mit dieser Nummer gefunden." };
  }

  const slot = await prisma.slot.findUnique({ where: { id: wunsch.slotId } });
  if (!slot) {
    return { ok: false, grund: "Dieser Slot existiert nicht mehr." };
  }
  if (slot.status !== "FREI") {
    return { ok: false, grund: "Dieser Slot ist schon belegt." };
  }

  const terminart = await prisma.terminart.findUnique({
    where: { id: wunsch.terminartId },
  });
  if (!terminart) {
    return { ok: false, grund: "Diese Terminart gibt es nicht." };
  }

  const darfDurchfuehren = await prisma.aerztinTerminart.findUnique({
    where: {
      aerztinId_terminartId: {
        aerztinId: slot.aerztinId,
        terminartId: terminart.id,
      },
    },
  });
  if (!darfDurchfuehren) {
    return {
      ok: false,
      grund: "Diese Ärztin führt die gewählte Terminart nicht durch.",
    };
  }

  const abwesenheiten = await prisma.abwesenheit.findMany();
  if (abwesenheitSperrtSlot(abwesenheiten, slot)) {
    return {
      ok: false,
      grund: "Dieser Termin liegt in einer Abwesenheit oder Schließung.",
    };
  }

  try {
    const terminId = await prisma.$transaction(async (tx) => {
      const gesperrt = await belegeSlot(tx, slot.id);
      if (!gesperrt) throw new Error("SLOT_BELEGT");

      const termin = await tx.termin.create({
        data: {
          patientId: patient.id,
          aerztinId: slot.aerztinId,
          terminartId: terminart.id,
          slotId: slot.id,
          kanal: wunsch.kanal,
          status: "GEBUCHT",
          dringlichkeit: wunsch.dringlichkeit?.trim() || null,
          erfasstVonId: wunsch.erfasstVonId ?? null,
        },
      });
      return termin.id;
    });
    return { ok: true, terminId };
  } catch (fehler) {
    if (fehler instanceof Error && fehler.message === "SLOT_BELEGT") {
      return { ok: false, grund: "Dieser Slot wurde gerade vergeben." };
    }
    throw fehler;
  }
}

export async function aendereTermin(
  prisma: PrismaClient,
  terminId: number,
  wunsch: AenderungsWunsch,
): Promise<TerminErgebnis> {
  const termin = await prisma.termin.findUnique({ where: { id: terminId } });
  if (!termin) {
    return { ok: false, grund: "Diesen Termin gibt es nicht." };
  }
  if (!terminAenderbar(termin.status)) {
    return { ok: false, grund: "Dieser Termin lässt sich nicht mehr ändern." };
  }

  const neuerSlot = await prisma.slot.findUnique({ where: { id: wunsch.slotId } });
  if (!neuerSlot) {
    return { ok: false, grund: "Der gewählte Slot existiert nicht." };
  }
  if (neuerSlot.status !== "FREI") {
    return { ok: false, grund: "Der gewählte Slot ist schon belegt." };
  }

  const terminart = await prisma.terminart.findUnique({
    where: { id: wunsch.terminartId },
  });
  if (!terminart) {
    return { ok: false, grund: "Diese Terminart gibt es nicht." };
  }

  const darfDurchfuehren = await prisma.aerztinTerminart.findUnique({
    where: {
      aerztinId_terminartId: {
        aerztinId: neuerSlot.aerztinId,
        terminartId: terminart.id,
      },
    },
  });
  if (!darfDurchfuehren) {
    return {
      ok: false,
      grund: "Diese Ärztin führt die gewählte Terminart nicht durch.",
    };
  }

  const abwesenheiten = await prisma.abwesenheit.findMany();
  if (abwesenheitSperrtSlot(abwesenheiten, neuerSlot)) {
    return {
      ok: false,
      grund: "Der gewählte Termin liegt in einer Abwesenheit oder Schließung.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const gesperrt = await belegeSlot(tx, neuerSlot.id);
      if (!gesperrt) throw new Error("SLOT_BELEGT");

      // Alten Slot freigeben, sofern er sich vom neuen unterscheidet.
      if (termin.slotId !== neuerSlot.id) {
        await gibSlotFrei(tx, termin.slotId);
      }

      await tx.termin.update({
        where: { id: terminId },
        data: {
          slotId: neuerSlot.id,
          aerztinId: neuerSlot.aerztinId,
          terminartId: terminart.id,
          status: "GEBUCHT",
        },
      });
    });
    return { ok: true, terminId };
  } catch (fehler) {
    if (fehler instanceof Error && fehler.message === "SLOT_BELEGT") {
      return { ok: false, grund: "Der gewählte Slot wurde gerade vergeben." };
    }
    throw fehler;
  }
}

export async function sageTerminAb(
  prisma: PrismaClient,
  terminId: number,
): Promise<TerminErgebnis> {
  const termin = await prisma.termin.findUnique({ where: { id: terminId } });
  if (!termin) {
    return { ok: false, grund: "Diesen Termin gibt es nicht." };
  }
  if (!terminAbsagbar(termin.status)) {
    return { ok: false, grund: "Dieser Termin lässt sich nicht mehr absagen." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.termin.update({
      where: { id: terminId },
      data: { status: "ABSAGT" },
    });
    await gibSlotFrei(tx, termin.slotId);
  });
  return { ok: true, terminId };
}
