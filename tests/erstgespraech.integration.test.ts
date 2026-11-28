import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import {
  erfasseErstgespraech,
  getErstgespraeche,
  type VorklaerungsWunsch,
} from "../lib/erstgespraech.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function setup(prisma: Prisma) {
  const mfa = await prisma.mFA.create({ data: { name: "MFA Ayse" } });
  const demir = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const terminart = await prisma.terminart.create({
    data: { bezeichnung: "Erstgespraech", dauerMinuten: 25, onlineBuchbar: false },
  });
  const slot = await prisma.slot.create({
    data: {
      aerztinId: demir.id,
      datum: new Date("2026-12-05T00:00:00"),
      beginn: "09:00",
      halbtag: "VORMITTAG",
    },
  });
  return { mfa, demir, terminart, slot };
}

// Pflichtfelder der Vorklaerung; die Testfaelle ergaenzen Patient, MFA, Aerztin
// und Slot.
function basis(): Pick<
  VorklaerungsWunsch,
  "situation" | "dringlichkeit" | "aufnahmeMoeglich"
> {
  return {
    situation: "Abklärung",
    dringlichkeit: "normal",
    aufnahmeMoeglich: true,
  };
}

test("BR8: eine neue Patient:in wird angelegt (Status NEU) und der Slot gesperrt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, slot } = await setup(prisma);
    const ergebnis = await erfasseErstgespraech(
      prisma,
      {
        ...basis(),
        neuerPatient: {
          name: "Neue Person",
          versicherungsart: "GESETZLICH",
          nummer: "A999999999",
        },
        mfaId: mfa.id,
        aerztinId: demir.id,
        slotId: slot.id,
      },
    );

    assert.equal(ergebnis.ok, true);
    const patient = await prisma.patient.findUnique({
      where: { versichertennummer: "A999999999" },
    });
    assert.equal(patient?.status, "NEU");
    assert.equal((await prisma.slot.findUnique({ where: { id: slot.id } }))?.status, "BELEGT");
    assert.equal((await getErstgespraeche(prisma)).length, 1);
  } finally {
    await aufraeumen();
  }
});

test("BR8: eine bestehende Patient:in kann ohne Neuanlage verwendet werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, slot } = await setup(prisma);
    await prisma.patient.create({
      data: {
        name: "Bestand",
        versicherungsart: "GESETZLICH",
        versichertennummer: "A123456789",
        status: "BESTAND",
      },
    });
    const ergebnis = await erfasseErstgespraech(prisma, {
      nummer: "A123456789",
      mfaId: mfa.id,
      aerztinId: demir.id,
      slotId: slot.id,
      ...basis(),
    });
    assert.equal(ergebnis.ok, true);
    assert.equal(await prisma.patient.count(), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR8: ohne 'Aufnahme moeglich' wird kein Termin vergeben", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, slot } = await setup(prisma);
    await prisma.patient.create({
      data: {
        name: "Bestand",
        versicherungsart: "GESETZLICH",
        versichertennummer: "A123456789",
        status: "BESTAND",
      },
    });
    const ergebnis = await erfasseErstgespraech(prisma, {
      nummer: "A123456789",
      mfaId: mfa.id,
      aerztinId: demir.id,
      slotId: slot.id,
      ...basis(),
      aufnahmeMoeglich: false,
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
    assert.equal((await prisma.slot.findUnique({ where: { id: slot.id } }))?.status, "FREI");
  } finally {
    await aufraeumen();
  }
});

test("BR8: ein schon belegter Slot wird abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, slot } = await setup(prisma);
    await prisma.patient.create({
      data: {
        name: "Bestand",
        versicherungsart: "GESETZLICH",
        versichertennummer: "A123456789",
        status: "BESTAND",
      },
    });
    await prisma.slot.update({ where: { id: slot.id }, data: { status: "BELEGT" } });
    const ergebnis = await erfasseErstgespraech(prisma, {
      nummer: "A123456789",
      mfaId: mfa.id,
      aerztinId: demir.id,
      slotId: slot.id,
      ...basis(),
    });
    assert.equal(ergebnis.ok, false);
  } finally {
    await aufraeumen();
  }
});

test("BR8: eine unbekannte Nummer wird abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, slot } = await setup(prisma);
    const ergebnis = await erfasseErstgespraech(prisma, {
      nummer: "GIBT-ES-NICHT",
      mfaId: mfa.id,
      aerztinId: demir.id,
      slotId: slot.id,
      ...basis(),
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.termin.count(), 0);
  } finally {
    await aufraeumen();
  }
});
