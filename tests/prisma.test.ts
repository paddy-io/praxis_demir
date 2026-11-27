import { test } from "node:test";
import assert from "node:assert/strict";
import { brauchtNeuenClient } from "../lib/prisma.ts";

// Der Client wird nur dann neu erzeugt, wenn sich der generierte Client geaendert
// hat und wir in der Entwicklung sind.

test("brauchtNeuenClient: in der Entwicklung wird bei neuer Version neu geladen", () => {
  assert.equal(brauchtNeuenClient(100, 200, true), true);
});

test("brauchtNeuenClient: in der Entwicklung ohne Aenderung bleibt der Client", () => {
  assert.equal(brauchtNeuenClient(200, 200, true), false);
});

test("brauchtNeuenClient: beim ersten Mal (kein Cache) wird geladen", () => {
  assert.equal(brauchtNeuenClient(undefined, 200, true), true);
});

test("brauchtNeuenClient: in Produktion wird nie neu geladen", () => {
  assert.equal(brauchtNeuenClient(100, 200, false), false);
});
