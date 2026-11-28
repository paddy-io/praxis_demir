"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { bucheOnlineTermin } from "@/lib/buchen";
import { speichereFragebogen } from "@/lib/fragebogen";
import { fragebogenFuer } from "@/lib/rules";

export type BuchFormState = {
  error?: string;
  fragebogenGespeichert?: boolean;
  erfolg?: {
    terminId: number;
    aerztin: string;
    datum: string;
    beginn: string;
    terminart: string;
    // F-011: Fragen fuer den Vorab-Fragebogen (leer, wenn es keinen gibt).
    fragen: { feld: string; label: string }[];
  };
};

export async function buchenAction(
  _prev: BuchFormState,
  formData: FormData,
): Promise<BuchFormState> {
  const versicherungsart =
    formData.get("versicherungsart") === "PRIVAT" ? "PRIVAT" : "GESETZLICH";
  const nummer = String(formData.get("nummer") ?? "").trim();
  const slotId = Number(formData.get("slotId"));
  const terminartId = Number(formData.get("terminartId"));

  if (!nummer) {
    return {
      error:
        versicherungsart === "GESETZLICH"
          ? "Bitte die Versichertennummer eingeben."
          : "Bitte die Patientennummer eingeben.",
    };
  }
  if (!slotId) {
    return { error: "Bitte einen Termin auswählen." };
  }
  if (!terminartId) {
    return { error: "Bitte eine Terminart auswählen." };
  }

  const ergebnis = await bucheOnlineTermin(prisma, {
    versicherungsart,
    nummer,
    slotId,
    terminartId,
  });

  if (!ergebnis.ok) {
    return { error: ergebnis.grund };
  }

  const termin = await prisma.termin.findUnique({
    where: { id: ergebnis.terminId },
    include: { aerztin: true, slot: true, terminart: true },
  });

  revalidatePath("/buchen");

  return {
    erfolg: {
      terminId: ergebnis.terminId,
      aerztin: termin?.aerztin.name ?? "",
      datum: termin?.slot ? termin.slot.datum.toLocaleDateString("de-DE") : "",
      beginn: termin?.slot?.beginn ?? "",
      terminart: termin?.terminart.bezeichnung ?? "",
      fragen: fragebogenFuer(termin?.terminart.bezeichnung ?? ""),
    },
  };
}

// F-011: Antworten des Vorab-Fragebogens als Notiz am Termin speichern.
export async function fragebogenAction(
  _prev: BuchFormState,
  formData: FormData,
): Promise<BuchFormState> {
  const terminId = Number(formData.get("terminId"));
  if (!terminId) {
    return { error: "Kein Termin gefunden." };
  }

  const termin = await prisma.termin.findUnique({
    where: { id: terminId },
    include: { aerztin: true, slot: true, terminart: true },
  });
  if (!termin) {
    return { error: "Diesen Termin gibt es nicht." };
  }

  const antworten: Record<string, string> = {};
  for (const frage of fragebogenFuer(termin.terminart.bezeichnung)) {
    const wert = formData.get(`frage_${frage.feld}`);
    if (typeof wert === "string") antworten[frage.feld] = wert;
  }

  const ergebnis = await speichereFragebogen(prisma, terminId, antworten);
  if (!ergebnis.ok) {
    return { error: ergebnis.grund };
  }

  revalidatePath("/buchen");
  revalidatePath("/termine");

  return {
    fragebogenGespeichert: true,
    erfolg: {
      terminId,
      aerztin: termin.aerztin.name,
      datum: termin.slot ? termin.slot.datum.toLocaleDateString("de-DE") : "",
      beginn: termin.slot?.beginn ?? "",
      terminart: termin.terminart.bezeichnung,
      fragen: [],
    },
  };
}
