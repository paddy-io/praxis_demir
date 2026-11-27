import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import { gibRezeptFrei, legeRezeptantragAn } from "../lib/rezept.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function setup(prisma: Prisma) {
  const mfa = await prisma.mFA.create({ data: { name: "MFA Ayse" } });
  const demir = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const schaefer = await prisma.aerztin.create({ data: { name: "Dr. Schaefer" } });
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  return { mfa, demir, schaefer, patient };
}

test("BR3: ein neuer Antrag ist angelegt, nach Freigabe freigegeben", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, patient } = await setup(prisma);
    const angelegt = await legeRezeptantragAn(prisma, {
      nummer: patient.versichertennummer!,
      angelegtVonId: mfa.id,
      notiz: "Ramipril 5 mg",
    });
    assert.equal(angelegt.ok, true);
    if (!angelegt.ok) return;

    let antrag = await prisma.rezeptantrag.findUnique({ where: { id: angelegt.antragId } });
    assert.equal(antrag?.status, "ANGELEGT");
    assert.equal(antrag?.freigegebenVonId, null);

    const freigabe = await gibRezeptFrei(prisma, angelegt.antragId, demir.id);
    assert.equal(freigabe.ok, true);

    antrag = await prisma.rezeptantrag.findUnique({ where: { id: angelegt.antragId } });
    assert.equal(antrag?.status, "FREIGEGEBEN");
    assert.equal(antrag?.freigegebenVonId, demir.id);
    assert.notEqual(antrag?.freigegebenAm, null);
  } finally {
    await aufraeumen();
  }
});

test("BR3: eine abwesende Aerztin kann nicht freigeben, eine Kollegin schon", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, schaefer, patient } = await setup(prisma);
    const tag = new Date("2026-12-02T00:00:00");
    await prisma.abwesenheit.create({
      data: {
        von: tag,
        bis: tag,
        geltungsbereich: "AERZTIN",
        art: "URLAUB",
        aerztinId: demir.id,
      },
    });

    const angelegt = await legeRezeptantragAn(prisma, {
      nummer: patient.versichertennummer!,
      angelegtVonId: mfa.id,
    });
    if (!angelegt.ok) throw new Error("Anlegen fehlgeschlagen");

    const abwesend = await gibRezeptFrei(prisma, angelegt.antragId, demir.id, tag);
    assert.equal(abwesend.ok, false);

    const kollegin = await gibRezeptFrei(prisma, angelegt.antragId, schaefer.id, tag);
    assert.equal(kollegin.ok, true);

    const antrag = await prisma.rezeptantrag.findUnique({ where: { id: angelegt.antragId } });
    assert.equal(antrag?.freigegebenVonId, schaefer.id);
  } finally {
    await aufraeumen();
  }
});

test("BR3: ein freigegebener Antrag kann nicht erneut freigegeben werden", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa, demir, schaefer, patient } = await setup(prisma);
    const angelegt = await legeRezeptantragAn(prisma, {
      nummer: patient.versichertennummer!,
      angelegtVonId: mfa.id,
    });
    if (!angelegt.ok) throw new Error("Anlegen fehlgeschlagen");

    await gibRezeptFrei(prisma, angelegt.antragId, demir.id);
    const zweite = await gibRezeptFrei(prisma, angelegt.antragId, schaefer.id);
    assert.equal(zweite.ok, false);

    const antrag = await prisma.rezeptantrag.findUnique({ where: { id: angelegt.antragId } });
    assert.equal(antrag?.freigegebenVonId, demir.id);
  } finally {
    await aufraeumen();
  }
});

test("BR9: eine unbekannte Nummer wird beim Anlegen abgelehnt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { mfa } = await setup(prisma);
    const ergebnis = await legeRezeptantragAn(prisma, {
      nummer: "GIBT-ES-NICHT",
      angelegtVonId: mfa.id,
    });
    assert.equal(ergebnis.ok, false);
    assert.equal(await prisma.rezeptantrag.count(), 0);
  } finally {
    await aufraeumen();
  }
});
