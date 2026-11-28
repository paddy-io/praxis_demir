import { test } from "node:test";
import assert from "node:assert/strict";
import {
  darfNachtragErfassen,
  pruefeNachtrag,
  nachtragBelegtSlot,
} from "../lib/rules.ts";

// --- BR7 Berechtigung ---

test("BR7: nur die MFA darf einen Nachtrag erfassen", () => {
  assert.equal(darfNachtragErfassen("MFA"), true);
  assert.equal(darfNachtragErfassen("AERZTIN"), false);
});

// --- BR1 Pflichtangaben ---

test("BR1: ein Nachtrag mit Datum und Absprache wird akzeptiert", () => {
  assert.equal(
    pruefeNachtrag({ datum: new Date("2026-12-01T00:00:00"), abspracheMitId: 1 }).ok,
    true,
  );
});

test("BR1: ohne Datum wird der Nachtrag abgelehnt", () => {
  assert.equal(pruefeNachtrag({ datum: null, abspracheMitId: 1 }).ok, false);
});

test("BR1: ohne Absprache wird der Nachtrag abgelehnt", () => {
  assert.equal(
    pruefeNachtrag({ datum: new Date("2026-12-01T00:00:00"), abspracheMitId: null }).ok,
    false,
  );
});

// --- W2 Nachtrag belegt keinen Slot ---

test("W2: ein Nachtrag belegt keinen Slot", () => {
  assert.equal(nachtragBelegtSlot(), false);
});
