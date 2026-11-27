"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { gibRezeptFrei, legeRezeptantragAn } from "@/lib/rezept";
import { darfRezeptFreigeben, darfRezeptantragAnlegen } from "@/lib/rules";

export type FormState = { error?: string; ok?: string };

function rolleAus(formData: FormData): "MFA" | "AERZTIN" {
  return formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
}

export async function anlegenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR3: den Antrag legt die MFA an.
  if (!darfRezeptantragAnlegen(rolleAus(formData))) {
    return { error: "Nur die MFA darf Rezeptanträge anlegen." };
  }

  const nummer = String(formData.get("nummer") ?? "").trim();
  const notiz = String(formData.get("notiz") ?? "");
  const angelegtVonId = Number(formData.get("angelegtVonId"));

  if (!nummer) return { error: "Bitte die Patient:innennummer eingeben." };
  if (!angelegtVonId) return { error: "Bitte auswählen, wer den Antrag anlegt." };

  const ergebnis = await legeRezeptantragAn(prisma, {
    nummer,
    angelegtVonId,
    notiz,
  });
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/rezepte");
  return { ok: "Rezeptantrag angelegt." };
}

export async function freigebenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR3: freigeben darf nur eine Aerzt:in (Arztvorbehalt).
  if (!darfRezeptFreigeben(rolleAus(formData))) {
    return { error: "Nur eine Ärztin oder ein Arzt darf freigeben." };
  }

  const antragId = Number(formData.get("antragId"));
  const aerztinId = Number(formData.get("aerztinId"));
  if (!antragId || !aerztinId) {
    return { error: "Bitte eine Ärztin oder einen Arzt wählen." };
  }

  const ergebnis = await gibRezeptFrei(prisma, antragId, aerztinId);
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/rezepte");
  return { ok: "Rezept freigegeben." };
}
