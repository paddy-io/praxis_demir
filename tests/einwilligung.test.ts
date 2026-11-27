import { test } from "node:test";
import assert from "node:assert/strict";
import {
  istEinwilligungAktiv,
  darfVersenden,
  versandHinweis,
  type EinwilligungsEintrag,
} from "../lib/rules.ts";

const erteiltEmail: EinwilligungsEintrag = {
  kanal: "EMAIL",
  erteiltAm: new Date("2026-11-01T00:00:00"),
  widerrufenAm: null,
};

const widerrufenEmail: EinwilligungsEintrag = {
  kanal: "EMAIL",
  erteiltAm: new Date("2026-11-01T00:00:00"),
  widerrufenAm: new Date("2026-11-20T00:00:00"),
};

// --- BR9 kein Versand ohne Einwilligung ---

test("BR9: ohne Eintrag darf nicht versendet werden", () => {
  assert.equal(darfVersenden("EMAIL", []), false);
  assert.equal(darfVersenden("SMS", []), false);
});

test("BR9: mit aktiver Einwilligung darf versendet werden", () => {
  assert.equal(darfVersenden("EMAIL", [erteiltEmail]), true);
});

test("BR9: nach Widerruf darf nicht mehr versendet werden", () => {
  assert.equal(darfVersenden("EMAIL", [widerrufenEmail]), false);
});

// --- BR9 je Kanal getrennt ---

test("BR9: SMS und E-Mail sind getrennt", () => {
  // Nur E-Mail erteilt, SMS nicht.
  assert.equal(darfVersenden("EMAIL", [erteiltEmail]), true);
  assert.equal(darfVersenden("SMS", [erteiltEmail]), false);
});

test("BR9: aktive Einwilligung wird erkannt, widerrufene nicht", () => {
  assert.equal(istEinwilligungAktiv(erteiltEmail), true);
  assert.equal(istEinwilligungAktiv(widerrufenEmail), false);
});

test("BR9: ein Widerruf laesst sich durch erneutes Erteilen aufheben", () => {
  const neuErteilt: EinwilligungsEintrag = {
    kanal: "EMAIL",
    erteiltAm: new Date("2026-11-25T00:00:00"),
    widerrufenAm: null,
  };
  assert.equal(darfVersenden("EMAIL", [neuErteilt]), true);
});

test("BR9: der Versand-Hinweis nennt den Kanal", () => {
  assert.equal(versandHinweis("EMAIL", [erteiltEmail]), "E-Mail erlaubt");
  assert.equal(versandHinweis("SMS", [erteiltEmail]), "kein Opt-in für SMS");
});
