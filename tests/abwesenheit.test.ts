import { test } from "node:test";
import assert from "node:assert/strict";
import {
  abwesenheitSperrtSlot,
  findeBetroffeneSlots,
  findeBetroffeneTermine,
  pruefeAbwesenheit,
  type AbwesenheitsRegel,
} from "../lib/rules.ts";

// --- BR4 Abwesenheit sperrt nur die Slots der betroffenen Aerztin ---

const urlaubDemir: AbwesenheitsRegel = {
  von: new Date("2026-12-01T00:00:00"),
  bis: new Date("2026-12-03T00:00:00"),
  geltungsbereich: "AERZTIN",
  aerztinId: 1,
};

test("BR4: eine Aerztin-Abwesenheit sperrt nur ihre eigenen Slots", () => {
  assert.equal(
    abwesenheitSperrtSlot([urlaubDemir], {
      datum: new Date("2026-12-02T00:00:00"),
      aerztinId: 1,
    }),
    true,
  );
  assert.equal(
    abwesenheitSperrtSlot([urlaubDemir], {
      datum: new Date("2026-12-02T00:00:00"),
      aerztinId: 2,
    }),
    false,
  );
});

test("BR4: ausserhalb des Zeitraums wird nichts gesperrt", () => {
  assert.equal(
    abwesenheitSperrtSlot([urlaubDemir], {
      datum: new Date("2026-12-04T00:00:00"),
      aerztinId: 1,
    }),
    false,
  );
});

test("BR4: Randtage (von und bis) sind eingeschlossen", () => {
  for (const tag of ["2026-12-01", "2026-12-03"]) {
    assert.equal(
      abwesenheitSperrtSlot([urlaubDemir], {
        datum: new Date(`${tag}T00:00:00`),
        aerztinId: 1,
      }),
      true,
      `${tag} sollte gesperrt sein`,
    );
  }
});

// --- BR4 Praxisschliessung sperrt alle Slots des Tages ---

const schliessung: AbwesenheitsRegel = {
  von: new Date("2026-12-24T00:00:00"),
  bis: new Date("2026-12-24T00:00:00"),
  geltungsbereich: "PRAXIS",
  aerztinId: null,
};

test("BR4: eine Praxisschliessung sperrt die Slots aller Aerztinnen", () => {
  for (const aerztinId of [1, 2, 3]) {
    assert.equal(
      abwesenheitSperrtSlot([schliessung], {
        datum: new Date("2026-12-24T00:00:00"),
        aerztinId,
      }),
      true,
      `Aerztin ${aerztinId} sollte an dem Tag gesperrt sein`,
    );
  }
});

test("BR4: die Praxisschliessung gilt nur an ihrem Tag", () => {
  assert.equal(
    abwesenheitSperrtSlot([schliessung], {
      datum: new Date("2026-12-25T00:00:00"),
      aerztinId: 1,
    }),
    false,
  );
});

// --- Auswahl betroffener Slots und Termine ---

test("BR4: findeBetroffeneSlots waehlt nur die gesperrten Slots", () => {
  const slots = [
    { id: 1, datum: new Date("2026-12-02T00:00:00"), aerztinId: 1 },
    { id: 2, datum: new Date("2026-12-02T00:00:00"), aerztinId: 2 },
    { id: 3, datum: new Date("2026-12-10T00:00:00"), aerztinId: 1 },
  ];
  const betroffen = findeBetroffeneSlots([urlaubDemir], slots);
  assert.deepEqual(
    betroffen.map((s) => s.id),
    [1],
  );
});

test("BR4: findeBetroffeneTermine nutzt das Datum des Slots", () => {
  const termine = [
    { id: 1, slot: { datum: new Date("2026-12-02T00:00:00"), aerztinId: 1 } },
    { id: 2, slot: { datum: new Date("2026-12-02T00:00:00"), aerztinId: 3 } },
  ];
  const betroffen = findeBetroffeneTermine([urlaubDemir], termine);
  assert.deepEqual(
    betroffen.map((t) => t.id),
    [1],
  );
});

// --- Geltungsbereich-Konsistenz ---

test("BR4: eine Praxisschliessung darf keine einzelne Aerztin haben", () => {
  const ergebnis = pruefeAbwesenheit({
    von: new Date("2026-12-01T00:00:00"),
    bis: new Date("2026-12-02T00:00:00"),
    geltungsbereich: "PRAXIS",
    aerztinId: 1,
  });
  assert.equal(ergebnis.ok, false);
});

test("BR4: eine Aerztin-Abwesenheit braucht eine Aerztin", () => {
  const ergebnis = pruefeAbwesenheit({
    von: new Date("2026-12-01T00:00:00"),
    bis: new Date("2026-12-02T00:00:00"),
    geltungsbereich: "AERZTIN",
    aerztinId: null,
  });
  assert.equal(ergebnis.ok, false);
});

test("BR4: das Ende darf nicht vor dem Beginn liegen", () => {
  const ergebnis = pruefeAbwesenheit({
    von: new Date("2026-12-05T00:00:00"),
    bis: new Date("2026-12-01T00:00:00"),
    geltungsbereich: "AERZTIN",
    aerztinId: 1,
  });
  assert.equal(ergebnis.ok, false);
});

test("BR4: eine gueltige Abwesenheit wird akzeptiert", () => {
  assert.equal(pruefeAbwesenheit(urlaubDemir).ok, true);
  assert.equal(pruefeAbwesenheit(schliessung).ok, true);
});
