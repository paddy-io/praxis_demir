import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import { legeAbwesenheitAn } from "../lib/abwesenheit.ts";
import { bucheOnlineTermin } from "../lib/buchen.ts";

async function grunddaten(prisma: Awaited<ReturnType<typeof testDb>>["prisma"]) {
  const demir = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const schaefer = await prisma.aerztin.create({ data: { name: "Dr. Schaefer" } });
  const terminart = await prisma.terminart.create({
    data: { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  });
  for (const aerztin of [demir, schaefer]) {
    await prisma.aerztinTerminart.create({
      data: { aerztinId: aerztin.id, terminartId: terminart.id },
    });
  }
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  return { demir, schaefer, terminart, patient };
}

test("BR4: eine Aerztin-Abwesenheit markiert nur ihre gebuchten Termine als betroffen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, schaefer, terminart, patient } = await grunddaten(prisma);
    const tag = new Date("2026-12-01T00:00:00");

    const slotDemir = await prisma.slot.create({
      data: { aerztinId: demir.id, datum: tag, beginn: "09:00", halbtag: "VORMITTAG" },
    });
    const slotSchaefer = await prisma.slot.create({
      data: { aerztinId: schaefer.id, datum: tag, beginn: "09:00", halbtag: "VORMITTAG" },
    });
    await prisma.termin.create({
      data: {
        patientId: patient.id,
        aerztinId: demir.id,
        terminartId: terminart.id,
        slotId: slotDemir.id,
      },
    });
    await prisma.termin.create({
      data: {
        patientId: patient.id,
        aerztinId: schaefer.id,
        terminartId: terminart.id,
        slotId: slotSchaefer.id,
      },
    });

    const ergebnis = await legeAbwesenheitAn(prisma, {
      von: tag,
      bis: tag,
      geltungsbereich: "AERZTIN",
      art: "URLAUB",
      aerztinId: demir.id,
    });

    assert.equal(ergebnis.ok, true);
    if (ergebnis.ok) assert.equal(ergebnis.betroffeneTermine, 1);

    const termine = await prisma.termin.findMany({ include: { slot: true } });
    const demirTermin = termine.find((t) => t.aerztinId === demir.id);
    const schaeferTermin = termine.find((t) => t.aerztinId === schaefer.id);
    assert.equal(demirTermin?.status, "BETROFFEN");
    assert.equal(schaeferTermin?.status, "GEBUCHT");
  } finally {
    await aufraeumen();
  }
});

test("BR4: eine Praxisschliessung markiert alle Termine des Tages als betroffen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, schaefer, terminart, patient } = await grunddaten(prisma);
    const tag = new Date("2026-12-24T00:00:00");

    for (const aerztin of [demir, schaefer]) {
      const slot = await prisma.slot.create({
        data: { aerztinId: aerztin.id, datum: tag, beginn: "10:00", halbtag: "VORMITTAG" },
      });
      await prisma.termin.create({
        data: {
          patientId: patient.id,
          aerztinId: aerztin.id,
          terminartId: terminart.id,
          slotId: slot.id,
        },
      });
    }

    const ergebnis = await legeAbwesenheitAn(prisma, {
      von: tag,
      bis: tag,
      geltungsbereich: "PRAXIS",
      art: "BRUECKENTAG",
      aerztinId: null,
    });

    assert.equal(ergebnis.ok, true);
    if (ergebnis.ok) assert.equal(ergebnis.betroffeneTermine, 2);
    assert.equal(await prisma.termin.count({ where: { status: "BETROFFEN" } }), 2);
  } finally {
    await aufraeumen();
  }
});

test("BR4: ein Slot in einer hinterlegten Abwesenheit kann nicht online gebucht werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, terminart, patient } = await grunddaten(prisma);
    const tag = new Date("2026-12-02T00:00:00");
    const slot = await prisma.slot.create({
      data: { aerztinId: demir.id, datum: tag, beginn: "09:00", halbtag: "VORMITTAG" },
    });

    await legeAbwesenheitAn(prisma, {
      von: tag,
      bis: tag,
      geltungsbereich: "AERZTIN",
      art: "URLAUB",
      aerztinId: demir.id,
    });

    const ergebnis = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });

    assert.equal(ergebnis.ok, false);
    if (!ergebnis.ok) assert.match(ergebnis.grund, /Abwesenheit|Schließung/);
    assert.equal(await prisma.termin.count(), 0);
    const unveraendert = await prisma.slot.findUnique({ where: { id: slot.id } });
    assert.equal(unveraendert?.status, "FREI");
  } finally {
    await aufraeumen();
  }
});

test("BR4: eine Praxisschliessung braucht keine Aerztin (Validierung)", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const ergebnis = await legeAbwesenheitAn(prisma, {
      von: new Date("2026-12-24T00:00:00"),
      bis: new Date("2026-12-24T00:00:00"),
      geltungsbereich: "PRAXIS",
      art: "URLAUB",
      aerztinId: 1,
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.abwesenheit.count(), 0);
  } finally {
    await aufraeumen();
  }
});
