"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { legeAbwesenheitAn } from "@/lib/abwesenheit";
import { darfTerminplanPflegen } from "@/lib/rules";

export type FormState = {
  error?: string;
  erfolg?: { betroffeneTermine: number };
};

export async function abwesenheitAnlegenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR7: den Terminplan pflegt nur die MFA. Hier kommt spaeter die echte
  // Anmeldung; bis dahin wird die Rolle bewusst uebergeben.
  const rolle = formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
  if (!darfTerminplanPflegen(rolle)) {
    return { error: "Nur die MFA darf Abwesenheiten pflegen." };
  }

  const von = String(formData.get("von") ?? "");
  const bis = String(formData.get("bis") ?? "") || von;
  const geltungsbereich =
    formData.get("geltungsbereich") === "PRAXIS" ? "PRAXIS" : "AERZTIN";
  const artRoh = String(formData.get("art") ?? "URLAUB");
  const art =
    artRoh === "BRUECKENTAG" || artRoh === "FORTBILDUNG" ? artRoh : "URLAUB";
  const aerztinId =
    geltungsbereich === "AERZTIN" ? Number(formData.get("aerztinId")) : null;

  if (!von) {
    return { error: "Bitte ein Startdatum angeben." };
  }
  if (geltungsbereich === "AERZTIN" && !aerztinId) {
    return { error: "Bitte eine Ärztin wählen." };
  }

  const ergebnis = await legeAbwesenheitAn(prisma, {
    von: new Date(`${von}T00:00:00`),
    bis: new Date(`${bis}T00:00:00`),
    geltungsbereich,
    art,
    aerztinId,
  });

  if (!ergebnis.ok) {
    return { error: ergebnis.grund };
  }

  revalidatePath("/abwesenheit");
  revalidatePath("/plan");
  revalidatePath("/buchen");

  return { erfolg: { betroffeneTermine: ergebnis.betroffeneTermine } };
}
