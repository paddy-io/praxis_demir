// Buchungsregeln fuer die Online-Buchung (F-002). Die reinen Pruefungen sind
// ohne Datenbank testbar; das eigentliche Buchen laeuft in einer Transaktion,
// damit BR5 ("ein Slot, ein Termin") auch bei gleichzeitigen Anfragen haelt.

import { istOnlineBuchbar } from "./rules.ts";

export type BuchbaresPatient = {
  status: string;
  onlineBuchungGesperrt: boolean;
};

export type BuchbareTerminart = {
  bezeichnung: string;
  onlineBuchbar: boolean;
};

export type PruefErgebnis = { ok: true } | { ok: false; grund: string };

const OK: PruefErgebnis = { ok: true };

// BR9: Ohne eindeutige Identifikation ist keine Buchung moeglich.
export function pruefeIdentifikation(
  patient: { id: number } | null | undefined,
): PruefErgebnis {
  if (!patient) {
    return { ok: false, grund: "Kein Patient mit dieser Nummer gefunden." };
  }
  return OK;
}

// BR9/Annahme: online buchen nur Bestandspatient:innen ohne Sperre.
export function pruefePatient(patient: BuchbaresPatient): PruefErgebnis {
  if (patient.onlineBuchungGesperrt) {
    return { ok: false, grund: "Die Online-Buchung ist für diese Person gesperrt." };
  }
  if (patient.status !== "BESTAND") {
    return {
      ok: false,
      grund: "Online buchen können nur Bestandspatient:innen. Bitte telefonisch.",
    };
  }
  return OK;
}

// BR6: nur Vorsorge, Beratung, Impfung und Rezept-Abholung sind online buchbar.
export function pruefeTerminart(terminart: BuchbareTerminart): PruefErgebnis {
  if (!terminart.onlineBuchbar || !istOnlineBuchbar(terminart.bezeichnung)) {
    return {
      ok: false,
      grund: "Diese Terminart ist nicht online buchbar. Bitte telefonisch.",
    };
  }
  return OK;
}

// Fasst alle Vorabpruefungen zusammen. Erste Verletzung gewinnt.
export function pruefeBuchung(
  patient: BuchbaresPatient,
  terminart: BuchbareTerminart,
): PruefErgebnis {
  for (const ergebnis of [pruefePatient(patient), pruefeTerminart(terminart)]) {
    if (!ergebnis.ok) return ergebnis;
  }
  return OK;
}
