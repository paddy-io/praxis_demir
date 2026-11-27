import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import { bucheOnlineTermin } from "../lib/buchen.ts";

async function grunddaten(prisma: Awaited<ReturnType<typeof testDb>>["prisma"]) {
  const aerztin = await prisma.aerztin.create({ data: { name: "Dr. Test" } });
  const terminart = await prisma.terminart.create({
    data: { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  });
  await prisma.aerztinTerminart.create({
    data: { aerztinId: aerztin.id, terminartId: terminart.id },
  });
  const slot = await prisma.slot.create({
    data: {
      aerztinId: aerztin.id,
      datum: new Date("2026-12-01T00:00:00"),
      beginn: "09:00",
      halbtag: "VORMITTAG",
    },
  });
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  return { slot, patient, terminart };
}

test("BR5: die erste Buchung belegt den Slot", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { slot, patient, terminart } = await grunddaten(prisma);

    const ergebnis = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });

    assert.equal(ergebnis.ok, true);
    const danach = await prisma.slot.findUnique({ where: { id: slot.id } });
    assert.equal(danach?.status, "BELEGT");
    assert.equal(await prisma.termin.count(), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR5: ein bereits belegter Slot kann nicht erneut gebucht werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { slot, patient, terminart } = await grunddaten(prisma);
    const zweite = await prisma.patient.create({
      data: {
        name: "Zweite",
        versicherungsart: "GESETZLICH",
        versichertennummer: "B987654321",
        status: "BESTAND",
      },
    });

    const erste = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });
    assert.equal(erste.ok, true);

    const zweiteBuchung = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: zweite.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });

    assert.equal(zweiteBuchung.ok, false);
    if (!zweiteBuchung.ok) assert.match(zweiteBuchung.grund, /vergeben/);
    assert.equal(await prisma.termin.count(), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR9: eine unbekannte Nummer bucht nicht", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { slot, terminart } = await grunddaten(prisma);
    const ergebnis = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: "GIBT-ES-NICHT",
      slotId: slot.id,
      terminartId: terminart.id,
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});

test("BR6: eine nicht online buchbare Terminart wird abgewiesen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { slot, patient, terminart } = await grunddaten(prisma);
    // Nur eine nicht buchbare Terminart für diese Aerztin anbieten.
    await prisma.terminart.updateMany({ data: { onlineBuchbar: false } });

    const ergebnis = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});
