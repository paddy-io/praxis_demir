"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSlot, type NeuerSlot } from "@/lib/data";
import { hatAkutPlatz, setAkutKontingent } from "@/lib/akut";
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

  // BR1: Akutslots sind je Halbtag begrenzt.
  if (art === "AKUT") {
    const platz = await hatAkutPlatz(prisma, new Date(`${datum}T00:00:00`), halbtag);
    if (!platz.platzFrei) {
      return {
        error: `Akut-Kontingent für diesen Halbtag erreicht (${platz.angelegt}/${platz.kontingent}).`,
      };
    }
  }

  try {
    await createSlot({ aerztinId, datum, beginn, halbtag, art });
  } catch {
    return { error: "Für diese Ärztin gibt es an dem Tag schon einen Slot zu der Uhrzeit." };
  }

  revalidatePath("/plan");
  return { ok: true };
}

export async function kontingentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const rolle = formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
  if (!darfTerminplanPflegen(rolle)) {
    return { error: "Nur die MFA darf das Kontingent ändern." };
  }

  const wert = Number(formData.get("akutKontingent"));
  if (!Number.isFinite(wert) || wert < 0) {
    return { error: "Bitte eine Zahl ab 0 angeben." };
  }

  await setAkutKontingent(prisma, wert);
  revalidatePath("/plan");
  return { ok: true };
}
