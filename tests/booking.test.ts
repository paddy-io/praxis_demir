import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pruefeIdentifikation,
  pruefePatient,
  pruefeTerminart,
  pruefeBuchung,
} from "../lib/booking.ts";

// --- BR9 Identifikation ---

test("BR9: ohne gefundenen Patienten ist keine Buchung möglich", () => {
  const ergebnis = pruefeIdentifikation(null);
  assert.equal(ergebnis.ok, false);
});

test("BR9: mit gefundenem Patienten ist die Identifikation erfüllt", () => {
  assert.equal(pruefeIdentifikation({ id: 1 }).ok, true);
});

// --- BR9 / Annahme: nur Bestandspatient:innen, keine Sperre ---

test("BR9: gesperrte Online-Buchung verhindert die Buchung", () => {
  const ergebnis = pruefePatient({ status: "BESTAND", onlineBuchungGesperrt: true });
  assert.equal(ergebnis.ok, false);
});

test("Annahme: Neupatient:innen können nicht online buchen", () => {
  const ergebnis = pruefePatient({ status: "NEU", onlineBuchungGesperrt: false });
  assert.equal(ergebnis.ok, false);
});

test("Bestandspatient:in ohne Sperre darf buchen", () => {
  assert.equal(
    pruefePatient({ status: "BESTAND", onlineBuchungGesperrt: false }).ok,
    true,
  );
});

// --- BR6 Online-Buchbarkeit ---

test("BR6: nur online buchbare Terminarten sind erlaubt", () => {
  assert.equal(pruefeTerminart({ bezeichnung: "Vorsorge", onlineBuchbar: true }).ok, true);
  assert.equal(pruefeTerminart({ bezeichnung: "Akut", onlineBuchbar: false }).ok, false);
});

test("BR6: eine als online markierte, aber nicht erlaubte Terminart wird abgewiesen", () => {
  // Verteidigung gegen falsch gepflegte Daten.
  assert.equal(
    pruefeTerminart({ bezeichnung: "Blutabnahme", onlineBuchbar: true }).ok,
    false,
  );
});

// --- Kombinierte Prüfung ---

test("pruefeBuchung: erste Verletzung gewinnt", () => {
  const ergebnis = pruefeBuchung(
    { status: "BESTAND", onlineBuchungGesperrt: true },
    { bezeichnung: "Akut", onlineBuchbar: false },
  );
  assert.equal(ergebnis.ok, false);
  if (!ergebnis.ok) {
    assert.match(ergebnis.grund, /gesperrt/);
  }
});
