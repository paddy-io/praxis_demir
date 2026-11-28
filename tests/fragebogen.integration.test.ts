import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import { speichereFragebogen } from "../lib/fragebogen.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function onlineTermin(prisma: Prisma) {
  const aerztin = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const terminart = await prisma.terminart.create({
    data: { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  });
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  const slot = await prisma.slot.create({
    data: {
      aerztinId: aerztin.id,
      datum: new Date("2026-12-10T00:00:00"),
      beginn: "09:00",
      halbtag: "VORMITTAG",
      status: "BELEGT",
    },
  });
  const termin = await prisma.termin.create({
    data: {
      patientId: patient.id,
      aerztinId: aerztin.id,
      terminartId: terminart.id,
      slotId: slot.id,
      kanal: "ONLINE",
      status: "GEBUCHT",
    },
  });
  return { termin, terminart };
}

test("F-011: die Antworten landen als Notiz am Termin", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { termin } = await onlineTermin(prisma);
    const ergebnis = await speichereFragebogen(prisma, termin.id, {
      besuchsgrund: "Rückenschmerzen",
      beschwerdebeginn: "seit 3 Tagen",
    });
    assert.equal(ergebnis.ok, true);

    const danach = await prisma.termin.findUnique({ where: { id: termin.id } });
    assert.match(danach?.notiz ?? "", /Rückenschmerzen/);
    assert.notEqual(danach?.fragebogenAm, null);
  } finally {
    await aufraeumen();
  }
});

test("F-011: ein zweiter Aufruf ueberschreibt nichts (idempotent)", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { termin } = await onlineTermin(prisma);
    await speichereFragebogen(prisma, termin.id, { besuchsgrund: "Erstes" });
    const zweite = await speichereFragebogen(prisma, termin.id, { besuchsgrund: "Zweites" });
    assert.equal(zweite.ok, false);

    const danach = await prisma.termin.findUnique({ where: { id: termin.id } });
    assert.match(danach?.notiz ?? "", /Erstes/);
    assert.doesNotMatch(danach?.notiz ?? "", /Zweites/);
  } finally {
    await aufraeumen();
  }
});

test("F-011: ohne Antwort wird nichts gespeichert", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { termin } = await onlineTermin(prisma);
    const ergebnis = await speichereFragebogen(prisma, termin.id, { besuchsgrund: "  " });
    assert.equal(ergebnis.ok, false);
    const danach = await prisma.termin.findUnique({ where: { id: termin.id } });
    assert.equal(danach?.notiz, null);
  } finally {
    await aufraeumen();
  }
});

test("F-011: nur Online-Termine bekommen einen Fragebogen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { termin } = await onlineTermin(prisma);
    await prisma.termin.update({ where: { id: termin.id }, data: { kanal: "TELEFON" } });
    const ergebnis = await speichereFragebogen(prisma, termin.id, {
      besuchsgrund: "Test",
    });
    assert.equal(ergebnis.ok, false);
  } finally {
    await aufraeumen();
  }
});
