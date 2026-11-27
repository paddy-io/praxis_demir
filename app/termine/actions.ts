"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { aendereTermin, erfasseTermin, sageTerminAb } from "@/lib/terminverwaltung";
import { darfTerminVerwalten } from "@/lib/rules";

export type FormState = { error?: string; ok?: string };

function rolleAus(formData: FormData) {
  return formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
}

export async function erfassenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR7: Termine erfasst nur die MFA. Die echte Anmeldung folgt spaeter.
  if (!darfTerminVerwalten(rolleAus(formData))) {
    return { error: "Nur die MFA darf Termine erfassen." };
  }

  const nummer = String(formData.get("nummer") ?? "").trim();
  const terminartId = Number(formData.get("terminartId"));
  const slotId = Number(formData.get("slotId"));
  const kanal = formData.get("kanal") === "TRESEN" ? "TRESEN" : "TELEFON";
  const dringlichkeit = String(formData.get("dringlichkeit") ?? "");
  const erfasstVonId = Number(formData.get("erfasstVonId")) || null;

  if (!nummer) return { error: "Bitte die Patientennummer eingeben." };
  if (!terminartId) return { error: "Bitte eine Terminart wählen." };
  if (!slotId) return { error: "Bitte einen Slot wählen." };

  const ergebnis = await erfasseTermin(prisma, {
    nummer,
    terminartId,
    slotId,
    kanal,
    dringlichkeit,
    erfasstVonId,
  });
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/termine");
  revalidatePath("/plan");
  return { ok: "Termin erfasst." };
}

export async function aendernAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!darfTerminVerwalten(rolleAus(formData))) {
    return { error: "Nur die MFA darf Termine ändern." };
  }

  const terminId = Number(formData.get("terminId"));
  const slotId = Number(formData.get("slotId"));
  const terminartId = Number(formData.get("terminartId"));
  if (!terminId || !slotId || !terminartId) {
    return { error: "Bitte Terminart und neuen Slot wählen." };
  }

  const ergebnis = await aendereTermin(prisma, terminId, { slotId, terminartId });
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/termine");
  revalidatePath("/plan");
  return { ok: "Termin umgebucht." };
}

export async function absagenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!darfTerminVerwalten(rolleAus(formData))) {
    return { error: "Nur die MFA darf Termine absagen." };
  }

  const terminId = Number(formData.get("terminId"));
  if (!terminId) return { error: "Kein Termin gewählt." };

  const ergebnis = await sageTerminAb(prisma, terminId);
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/termine");
  revalidatePath("/plan");
  return { ok: "Termin abgesagt." };
}
