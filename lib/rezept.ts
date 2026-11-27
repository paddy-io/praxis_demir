// F-008: Rezeptantrag anlegen und durch eine Aerzt:in freigeben (BR3).
// Die MFA legt an, nur eine Aerzt:in gibt frei. Bei Abwesenheit gibt eine
// anwesende Kollegin oder ein Kollege frei (SPEC §7, keine feste Zustaendigkeit).

import type { PrismaClient } from "@/generated/prisma/client";
import { aerztinAbwesend } from "./rules.ts";

export type RezeptErgebnis =
  | { ok: true; antragId: number }
  | { ok: false; grund: string };

export async function legeRezeptantragAn(
  prisma: PrismaClient,
  wunsch: { nummer: string; angelegtVonId: number; notiz?: string | null },
): Promise<RezeptErgebnis> {
  const patient = await prisma.patient.findFirst({
    where: {
      OR: [
        { versichertennummer: wunsch.nummer.trim() },
        { patientennummer: wunsch.nummer.trim() },
      ],
    },
  });
  if (!patient) {
    return { ok: false, grund: "Kein Patient mit dieser Nummer gefunden." };
  }

  const mfa = await prisma.mFA.findUnique({ where: { id: wunsch.angelegtVonId } });
  if (!mfa) {
    return { ok: false, grund: "Diese MFA gibt es nicht." };
  }

  const antrag = await prisma.rezeptantrag.create({
    data: {
      patientId: patient.id,
      angelegtVonId: mfa.id,
      notiz: wunsch.notiz?.trim() || null,
      status: "ANGELEGT",
    },
  });
  return { ok: true, antragId: antrag.id };
}

export async function gibRezeptFrei(
  prisma: PrismaClient,
  antragId: number,
  aerztinId: number,
  heute: Date = new Date(),
): Promise<RezeptErgebnis> {
  const antrag = await prisma.rezeptantrag.findUnique({ where: { id: antragId } });
  if (!antrag) {
    return { ok: false, grund: "Diesen Rezeptantrag gibt es nicht." };
  }
  if (antrag.status !== "ANGELEGT") {
    return { ok: false, grund: "Dieser Antrag ist schon freigegeben." };
  }

  const aerztin = await prisma.aerztin.findUnique({ where: { id: aerztinId } });
  if (!aerztin) {
    return { ok: false, grund: "Diese Ärztin gibt es nicht." };
  }

  const abwesenheiten = await prisma.abwesenheit.findMany();
  if (aerztinAbwesend(abwesenheiten, aerztinId, heute)) {
    return {
      ok: false,
      grund: "Diese Ärztin ist heute abwesend. Bitte eine Kollegin oder einen Kollegen wählen.",
    };
  }

  await prisma.rezeptantrag.update({
    where: { id: antragId },
    data: {
      status: "FREIGEGEBEN",
      freigegebenVonId: aerztinId,
      freigegebenAm: heute,
    },
  });
  return { ok: true, antragId };
}

export function getRezeptantraege(prisma: PrismaClient) {
  return prisma.rezeptantrag.findMany({
    orderBy: [{ datum: "desc" }],
    include: {
      patient: true,
      angelegtVon: true,
      freigegebenVon: true,
    },
  });
}
