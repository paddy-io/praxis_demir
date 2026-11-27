"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { bucheOnlineTermin } from "@/lib/buchen";

export type BuchFormState = {
  error?: string;
  erfolg?: { aerztin: string; datum: string; beginn: string };
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
    include: { aerztin: true, slot: true },
  });

  revalidatePath("/buchen");

  return {
    erfolg: {
      aerztin: termin?.aerztin.name ?? "",
      datum: termin ? termin.slot.datum.toLocaleDateString("de-DE") : "",
      beginn: termin?.slot.beginn ?? "",
    },
  };
}
