// F-004: Einwilligung (Opt-in) je Kanal verwalten (BR9).
// Die Regeln liegen als reine Funktionen in lib/rules.ts; hier nur die
// Datenbank-Ablaeufe. Vor jedem Versand prueft pruefeVersand(...).

import type { PrismaClient } from "@/generated/prisma/client";
import { darfVersenden, type EinwilligungsKanal } from "./rules.ts";

export type KanalStatus = {
  kanal: EinwilligungsKanal;
  erteilt: boolean;
  erteiltAm: Date | null;
  widerrufenAm: Date | null;
};

// Erteilt die Einwilligung. Ein frueherer Widerruf wird aufgehoben.
export async function erteileEinwilligung(
  prisma: PrismaClient,
  patientId: number,
  kanal: EinwilligungsKanal,
): Promise<KanalStatus> {
  const jetzt = new Date();
  const eintrag = await prisma.einwilligung.upsert({
    where: { patientId_kanal: { patientId, kanal } },
    update: { erteiltAm: jetzt, widerrufenAm: null },
    create: { patientId, kanal, erteiltAm: jetzt },
  });
  return {
    kanal,
    erteilt: true,
    erteiltAm: eintrag.erteiltAm,
    widerrufenAm: eintrag.widerrufenAm,
  };
}

// Widerruft die Einwilligung. Der Eintrag bleibt bestehen (Verlauf).
export async function widerrufeEinwilligung(
  prisma: PrismaClient,
  patientId: number,
  kanal: EinwilligungsKanal,
): Promise<KanalStatus> {
  const jetzt = new Date();
  const eintrag = await prisma.einwilligung.upsert({
    where: { patientId_kanal: { patientId, kanal } },
    update: { widerrufenAm: jetzt },
    create: { patientId, kanal, erteiltAm: jetzt, widerrufenAm: jetzt },
  });
  return {
    kanal,
    erteilt: false,
    erteiltAm: eintrag.erteiltAm,
    widerrufenAm: eintrag.widerrufenAm,
  };
}

// BR9: die zentrale Pruefung vor jedem Versand. Fehlt der Eintrag, gilt die
// Einwilligung als nicht erteilt.
export async function pruefeVersand(
  prisma: PrismaClient,
  patientId: number,
  kanal: EinwilligungsKanal,
): Promise<boolean> {
  const einwilligungen = await prisma.einwilligung.findMany({
    where: { patientId },
  });
  return darfVersenden(kanal, einwilligungen);
}

export function getEinwilligungen(prisma: PrismaClient, patientId: number) {
  return prisma.einwilligung.findMany({
    where: { patientId },
    orderBy: { kanal: "asc" },
  });
}

// Sucht eine Patient:in ueber Versicherten- oder Patientennummer (BR9:
// eindeutige Identifikation).
export function findePatient(prisma: PrismaClient, nummer: string) {
  return prisma.patient.findFirst({
    where: {
      OR: [{ versichertennummer: nummer }, { patientennummer: nummer }],
    },
  });
}
