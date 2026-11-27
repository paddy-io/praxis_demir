"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  erfasseNoShow,
  erledigeErinnerung,
  hebeOnlineSperre,
  setzeOnlineSperre,
} from "@/lib/noshow";
import { darfTerminVerwalten } from "@/lib/rules";

export type FormState = { error?: string; ok?: string };

function istMfa(formData: FormData) {
  return darfTerminVerwalten(
    formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA",
  );
}

function revalidiere() {
  revalidatePath("/noshow");
  revalidatePath("/buchen");
  revalidatePath("/termine");
}

export async function noShowAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!istMfa(formData)) return { error: "Nur die MFA darf No-Shows erfassen." };

  const terminId = Number(formData.get("terminId"));
  if (!terminId) return { error: "Bitte einen Termin wählen." };
  const triftigerGrund = String(formData.get("triftigerGrund") ?? "");

  const ergebnis = await erfasseNoShow(prisma, terminId, { triftigerGrund });
  if (!ergebnis.ok) return { error: ergebnis.grund };

  revalidiere();
  const zusatz = ergebnis.erinnerungAngelegt
    ? " Erinnerungsaufgabe angelegt."
    : "";
  return {
    ok: `No-Show erfasst (${ergebnis.anzahl} im Fenster, Stufe ${ergebnis.stufe}).${zusatz}`,
  };
}

export async function sperreAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!istMfa(formData)) return { error: "Nur die MFA darf die Sperre ändern." };

  const patientId = Number(formData.get("patientId"));
  const aktion = String(formData.get("aktion") ?? "setzen");
  if (!patientId) return { error: "Keine Patient:in gewählt." };

  if (aktion === "heben") {
    await hebeOnlineSperre(prisma, patientId);
    revalidiere();
    return { ok: "Sperre aufgehoben." };
  }
  await setzeOnlineSperre(prisma, patientId);
  revalidiere();
  return { ok: "Sperre gesetzt." };
}

export async function erinnerungAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!istMfa(formData)) return { error: "Nur die MFA darf Erinnerungen erledigen." };

  const id = Number(formData.get("erinnerungId"));
  if (!id) return { error: "Keine Erinnerung gewählt." };

  await erledigeErinnerung(prisma, id);
  revalidiere();
  return { ok: "Erinnerung erledigt." };
}
