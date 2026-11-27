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
