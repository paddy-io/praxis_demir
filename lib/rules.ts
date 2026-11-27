// Fachliche Regeln als reine Funktionen. Bewusst ohne Datenbank, damit sie
// schnell und ohne Nebenwirkungen testbar sind. Die Oberflaeche ruft sie auf.

// --- BR6 Online-Buchbarkeit (SPEC 4) ---
// Online buchbar sind nur diese Terminarten. Akut, Blutabnahme und
// Erstgespraech bleiben beim Telefon.
export const ONLINE_BUCHBARE_TERMINARTEN = [
  "Vorsorge",
  "Beratung",
  "Impfung",
  "Rezept-Abholung",
] as const;

export function istOnlineBuchbar(bezeichnung: string): boolean {
  return (ONLINE_BUCHBARE_TERMINARTEN as readonly string[]).includes(bezeichnung);
}

// --- BR7 Berechtigungen (SPEC 4) ---
// Termine eintragen, aendern und absagen darf nur die MFA. Alle MFAs sind
// gleichberechtigt, also genuegt die Rolle.
export type Rolle = "MFA" | "AERZTIN";

export function darfTerminplanPflegen(rolle: Rolle): boolean {
  return rolle === "MFA";
}

// --- BR1 Akut-Kontingent (SPEC 4) ---
// Akutslots sind pro Vormittag und Nachmittag begrenzt. Sind sie voll, zeigt
// die App "keine Akutslots frei". Die Hoehe des Kontingents nennt die SPEC
// nicht, sie ist deshalb konfigurierbar.
export const AKUT_KONTINGENT_PRO_HALBTAG = 2;

export type Halbtag = "VORMITTAG" | "NACHMITTAG";

export function freieAkutslots(
  kontingent: number,
  belegteAkutslots: number,
): number {
  const frei = kontingent - belegteAkutslots;
  return frei > 0 ? frei : 0;
}

export function akutslotsVerfuegbar(
  kontingent: number,
  belegteAkutslots: number,
): boolean {
  return freieAkutslots(kontingent, belegteAkutslots) > 0;
}

export function akutHinweis(
  kontingent: number,
  belegteAkutslots: number,
): string {
  return akutslotsVerfuegbar(kontingent, belegteAkutslots)
    ? "Akutslots frei"
    : "keine Akutslots frei";
}

// --- BR4 Abwesenheit und Praxisschliessung (SPEC 4) ---
// Eine Abwesenheit sperrt nur die Slots der betroffenen Aerzt:in. Eine
// Praxisschliessung sperrt alle Slots des Tages. Die Pruefung ist taggenau und
// bewusst ohne Datenbank, damit sie testbar bleibt.

export type AbwesenheitsRegel = {
  von: Date;
  bis: Date;
  geltungsbereich: "AERZTIN" | "PRAXIS";
  aerztinId: number | null;
};

export type SlotBezug = {
  datum: Date;
  aerztinId: number;
};

// Taggenau: eine Abwesenheit deckt alle Tage von `von` bis `bis` (inklusive) ab.
function tagImZeitraum(tag: Date, von: Date, bis: Date): boolean {
  const t = new Date(tag).setHours(0, 0, 0, 0);
  const a = new Date(von).setHours(0, 0, 0, 0);
  const b = new Date(bis).setHours(0, 0, 0, 0);
  return t >= a && t <= b;
}

export function abwesenheitSperrtSlot(
  abwesenheiten: AbwesenheitsRegel[],
  slot: SlotBezug,
): boolean {
  return abwesenheiten.some((abwesenheit) => {
    if (!tagImZeitraum(slot.datum, abwesenheit.von, abwesenheit.bis)) {
      return false;
    }
    if (abwesenheit.geltungsbereich === "PRAXIS") {
      return true;
    }
    return abwesenheit.aerztinId === slot.aerztinId;
  });
}

