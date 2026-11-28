import { test } from "node:test";
import assert from "node:assert/strict";
import {
  darfErstgespraechVorklaeren,
  pruefeVorklaerung,
  darfTerminVergeben,
  istOnlineBuchbar,
} from "../lib/rules.ts";

// --- BR8 Berechtigung und Pflichtangaben ---

test("BR8: nur die MFA fuehrt die Vorklaerung durch", () => {
  assert.equal(darfErstgespraechVorklaeren("MFA"), true);
  assert.equal(darfErstgespraechVorklaeren("AERZTIN"), false);
});

test("BR8: eine vollstaendige Vorklaerung wird akzeptiert", () => {
  const ergebnis = pruefeVorklaerung({
    situation: "Abklärung",
    dringlichkeit: "normal",
    aerztinId: 1,
  });
  assert.equal(ergebnis.ok, true);
});

test("BR8: ohne Situation wird die Vorklaerung abgelehnt", () => {
  assert.equal(
    pruefeVorklaerung({ situation: "  ", dringlichkeit: "normal", aerztinId: 1 }).ok,
    false,
  );
});

test("BR8: ohne Dringlichkeit wird die Vorklaerung abgelehnt", () => {
  assert.equal(
    pruefeVorklaerung({ situation: "x", dringlichkeit: "", aerztinId: 1 }).ok,
    false,
  );
});

test("BR8: ohne Aerztin wird die Vorklaerung abgelehnt", () => {
  assert.equal(
    pruefeVorklaerung({ situation: "x", dringlichkeit: "normal", aerztinId: null }).ok,
    false,
  );
});

test("BR8: ohne 'Aufnahme moeglich' wird kein Termin vergeben", () => {
  assert.equal(darfTerminVergeben(true), true);
  assert.equal(darfTerminVergeben(false), false);
});

// --- BR6 Erstgespraech ist nicht online buchbar ---

test("BR6: Erstgespraech ist nicht online buchbar", () => {
  assert.equal(istOnlineBuchbar("Erstgespraech"), false);
});
