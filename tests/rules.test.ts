import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ONLINE_BUCHBARE_TERMINARTEN,
  istOnlineBuchbar,
  darfTerminplanPflegen,
  freieAkutslots,
  akutslotsVerfuegbar,
  akutHinweis,
} from "../lib/rules.ts";

// --- BR6 Online-Buchbarkeit ---

test("BR6: Vorsorge, Beratung, Impfung und Rezept-Abholung sind online buchbar", () => {
  for (const art of ["Vorsorge", "Beratung", "Impfung", "Rezept-Abholung"]) {
    assert.equal(istOnlineBuchbar(art), true, `${art} sollte online buchbar sein`);
  }
});

test("BR6: Akut, Blutabnahme und Erstgespraech sind nicht online buchbar", () => {
  for (const art of ["Akut", "Blutabnahme", "Erstgespraech"]) {
    assert.equal(istOnlineBuchbar(art), false, `${art} darf nicht online buchbar sein`);
  }
});

test("BR6: nur vier Terminarten sind online buchbar", () => {
  assert.equal(ONLINE_BUCHBARE_TERMINARTEN.length, 4);
});

// --- BR7 Berechtigungen ---

test("BR7: die MFA darf den Terminplan pflegen", () => {
  assert.equal(darfTerminplanPflegen("MFA"), true);
});

test("BR7: eine Aerztin darf den Terminplan nicht pflegen", () => {
  assert.equal(darfTerminplanPflegen("AERZTIN"), false);
});

// --- BR1 Akut-Kontingent ---

test("BR1: solange Kontingent frei ist, gibt es freie Akutslots", () => {
  assert.equal(akutslotsVerfuegbar(2, 0), true);
  assert.equal(akutslotsVerfuegbar(2, 1), true);
  assert.equal(akutHinweis(2, 1), "Akutslots frei");
});

test("BR1: ist das Kontingent voll, zeigt die App 'keine Akutslots frei'", () => {
  assert.equal(akutslotsVerfuegbar(2, 2), false);
  assert.equal(akutHinweis(2, 2), "keine Akutslots frei");
});

test("BR1: freie Akutslots werden nie negativ", () => {
  assert.equal(freieAkutslots(2, 5), 0);
});

test("BR1: das Kontingent ist konfigurierbar (SPEC nennt keine Zahl)", () => {
  assert.equal(akutslotsVerfuegbar(5, 4), true);
  assert.equal(akutslotsVerfuegbar(5, 5), false);
});
