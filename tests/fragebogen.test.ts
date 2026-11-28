import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fragebogenFuer,
  hatFragebogen,
  formatiereFragebogenNotiz,
} from "../lib/rules.ts";

// --- Fragen passen zur Terminart ---

test("F-011: Vorsorge und Impfung haben unterschiedliche Fragen", () => {
  const vorsorge = fragebogenFuer("Vorsorge").map((f) => f.feld);
  const impfung = fragebogenFuer("Impfung").map((f) => f.feld);
  assert.ok(vorsorge.includes("beschwerdebeginn"));
  assert.ok(impfung.includes("impfung"));
  assert.notDeepEqual(vorsorge, impfung);
});

test("F-011: nur die online buchbaren Terminarten haben einen Fragebogen", () => {
  for (const art of ["Vorsorge", "Beratung", "Impfung", "Rezept-Abholung"]) {
    assert.equal(hatFragebogen(art), true, `${art} sollte einen Fragebogen haben`);
  }
  for (const art of ["Akut", "Blutabnahme", "Erstgespraech"]) {
    assert.equal(hatFragebogen(art), false, `${art} sollte keinen haben`);
  }
});

// --- Notiz-Format ---

test("F-011: die Notiz enthaelt nur beantwortete Felder", () => {
  const notiz = formatiereFragebogenNotiz("Vorsorge", {
    besuchsgrund: "Rückenschmerzen",
    beschwerdebeginn: "seit 3 Tagen",
    medikamente: "  ",
  });
  assert.match(notiz, /Besuchsgrund: Rückenschmerzen/);
  assert.match(notiz, /Seit wann bestehen die Beschwerden\?: seit 3 Tagen/);
  assert.doesNotMatch(notiz, /Medikamente/);
});

test("F-011: ohne Antworten bleibt die Notiz leer", () => {
  assert.equal(formatiereFragebogenNotiz("Vorsorge", {}), "");
});

test("F-011: die Notiz nennt die Fragen der gewaehlten Terminart", () => {
  const notiz = formatiereFragebogenNotiz("Impfung", {
    impfung: "Tetanus",
    impfpass: "ja",
  });
  assert.match(notiz, /Welche Impfung\?: Tetanus/);
  assert.match(notiz, /Impfpass dabei\?: ja/);
  assert.doesNotMatch(notiz, /Beschwerden/);
});
