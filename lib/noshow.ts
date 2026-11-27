// F-007: No-Show erfassen, rollierend zaehlen, erinnern und sperren (BR2).
// Die Regeln liegen in lib/rules.ts; hier die Datenbank-Ablaeufe. Die Sperre
// setzt und hebt die MFA (sie greift nicht vollautomatisch).

import type { PrismaClient } from "@/generated/prisma/client";
import {
  darfVersenden,
  erinnerungsKanal,
  noShowEskalation,
  zaehleNoShows,
  type NoShowEintrag,
} from "./rules.ts";

export type ErfassungsErgebnis =
  | {
      ok: true;
      anzahl: number;
      stufe: number;
      erinnerungAngelegt: boolean;
    }
  | { ok: false; grund: string };

// Markiert einen Termin als No-Show. Optional mit triftigem Grund, dann zaehlt
// der Fall nicht. Bei Stufe 2 wird automatisch eine Erinnerungsaufgabe angelegt.
export async function erfasseNoShow(
  prisma: PrismaClient,
  terminId: number,
  optionen: { triftigerGrund?: string | null; heute?: Date } = {},
): Promise<ErfassungsErgebnis> {
  const termin = await prisma.termin.findUnique({ where: { id: terminId } });
  if (!termin) {
    return { ok: false, grund: "Diesen Termin gibt es nicht." };
  }
  if (termin.status === "NO_SHOW") {
    return { ok: false, grund: "Dieser Termin ist schon als No-Show erfasst." };
  }
  if (termin.status !== "GEBUCHT") {
    return { ok: false, grund: "Nur gebuchte Termine lassen sich als No-Show erfassen." };
  }

  const heute = optionen.heute ?? new Date();
  const grund = optionen.triftigerGrund?.trim() || null;

  await prisma.termin.update({
    where: { id: terminId },
    data: { status: "NO_SHOW", noShowAm: heute, triftigerGrund: grund },
  });

  const anzahl = await zaehleNoShowsFuerPatient(prisma, termin.patientId, heute);
  const eskalation = noShowEskalation(anzahl);

  let erinnerungAngelegt = false;
  if (eskalation.erinnerungFaellig) {
    const emailOptin = await pruefeEmailOptin(prisma, termin.patientId);
    await prisma.erinnerung.create({
      data: {
        patientId: termin.patientId,
        terminId,
        kanal: erinnerungsKanal(emailOptin),
      },
    });
    erinnerungAngelegt = true;
  }

  return {
    ok: true,
    anzahl,
    stufe: eskalation.stufe,
    erinnerungAngelegt,
  };
}

async function pruefeEmailOptin(prisma: PrismaClient, patientId: number) {
  const einwilligungen = await prisma.einwilligung.findMany({
    where: { patientId },
  });
  return darfVersenden("EMAIL", einwilligungen);
}

async function zaehleNoShowsFuerPatient(
  prisma: PrismaClient,
  patientId: number,
  heute: Date,
): Promise<number> {
  const termine = await prisma.termin.findMany({ where: { patientId } });
  return zaehleNoShows(termine as NoShowEintrag[], heute);
}

export type NoShowUebersichtZeile = {
  patientId: number;
  name: string;
  anzahl: number;
  stufe: number;
  hinweis: string;
  onlineBuchungGesperrt: boolean;
};

// Uebersicht je Patient:in mit No-Shows im Fenster.
export async function getNoShowUebersicht(
  prisma: PrismaClient,
  heute: Date = new Date(),
): Promise<NoShowUebersichtZeile[]> {
  const patienten = await prisma.patient.findMany({
    include: { termine: true },
    orderBy: { name: "asc" },
  });

  return patienten
    .map((patient) => {
      const anzahl = zaehleNoShows(patient.termine as NoShowEintrag[], heute);
      const eskalation = noShowEskalation(anzahl);
      return {
        patientId: patient.id,
        name: patient.name,
        anzahl,
        stufe: eskalation.stufe,
        hinweis: eskalation.hinweis,
        onlineBuchungGesperrt: patient.onlineBuchungGesperrt,
      };
    })
    .filter((zeile) => zeile.anzahl > 0 || zeile.onlineBuchungGesperrt);
}

// BR2: Die MFA setzt und hebt die Sperre. Keine feste Frist.
export async function setzeOnlineSperre(prisma: PrismaClient, patientId: number) {
  return prisma.patient.update({
    where: { id: patientId },
    data: { onlineBuchungGesperrt: true },
  });
}

export async function hebeOnlineSperre(prisma: PrismaClient, patientId: number) {
  return prisma.patient.update({
    where: { id: patientId },
    data: { onlineBuchungGesperrt: false },
  });
}

export function getOffeneErinnerungen(prisma: PrismaClient) {
  return prisma.erinnerung.findMany({
    where: { erledigtAm: null },
    orderBy: { ausgeloestAm: "asc" },
    include: { patient: true },
  });
}

export async function erledigeErinnerung(prisma: PrismaClient, id: number) {
  return prisma.erinnerung.update({
    where: { id },
    data: { erledigtAm: new Date() },
  });
}

// Termine, die als No-Show erfasst werden koennen (Status GEBUCHT).
export function getNoShowKandidaten(prisma: PrismaClient) {
  return prisma.termin.findMany({
    where: { status: "GEBUCHT" },
    orderBy: [{ slot: { datum: "asc" } }, { slot: { beginn: "asc" } }],
    include: { slot: true, patient: true, aerztin: true },
  });
}
