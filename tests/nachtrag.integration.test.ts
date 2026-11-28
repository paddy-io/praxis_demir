import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import { erfasseNachtrag, getNachtraege } from "../lib/nachtrag.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function setup(prisma: Prisma) {
  const mfa = await prisma.mFA.create({ data: { name: "MFA Ayse" } });
  const demir = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const schaefer = await prisma.aerztin.create({ data: { name: "Dr. Schaefer" } });
  const akut = await prisma.terminart.create({
    data: { bezeichnung: "Akut", dauerMinuten: 10, onlineBuchbar: false },
  });
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  return { mfa, demir, schaefer, akut, patient };
}

test("W2: ein Nachtrag belegt keinen Slot und ist als nachtraeglich markiert", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, akut, patient } = await setup(prisma);
    const ergebnis = await erfasseNachtrag(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: akut.id,
      aerztinId: demir.id,
      abspracheMitId: demir.id,
      datum: new Date("2026-12-01T00:00:00"),
      notiz: "eingeschoben",
      erfasstVonId: mfa.id,
    });

    assert.equal(ergebnis.ok, true);
    const termin = await prisma.termin.findFirst();
    assert.equal(termin?.slotId, null);
    assert.equal(termin?.nachtraeglichErfasst, true);
    assert.equal(termin?.kanal, "TELEFON");
    // Kein Slot wurde angelegt oder belegt.
    assert.equal(await prisma.slot.count(), 0);
  } finally {
    await aufraeumen();
  }
});

test("BR1: der Nachtrag verweist auf die Absprache-Aerztin", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, schaefer, akut, patient } = await setup(prisma);
    await erfasseNachtrag(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: akut.id,
      aerztinId: demir.id,
      abspracheMitId: schaefer.id,
      datum: new Date("2026-12-01T00:00:00"),
    });

    const nachtraege = await getNachtraege(prisma);
    assert.equal(nachtraege.length, 1);
    assert.equal(nachtraege[0].abspracheMit.id, schaefer.id);
    assert.equal(nachtraege[0].termin.slotId, null);
  } finally {
    await aufraeumen();
  }
});

test("BR1: ein Nachtrag ohne Absprache wird abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, akut, patient } = await setup(prisma);
    const ergebnis = await erfasseNachtrag(prisma, {
      nummer: patient.versichertennummer!,
      terminartId: akut.id,
      aerztinId: demir.id,
      abspracheMitId: 0,
      datum: new Date("2026-12-01T00:00:00"),
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});

test("BR9: eine unbekannte Nummer wird abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { demir, akut } = await setup(prisma);
    const ergebnis = await erfasseNachtrag(prisma, {
      nummer: "GIBT-ES-NICHT",
      terminartId: akut.id,
      aerztinId: demir.id,
      abspracheMitId: demir.id,
      datum: new Date("2026-12-01T00:00:00"),
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});
