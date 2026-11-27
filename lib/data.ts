import { prisma } from "@/lib/prisma";
import type { Halbtag, SlotArt } from "@/generated/prisma/enums";

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
export function getFreieOnlineSlots() {
  return prisma.slot.findMany({
    where: { status: "FREI", art: "NORMAL" },
    orderBy: [{ datum: "asc" }, { beginn: "asc" }],
    include: {
      aerztin: { include: { terminarten: true } },
    },
  });
}

export function getOnlineTerminarten() {
  return prisma.terminart.findMany({
    where: { onlineBuchbar: true },
    orderBy: { dauerMinuten: "desc" },
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
