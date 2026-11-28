// F-011: Vorab-Fragebogen speichern (SPEC "spaeter", M1-12). Die Antworten landen
// als Notiz am Termin. Die Fragen selbst sind reine Regellogik in lib/rules.ts.

import type { PrismaClient } from "@/generated/prisma/client";
import { formatiereFragebogenNotiz } from "./rules.ts";

export type FragebogenErgebnis =
  | { ok: true; terminId: number; notiz: string }
  | { ok: false; grund: string };

export async function speichereFragebogen(
  prisma: PrismaClient,
  terminId: number,
  antworten: Record<string, string>,
): Promise<FragebogenErgebnis> {
  const termin = await prisma.termin.findUnique({
    where: { id: terminId },
    include: { terminart: true },
  });
  if (!termin) {
    return { ok: false, grund: "Diesen Termin gibt es nicht." };
  }
  // Der Fragebogen gehoert zur Online-Buchung.
  if (termin.kanal !== "ONLINE") {
    return { ok: false, grund: "Der Fragebogen gilt nur für Online-Buchungen." };
  }
  // Nicht ueberschreiben, wenn schon eine Notiz hinterlegt ist (idempotent).
  if (termin.fragebogenAm) {
    return { ok: false, grund: "Der Fragebogen wurde schon ausgefüllt." };
  }

  const notiz = formatiereFragebogenNotiz(termin.terminart.bezeichnung, antworten);
  if (!notiz) {
    return { ok: false, grund: "Bitte mindestens eine Frage beantworten." };
  }

  await prisma.termin.update({
    where: { id: terminId },
    data: { notiz, fragebogenAm: new Date() },
  });
  return { ok: true, terminId, notiz };
}

// Fragen und die bereits gespeicherte Notiz fuer die Anzeige.
export function getFragebogen(prisma: PrismaClient, terminId: number) {
  return prisma.termin.findUnique({
    where: { id: terminId },
    include: { terminart: true },
  });
}
