import { test } from "node:test";
import assert from "node:assert/strict";
import {
  zaehleNoShows,
  noShowEskalation,
  erinnerungsKanal,
  fensterBeginn,
  type NoShowEintrag,
} from "../lib/rules.ts";

const heute = new Date("2026-11-27T00:00:00");

function noShow(monateZurueck: number, grund: string | null = null): NoShowEintrag {
  const d = new Date(heute);
  d.setMonth(d.getMonth() - monateZurueck);
  return { status: "NO_SHOW", noShowAm: d, triftigerGrund: grund };
}

// --- BR2 rollierendes 12-Monats-Fenster ---

test("BR2: No-Shows im Fenster werden gezaehlt", () => {
  assert.equal(zaehleNoShows([noShow(1), noShow(5)], heute), 2);
});

test("BR2: Faelle aelter als 12 Monate zaehlen nicht", () => {
  assert.equal(zaehleNoShows([noShow(13), noShow(20)], heute), 0);
  assert.equal(zaehleNoShows([noShow(11), noShow(13)], heute), 1);
});

test("BR2: ein triftiger Grund erhoeht den Zaehler nicht", () => {
  assert.equal(zaehleNoShows([noShow(1, "Notfall"), noShow(2)], heute), 1);
});

test("BR2: nur NO_SHOW-Termine zaehlen", () => {
  const gebucht: NoShowEintrag = {
    status: "GEBUCHT",
    noShowAm: heute,
    triftigerGrund: null,
  };
  assert.equal(zaehleNoShows([gebucht], heute), 0);
});

test("BR2: der Fensterbeginn liegt 12 Monate zurueck", () => {
  assert.equal(fensterBeginn(heute).getFullYear(), 2025);
  assert.equal(fensterBeginn(heute).getMonth(), heute.getMonth());
});

// --- BR2 Eskalation ---

test("BR2: der zweite No-Show loest die Erinnerung aus", () => {
  const e = noShowEskalation(2);
  assert.equal(e.erinnerungFaellig, true);
  assert.equal(e.sperreFaellig, false);
});

test("BR2: der dritte No-Show macht die Sperre faellig", () => {
  const e = noShowEskalation(3);
  assert.equal(e.sperreFaellig, true);
  assert.equal(e.erinnerungFaellig, false);
});

test("BR2: vor dem zweiten No-Show passiert nichts", () => {
  for (const anzahl of [0, 1]) {
    const e = noShowEskalation(anzahl);
    assert.equal(e.erinnerungFaellig, false);
    assert.equal(e.sperreFaellig, false);
  }
});

// --- BR2 Erinnerungskanal je Opt-in ---

test("BR2: die Erinnerung geht per E-Mail nur mit Opt-in", () => {
  assert.equal(erinnerungsKanal(true), "EMAIL");
  assert.equal(erinnerungsKanal(false), "BRIEF");
});
