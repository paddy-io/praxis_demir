import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import {
  erfasseTermin,
  aendereTermin,
  sageTerminAb,
} from "../lib/terminverwaltung.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function grunddaten(prisma: Prisma) {
  const demir = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const schaefer = await prisma.aerztin.create({ data: { name: "Dr. Schaefer" } });
  const mfa = await prisma.mFA.create({ data: { name: "MFA Ayse" } });
  const vorsorge = await prisma.terminart.create({
    data: { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  });
  const akut = await prisma.terminart.create({
    data: { bezeichnung: "Akut", dauerMinuten: 10, onlineBuchbar: false },
  });
  for (const aerztin of [demir, schaefer]) {
    for (const art of [vorsorge, akut]) {
      await prisma.aerztinTerminart.create({
        data: { aerztinId: aerztin.id, terminartId: art.id },
      });
    }
  }
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
      aerztinId: demir.id,
      datum: new Date("2026-12-01T00:00:00"),
      beginn: "09:00",
      halbtag: "VORMITTAG",
    },
  });
  return { demir, schaefer, mfa, vorsorge, akut, patient, slot };
}

test("BR5: manuelles Erfassen sperrt den Slot und setzt den Kanal", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { vorsorge, patient, slot, mfa } = await grunddaten(prisma);

    const ergebnis = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TRESEN",
      erfasstVonId: mfa.id,
    });

    assert.equal(ergebnis.ok, true);
    const termin = await prisma.termin.findFirst();
    assert.equal(termin?.kanal, "TRESEN");
    assert.equal(termin?.erfasstVonId, mfa.id);
    const danach = await prisma.slot.findUnique({ where: { id: slot.id } });
    assert.equal(danach?.status, "BELEGT");
  } finally {
    await aufraeumen();
  }
});

test("BR5: ein belegter Slot kann nicht erneut erfasst werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { vorsorge, patient, slot } = await grunddaten(prisma);
    const erste = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    assert.equal(erste.ok, true);

    const zweite = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TRESEN",
    });
    assert.equal(zweite.ok, false);
    assert.equal(await prisma.termin.count(), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR6: auch eine nicht online buchbare Terminart laesst sich manuell erfassen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { akut, patient, slot } = await grunddaten(prisma);
    const ergebnis = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: akut.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    assert.equal(ergebnis.ok, true);
  } finally {
    await aufraeumen();
  }
});

test("BR5: Absagen gibt den Slot wieder frei", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { vorsorge, patient, slot } = await grunddaten(prisma);
    const erfasst = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    assert.equal(erfasst.ok, true);
    if (!erfasst.ok) return;

    const abgesagt = await sageTerminAb(prisma, erfasst.terminId);
    assert.equal(abgesagt.ok, true);
    assert.equal((await prisma.termin.findUnique({ where: { id: erfasst.terminId } }))?.status, "ABSAGT");
    assert.equal((await prisma.slot.findUnique({ where: { id: slot.id } }))?.status, "FREI");
  } finally {
    await aufraeumen();
  }
});

test("BR5: ein abgesagter Termin kann nicht erneut abgesagt werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { vorsorge, patient, slot } = await grunddaten(prisma);
    const erfasst = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    if (!erfasst.ok) throw new Error("Erfassen fehlgeschlagen");
    await sageTerminAb(prisma, erfasst.terminId);

    const zweite = await sageTerminAb(prisma, erfasst.terminId);
    assert.equal(zweite.ok, false);
  } finally {
    await aufraeumen();
  }
});

test("BR5: Umbuchen gibt den alten Slot frei und sperrt den neuen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, vorsorge, patient, slot } = await grunddaten(prisma);
    const neuerSlot = await prisma.slot.create({
      data: {
        aerztinId: demir.id,
        datum: new Date("2026-12-02T00:00:00"),
        beginn: "10:00",
        halbtag: "VORMITTAG",
      },
    });

    const erfasst = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    if (!erfasst.ok) throw new Error("Erfassen fehlgeschlagen");

    const umgebucht = await aendereTermin(prisma, erfasst.terminId, {
      slotId: neuerSlot.id,
      terminartId: vorsorge.id,
    });
    assert.equal(umgebucht.ok, true);

    assert.equal((await prisma.slot.findUnique({ where: { id: slot.id } }))?.status, "FREI");
    assert.equal((await prisma.slot.findUnique({ where: { id: neuerSlot.id } }))?.status, "BELEGT");
    const termin = await prisma.termin.findUnique({ where: { id: erfasst.terminId } });
    assert.equal(termin?.slotId, neuerSlot.id);
  } finally {
    await aufraeumen();
  }
});

test("BR5: Umbuchen auf einen belegten Slot wird abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, vorsorge, patient, slot } = await grunddaten(prisma);
    const belegt = await prisma.slot.create({
      data: {
        aerztinId: demir.id,
        datum: new Date("2026-12-02T00:00:00"),
        beginn: "11:00",
        halbtag: "VORMITTAG",
        status: "BELEGT",
      },
    });
    const erfasst = await erfasseTermin(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    if (!erfasst.ok) throw new Error("Erfassen fehlgeschlagen");

    const umgebucht = await aendereTermin(prisma, erfasst.terminId, {
      slotId: belegt.id,
      terminartId: vorsorge.id,
    });
    assert.equal(umgebucht.ok, false);
    // Der alte Slot bleibt belegt, der Termin unveraendert.
    assert.equal((await prisma.slot.findUnique({ where: { id: slot.id } }))?.status, "BELEGT");
    const termin = await prisma.termin.findUnique({ where: { id: erfasst.terminId } });
    assert.equal(termin?.slotId, slot.id);
  } finally {
    await aufraeumen();
  }
});

test("BR9: eine unbekannte Nummer wird beim Erfassen abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { vorsorge, slot } = await grunddaten(prisma);
    const ergebnis = await erfasseTermin(prisma, {
      nummer: "GIBT-ES-NICHT",
      terminartId: vorsorge.id,
      slotId: slot.id,
      kanal: "TELEFON",
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});