export function findeBetroffeneSlots<T extends SlotBezug>(
  abwesenheiten: AbwesenheitsRegel[],
  slots: T[],
): T[] {
  return slots.filter((slot) => abwesenheitSperrtSlot(abwesenheiten, slot));
}

export type TerminBezug = {
  slot: SlotBezug;
};

export function findeBetroffeneTermine<T extends TerminBezug>(
  abwesenheiten: AbwesenheitsRegel[],
  termine: T[],
): T[] {
  return termine.filter((termin) => abwesenheitSperrtSlot(abwesenheiten, termin.slot));
}

// Geltungsbereich und aerztinId muessen zusammenpassen: eine Praxisschliessung
// hat keine Aerzt:in, eine Aerzt:in-Abwesenheit braucht eine.
export function pruefeAbwesenheit(abwesenheit: {
  von: Date;
  bis: Date;
  geltungsbereich: "AERZTIN" | "PRAXIS";
  aerztinId: number | null;
}): { ok: true } | { ok: false; grund: string } {
  if (abwesenheit.bis < abwesenheit.von) {
    return { ok: false, grund: "Das Ende darf nicht vor dem Beginn liegen." };
  }
  if (abwesenheit.geltungsbereich === "PRAXIS" && abwesenheit.aerztinId != null) {
    return {
      ok: false,
      grund: "Eine Praxisschließung gilt für alle und hat keine einzelne Ärztin.",
    };
  }
  if (abwesenheit.geltungsbereich === "AERZTIN" && abwesenheit.aerztinId == null) {
    return {
      ok: false,
      grund: "Für eine Abwesenheit einer Ärztin muss eine Ärztin gewählt werden.",
    };
  }
  return { ok: true };
}

// --- BR9 Einwilligung (Opt-in) vor jedem Versand (SPEC 4) ---
// Standardmaessig wird nichts verschickt. SMS und E-Mail nur mit ausdruecklicher
// Zustimmung, getrennt je Kanal und widerrufbar. Ohne aktive Einwilligung kein
// Versand; ein fehlender Eintrag bedeutet keine Zustimmung.

export type EinwilligungsKanal = "SMS" | "EMAIL";

export type EinwilligungsEintrag = {
  kanal: EinwilligungsKanal;
  erteiltAm: Date;
  widerrufenAm: Date | null;
};

// Aktiv = erteilt und nicht widerrufen.
export function istEinwilligungAktiv(einwilligung: EinwilligungsEintrag): boolean {
  return einwilligung.widerrufenAm == null;
}

// BR9: darf an diese Person ueber diesen Kanal verschickt werden?
export function darfVersenden(
  kanal: EinwilligungsKanal,
  einwilligungen: EinwilligungsEintrag[],
): boolean {
  const eintrag = einwilligungen.find((e) => e.kanal === kanal);
  if (!eintrag) return false;
  return istEinwilligungAktiv(eintrag);
}

// Der Versand-Hinweis, den die Oberflaeche anzeigen kann.
export function versandHinweis(
  kanal: EinwilligungsKanal,
  einwilligungen: EinwilligungsEintrag[],
): string {
  return darfVersenden(kanal, einwilligungen)
    ? `${kanal === "EMAIL" ? "E-Mail" : "SMS"} erlaubt`
    : `kein Opt-in für ${kanal === "EMAIL" ? "E-Mail" : "SMS"}`;
}

// --- BR7 Terminverwaltung und Terminzustaende (SPEC 4) ---
// Termine eintragen, aendern und absagen darf nur die MFA. Nur gebuchte oder
// betroffene Termine lassen sich umbuchen oder absagen; abgesagte, erschienene
// und No-Show-Termine nicht.

export function darfTerminVerwalten(rolle: Rolle): boolean {
  return rolle === "MFA";
}

const AENDERBAR = ["GEBUCHT", "BETROFFEN"] as const;

export function terminAenderbar(status: string): boolean {
  return (AENDERBAR as readonly string[]).includes(status);
}

export function terminAbsagbar(status: string): boolean {
  return (AENDERBAR as readonly string[]).includes(status);
}
