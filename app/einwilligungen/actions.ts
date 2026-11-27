"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { erteileEinwilligung, widerrufeEinwilligung } from "@/lib/einwilligung";
import { darfTerminplanPflegen } from "@/lib/rules";

export type FormState = { error?: string; ok?: string };

export async function einwilligungAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // BR7: Einwilligungen pflegt die MFA. Die echte Anmeldung folgt spaeter.
  const rolle = formData.get("rolle") === "AERZTIN" ? "AERZTIN" : "MFA";
  if (!darfTerminplanPflegen(rolle)) {
    return { error: "Nur die MFA darf Einwilligungen pflegen." };
  }

  const patientId = Number(formData.get("patientId"));
  const kanal = formData.get("kanal") === "SMS" ? "SMS" : "EMAIL";
  const aktion = String(formData.get("aktion") ?? "erteilen");

  if (!patientId) {
    return { error: "Keine Patient:in gewählt." };
  }

  if (aktion === "widerrufen") {
    await widerrufeEinwilligung(prisma, patientId, kanal);
  } else {
    await erteileEinwilligung(prisma, patientId, kanal);
  }

  revalidatePath("/einwilligungen");
  return {
    ok:
      aktion === "widerrufen"
        ? `Einwilligung für ${kanal} widerrufen.`
        : `Einwilligung für ${kanal} erteilt.`,
  };
}
