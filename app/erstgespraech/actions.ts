"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { erfasseErstgespraech } from "@/lib/erstgespraech";
import { darfErstgespraechVorklaeren } from "@/lib/rules";

export type FormState = { error?: string; ok?: string };

export async function erstgespraechAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR8: die Vorklaerung macht die MFA.
  const rolle = formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
  if (!darfErstgespraechVorklaeren(rolle)) {
    return { error: "Nur die MFA führt die Vorklärung durch." };
  }

  const modus = String(formData.get("modus") ?? "bestand");
  const nummer = String(formData.get("nummer") ?? "");
  const mfaId = Number(formData.get("mfaId"));
  const aerztinId = Number(formData.get("aerztinId"));
  const slotId = Number(formData.get("slotId"));
  const situation = String(formData.get("situation") ?? "");
  const dringlichkeit = String(formData.get("dringlichkeit") ?? "");
  const aufnahmeMoeglich = formData.get("aufnahmeMoeglich") === "on";

  const neuerPatient =
    modus === "neu"
      ? {
          name: String(formData.get("name") ?? ""),
          versicherungsart:
            formData.get("versicherungsart") === "PRIVAT"
              ? ("PRIVAT" as const)
              : ("GESETZLICH" as const),
          nummer: String(formData.get("neueNummer") ?? ""),
        }
      : null;

  if (!mfaId) return { error: "Bitte auswählen, wer die Vorklärung macht." };
  if (!slotId) return { error: "Bitte einen freien Slot wählen." };

  const ergebnis = await erfasseErstgespraech(prisma, {
    nummer,
    neuerPatient,
    mfaId,
    aerztinId,
    slotId,
    situation,
    dringlichkeit,
    aufnahmeMoeglich,
  });
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidatePath("/erstgespraech");
  revalidatePath("/termine");
  revalidatePath("/plan");
  return { ok: "Erstgespräch erfasst und Termin vergeben." };
}
