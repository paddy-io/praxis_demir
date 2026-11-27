"use server";

import { revalidatePath } from "next/cache";
import { createSlot, type NeuerSlot } from "@/lib/data";
import { darfTerminplanPflegen } from "@/lib/rules";

export type FormState = { error?: string; ok?: boolean };

export async function slotAnlegenAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR7: den Terminplan pflegt nur die MFA. Hier kommt spaeter die echte
  // Anmeldung; bis dahin wird die Rolle bewusst uebergeben.
  const rolle = formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
  if (!darfTerminplanPflegen(rolle)) {
    return { error: "Nur die MFA darf den Terminplan pflegen." };
  }

  const aerztinId = Number(formData.get("aerztinId"));
  const datum = String(formData.get("datum") ?? "");
  const beginn = String(formData.get("beginn") ?? "");
  const halbtag = String(formData.get("halbtag") ?? "VORMITTAG") as NeuerSlot["halbtag"];
  const art = String(formData.get("art") ?? "NORMAL") as NeuerSlot["art"];

  if (!aerztinId || !datum || !beginn) {
    return { error: "Bitte Ärztin, Datum und Uhrzeit angeben." };
  }
  if (!/^\d{2}:\d{2}$/.test(beginn)) {
    return { error: "Die Uhrzeit muss im Format HH:MM stehen." };
  }

  try {
    await createSlot({ aerztinId, datum, beginn, halbtag, art });
  } catch {
    return { error: "Für diese Ärztin gibt es an dem Tag schon einen Slot zu der Uhrzeit." };
  }

  revalidatePath("/plan");
  return { ok: true };
}
