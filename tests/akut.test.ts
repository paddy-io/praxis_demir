import { test } from "node:test";
import assert from "node:assert/strict";
import {
  akutStatusFuerHalbtag,
  darfAkutslotAnlegen,
  freieAkutslots,
} from "../lib/rules.ts";

// --- BR1 Akut-Kontingent je Halbtag ---

test("BR1: unter dem Kontingent sind Akutslots frei", () => {
  const status = akutStatusFuerHalbtag(2, 0);
  assert.equal(status.platzFrei, true);
  assert.equal(status.frei, 2);
  assert.equal(status.hinweis, "Akutslots frei");
});

test("BR1: ist das Kontingent erreicht, zeigt die App 'keine Akutslots frei'", () => {
  const status = akutStatusFuerHalbtag(2, 2);
  assert.equal(status.platzFrei, false);
  assert.equal(status.frei, 0);
  assert.equal(status.hinweis, "keine Akutslots frei");
});

test("BR1: darfAkutslotAnlegen kippt genau am Kontingent", () => {
  assert.equal(darfAkutslotAnlegen(2, 0), true);
  assert.equal(darfAkutslotAnlegen(2, 1), true);
  assert.equal(darfAkutslotAnlegen(2, 2), false);
  assert.equal(darfAkutslotAnlegen(2, 3), false);
});

test("BR1: ein Kontingent von 0 sperrt Akutslots", () => {
  assert.equal(darfAkutslotAnlegen(0, 0), false);
  assert.equal(akutStatusFuerHalbtag(0, 0).platzFrei, false);
});

test("BR1: freie Akutslots werden nie negativ", () => {
  assert.equal(freieAkutslots(2, 5), 0);
  assert.equal(akutStatusFuerHalbtag(2, 5).frei, 0);
});
