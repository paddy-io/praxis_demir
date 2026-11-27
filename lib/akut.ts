// F-006: Akut-Kontingent je Halbtag (BR1). Die reine Rechenlogik liegt in
// lib/rules.ts; hier nur die Datenbank-Zugriffe und die Uebersicht.

import type { PrismaClient } from "@/generated/prisma/client";
import { AKUT_KONTINGENT_PRO_HALBTAG, akutStatusFuerHalbtag } from "./rules.ts";

// Liest die praxisweite Einstellung; fehlt sie, gilt der Default.
export async function getAkutKontingent(prisma: PrismaClient): Promise<number> {
  const einstellung = await prisma.praxisEinstellung.findUnique({ where: { id: 1 } });
  return einstellung?.akutKontingentProHalbtag ?? AKUT_KONTINGENT_PRO_HALBTAG;
}

export async function setAkutKontingent(
  prisma: PrismaClient,
  kontingent: number,
): Promise<number> {
  const wert = Math.max(0, Math.trunc(kontingent));
  const einstellung = await prisma.praxisEinstellung.upsert({
    where: { id: 1 },
    update: { akutKontingentProHalbtag: wert },
    create: { id: 1, akutKontingentProHalbtag: wert },
  });
  return einstellung.akutKontingentProHalbtag;
}

export type HalbtagUebersicht = {
  datum: string; // "YYYY-MM-DD"
  halbtag: "VORMITTAG" | "NACHMITTAG";
  angelegt: number;
  frei: number;
  platzFrei: boolean;
  hinweis: string;
};

// Zaehlt die bereits angelegten Akutslots je Tag und Halbtag und berechnet den
// Status gegen das Kontingent.
export async function getAkutUebersicht(
  prisma: PrismaClient,
): Promise<{ kontingent: number; halbtage: HalbtagUebersicht[] }> {
  const kontingent = await getAkutKontingent(prisma);
  const slots = await prisma.slot.findMany({
    where: { art: "AKUT" },
    orderBy: [{ datum: "asc" }, { beginn: "asc" }],
  });

  const gruppen = new Map<string, number>();
  for (const slot of slots) {
    const datum = slot.datum.toISOString().slice(0, 10);
    const schluessel = `${datum}|${slot.halbtag}`;
    gruppen.set(schluessel, (gruppen.get(schluessel) ?? 0) + 1);
  }

  const halbtage: HalbtagUebersicht[] = [...gruppen.entries()]
    .map(([schluessel, angelegt]) => {
      const [datum, halbtag] = schluessel.split("|") as [
        string,
        "VORMITTAG" | "NACHMITTAG",
      ];
      const status = akutStatusFuerHalbtag(kontingent, angelegt);
      return {
        datum,
        halbtag,
        angelegt: status.angelegt,
        frei: status.frei,
        platzFrei: status.platzFrei,
        hinweis: status.hinweis,
      };
    })
    .sort((a, b) =>
      a.datum === b.datum
        ? a.halbtag.localeCompare(b.halbtag)
        : a.datum.localeCompare(b.datum),
    );

  return { kontingent, halbtage };
}

// Prueft, ob im Halbtag eines Slots noch Platz fuer einen weiteren Akutslot ist.
export async function hatAkutPlatz(
  prisma: PrismaClient,
  datum: Date,
  halbtag: "VORMITTAG" | "NACHMITTAG",
): Promise<{ platzFrei: boolean; kontingent: number; angelegt: number }> {
  const kontingent = await getAkutKontingent(prisma);
  const tag = new Date(datum);
  tag.setHours(0, 0, 0, 0);
  const naechsterTag = new Date(tag);
  naechsterTag.setDate(naechsterTag.getDate() + 1);

  const angelegt = await prisma.slot.count({
    where: {
      art: "AKUT",
      halbtag,
      datum: { gte: tag, lt: naechsterTag },
    },
  });

  return {
    platzFrei: akutStatusFuerHalbtag(kontingent, angelegt).platzFrei,
    kontingent,
    angelegt,
  };
}
