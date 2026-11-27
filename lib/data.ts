import { prisma } from "@/lib/prisma";
import type { Halbtag, SlotArt } from "@/generated/prisma/enums";
import { abwesenheitSperrtSlot } from "@/lib/rules";
import { getAkutUebersicht as akutUebersicht } from "@/lib/akut";

export function getTerminarten() {
  return prisma.terminart.findMany({ orderBy: { dauerMinuten: "desc" } });
}

export function getAerztinnen() {
  return prisma.aerztin.findMany({
    orderBy: { id: "asc" },
    include: {
      terminarten: { include: { terminart: true } },
    },
  });
}

export function getSlots() {
  return prisma.slot.findMany({
    orderBy: [{ datum: "asc" }, { beginn: "asc" }],
    include: { aerztin: true },
  });
}

// F-002: alle freien Slots mit den Terminarten, die die Aerztin durchfuehren darf.
// Die Oberflaeche filtert damit nach der gewaehlten Terminart.
// F-003: Slots, die in eine Abwesenheit oder Schliessung fallen, werden
// ausgeblendet (BR4).
export async function getFreieOnlineSlots() {
  const [slots, abwesenheiten] = await Promise.all([
    prisma.slot.findMany({
      where: { status: "FREI", art: "NORMAL" },
      orderBy: [{ datum: "asc" }, { beginn: "asc" }],
      include: {
        aerztin: { include: { terminarten: true } },
      },
    }),
    prisma.abwesenheit.findMany(),
  ]);

  return slots.filter((slot) => !abwesenheitSperrtSlot(abwesenheiten, slot));
}

export function getOnlineTerminarten() {
  return prisma.terminart.findMany({
    where: { onlineBuchbar: true },
    orderBy: { dauerMinuten: "desc" },
  });
}

// --- F-003 Abwesenheit ---

export function getAbwesenheiten() {
  return prisma.abwesenheit.findMany({
    orderBy: [{ von: "asc" }],
    include: { aerztin: true },
  });
}

export function getBetroffeneTermine() {
  return prisma.termin.findMany({
    where: { status: "BETROFFEN" },
    orderBy: [{ slot: { datum: "asc" } }],
    include: { slot: true, aerztin: true, patient: true, terminart: true },
  });
}

// --- F-006 Akut-Kontingent ---

// Wrapper mit dem Singleton-Client, damit die Seite nichts ueber Prisma wissen muss.
export function getAkutUebersicht() {
  return akutUebersicht(prisma);
}

// --- F-005 Terminverwaltung ---

export function getMFAs() {
  return prisma.mFA.findMany({ orderBy: { name: "asc" } });
}

// Alle freien Slots (auch nicht online buchbare), fuer Telefon und Tresen.
export async function getFreieSlots() {
  const [slots, abwesenheiten] = await Promise.all([
    prisma.slot.findMany({
      where: { status: "FREI" },
      orderBy: [{ datum: "asc" }, { beginn: "asc" }],
      include: { aerztin: { include: { terminarten: true } } },
    }),
    prisma.abwesenheit.findMany(),
  ]);
  return slots.filter((slot) => !abwesenheitSperrtSlot(abwesenheiten, slot));
}

export function getTermine() {
  return prisma.termin.findMany({
    orderBy: [{ slot: { datum: "asc" } }, { slot: { beginn: "asc" } }],
    include: { slot: true, aerztin: true, terminart: true, patient: true },
  });
}

export type NeuerSlot = {
  aerztinId: number;
  datum: string; // "YYYY-MM-DD"
  beginn: string; // "HH:MM"
  halbtag: Halbtag;
  art: SlotArt;
};

export function createSlot(input: NeuerSlot) {
  return prisma.slot.create({
    data: {
      aerztinId: input.aerztinId,
      datum: new Date(`${input.datum}T00:00:00`),
      beginn: input.beginn,
      halbtag: input.halbtag,
      art: input.art,
    },
  });
}
