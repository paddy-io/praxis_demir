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
