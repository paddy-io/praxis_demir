import { test } from "node:test";
import assert from "node:assert/strict";
import {
  darfTerminVerwalten,
  terminAenderbar,
  terminAbsagbar,
} from "../lib/rules.ts";

// --- BR7 Berechtigungen ---

test("BR7: nur die MFA darf Termine verwalten", () => {
  assert.equal(darfTerminVerwalten("MFA"), true);
  assert.equal(darfTerminVerwalten("AERZTIN"), false);
});

// --- Terminzustaende ---

test("BR5/BR7: gebuchte und betroffene Termine sind aenderbar", () => {
  assert.equal(terminAenderbar("GEBUCHT"), true);
  assert.equal(terminAenderbar("BETROFFEN"), true);
});

test("BR5/BR7: abgesagte, erschienene und No-Show-Termine sind nicht aenderbar", () => {
  for (const status of ["ABSAGT", "ERSCHIENEN", "NO_SHOW"]) {
    assert.equal(terminAenderbar(status), false, `${status} darf nicht aenderbar sein`);
    assert.equal(terminAbsagbar(status), false, `${status} darf nicht absagbar sein`);
  }
});

test("BR5/BR7: ein gebuchter Termin ist absagbar", () => {
  assert.equal(terminAbsagbar("GEBUCHT"), true);
});
