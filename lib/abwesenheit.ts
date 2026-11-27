// F-003: Abwesenheit oder Praxisschliessung anlegen (BR4).
// In einem Schritt wird die Abwesenheit gespeichert und alle betroffenen
// Termine werden auf "betroffen - Umbuchung offen" gesetzt. Es wird nichts
// automatisch umgebucht (SPEC BR4, Out of Scope).

import type { PrismaClient } from "@/generated/prisma/client";
import {
  findeBetroffeneTermine,
  pruefeAbwesenheit,
  type AbwesenheitsRegel,
} from "./rules.ts";

export type NeuerAbwesenheitsWunsch = {
  von: Date;
  bis: Date;
  geltungsbereich: "AERZTIN" | "PRAXIS";
  art: "URLAUB" | "BRUECKENTAG" | "FORTBILDUNG";
  aerztinId: number | null;
};

export type AbwesenheitsErgebnis =
  | { ok: true; abwesenheitId: number; betroffeneTermine: number }
  | { ok: false; grund: string };

export async function legeAbwesenheitAn(
  prisma: PrismaClient,
  wunsch: NeuerAbwesenheitsWunsch,
): Promise<AbwesenheitsErgebnis> {
  const regel = pruefeAbwesenheit(wunsch);
  if (!regel.ok) {
    return { ok: false, grund: regel.grund };
  }

  const abwesenheit = await prisma.abwesenheit.create({
    data: {
      von: wunsch.von,
      bis: wunsch.bis,
      geltungsbereich: wunsch.geltungsbereich,
      art: wunsch.art,
      aerztinId: wunsch.aerztinId,
    },
  });

  // Alle gebuchten Termine im Zeitraum ermitteln und markieren. Eine
  // Praxisschliessung trifft alle, eine Aerztin-Abwesenheit nur ihre Termine.
  const termine = await prisma.termin.findMany({
    where: {
      status: { in: ["GEBUCHT", "ERSCHIENEN"] },
      slot: { datum: { gte: wunsch.von, lte: wunsch.bis } },
      ...(wunsch.geltungsbereich === "AERZTIN"
        ? { aerztinId: wunsch.aerztinId! }
        : {}),
    },
    include: { slot: true },
  });

  const regeln: AbwesenheitsRegel[] = [wunsch];
  const betroffen = findeBetroffeneTermine(regeln, termine);

  if (betroffen.length > 0) {
    await prisma.termin.updateMany({
      where: { id: { in: betroffen.map((t) => t.id) } },
      data: { status: "BETROFFEN" },
    });
  }

  return {
    ok: true,
    abwesenheitId: abwesenheit.id,
    betroffeneTermine: betroffen.length,
  };
}
