import { test } from "node:test";
import assert from "node:assert/strict";
import {
  darfRezeptantragAnlegen,
  darfRezeptFreigeben,
  aerztinAbwesend,
  type AbwesenheitsRegel,
} from "../lib/rules.ts";

// --- BR3 Berechtigungen ---

test("BR3: nur die MFA darf einen Rezeptantrag anlegen", () => {
  assert.equal(darfRezeptantragAnlegen("MFA"), true);
  assert.equal(darfRezeptantragAnlegen("AERZTIN"), false);
});

test("BR3: nur eine Aerzt:in darf freigeben (Arztvorbehalt)", () => {
  assert.equal(darfRezeptFreigeben("AERZTIN"), true);
  assert.equal(darfRezeptFreigeben("MFA"), false);
});

// --- BR3 Abwesenheit bei der Freigabe ---

const urlaub: AbwesenheitsRegel = {
  von: new Date("2026-12-01T00:00:00"),
  bis: new Date("2026-12-03T00:00:00"),
  geltungsbereich: "AERZTIN",
  aerztinId: 1,
};

const schliessung: AbwesenheitsRegel = {
  von: new Date("2026-12-24T00:00:00"),
  bis: new Date("2026-12-24T00:00:00"),
  geltungsbereich: "PRAXIS",
  aerztinId: null,
};

test("BR3: eine abwesende Aerztin kann nicht freigeben", () => {
  assert.equal(aerztinAbwesend([urlaub], 1, new Date("2026-12-02T00:00:00")), true);
});

test("BR3: eine anwesende Kollegin kann freigeben", () => {
  assert.equal(aerztinAbwesend([urlaub], 2, new Date("2026-12-02T00:00:00")), false);
});

test("BR3: eine Praxisschliessung sperrt die Freigabe fuer alle", () => {
  assert.equal(aerztinAbwesend([schliessung], 1, new Date("2026-12-24T00:00:00")), true);
  assert.equal(aerztinAbwesend([schliessung], 3, new Date("2026-12-24T00:00:00")), true);
});
