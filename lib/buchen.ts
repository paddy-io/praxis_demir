// Bucht einen Online-Termin. BR5 wird hart abgesichert: Der Slot wird nur dann
// belegt, wenn er noch FREI ist (bedingtes Update in einer Transaktion). Zwei
// gleichzeitige Buchungen desselben Slots koennen so nicht beide gewinnen.

import type { PrismaClient } from "@/generated/prisma/client";
import { pruefeBuchung, pruefeIdentifikation } from "./booking.ts";
import { abwesenheitSperrtSlot } from "./rules.ts";

export type BuchungsWunsch = {
  // Eindeutige Identifikation (BR9): je nach Versicherungsart eine der Nummern.
  versicherungsart: "GESETZLICH" | "PRIVAT";
  nummer: string;
  slotId: number;
  terminartId: number;
};

export type BuchungsErgebnis =
  | { ok: true; terminId: number }
  | { ok: false; grund: string };

export async function bucheOnlineTermin(
  prisma: PrismaClient,
  wunsch: BuchungsWunsch,
): Promise<BuchungsErgebnis> {
  const patient = await prisma.patient.findFirst({
    where:
      wunsch.versicherungsart === "GESETZLICH"
        ? { versicherungsart: "GESETZLICH", versichertennummer: wunsch.nummer }
        : { versicherungsart: "PRIVAT", patientennummer: wunsch.nummer },
  });

  const identifikation = pruefeIdentifikation(patient);
  if (!identifikation.ok || !patient) {
    return { ok: false, grund: identifikation.ok ? "Unbekannt." : identifikation.grund };
  }

  const slot = await prisma.slot.findUnique({
    where: { id: wunsch.slotId },
    include: { aerztin: true },
  });
  if (!slot) {
    return { ok: false, grund: "Dieser Slot existiert nicht mehr." };
  }

  // BR4: Eine hinterlegte Abwesenheit oder Praxisschliessung sperrt den Slot.
  const abwesenheiten = await prisma.abwesenheit.findMany();
  if (abwesenheitSperrtSlot(abwesenheiten, slot)) {
    return {
      ok: false,
      grund: "Dieser Termin liegt in einer Abwesenheit oder Schließung. Bitte telefonisch.",
    };
  }

  const terminart = await prisma.terminart.findUnique({
    where: { id: wunsch.terminartId },
  });
  if (!terminart) {
    return { ok: false, grund: "Diese Terminart gibt es nicht." };
  }

  // Die Aerztin muss die Terminart durchfuehren duerfen (SPEC Beziehung 4).
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

  const vorab = pruefeBuchung(patient, terminart);
  if (!vorab.ok) return { ok: false, grund: vorab.grund };

  try {
    const terminId = await prisma.$transaction(async (tx) => {
      // BR5: Slot nur sperren, wenn er noch frei ist. Zaehlt 0 Zeilen, war
      // jemand schneller und die Buchung bricht ab.
      const gesperrt = await tx.slot.updateMany({
        where: { id: slot.id, status: "FREI" },
        data: { status: "BELEGT" },
      });
      if (gesperrt.count === 0) {
        throw new Error("SLOT_BELEGT");
      }

      const termin = await tx.termin.create({
        data: {
          patientId: patient.id,
          aerztinId: slot.aerztinId,
          terminartId: terminart.id,
          slotId: slot.id,
          kanal: "ONLINE",
          status: "GEBUCHT",
        },
      });
      return termin.id;
    });

    return { ok: true, terminId };
  } catch (fehler) {
    if (fehler instanceof Error && fehler.message === "SLOT_BELEGT") {
      return { ok: false, grund: "Dieser Slot wurde gerade vergeben. Bitte anderen wählen." };
    }
    throw fehler;
  }
}
