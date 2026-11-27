import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import {
  getAkutKontingent,
  setAkutKontingent,
  hatAkutPlatz,
  getAkutUebersicht,
} from "../lib/akut.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function aerztin(prisma: Prisma) {
  return prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
}

test("BR1: ohne Einstellung gilt der Default", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    assert.equal(await getAkutKontingent(prisma), 2);
  } finally {
    await aufraeumen();
  }
});

test("BR1: das Kontingent laesst sich setzen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    await setAkutKontingent(prisma, 3);
    assert.equal(await getAkutKontingent(prisma), 3);
    // Negative Werte werden auf 0 begrenzt.
    await setAkutKontingent(prisma, -5);
    assert.equal(await getAkutKontingent(prisma), 0);
  } finally {
    await aufraeumen();
  }
});

test("BR1: hatAkutPlatz zaehlt nur den betroffenen Halbtag", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    await setAkutKontingent(prisma, 2);
    const arzt = await aerztin(prisma);
    const tag = new Date("2026-12-01T00:00:00");

    // Zwei Akutslots am Vormittag, einer am Nachmittag.
    await prisma.slot.createMany({
      data: [
        { aerztinId: arzt.id, datum: tag, beginn: "08:00", halbtag: "VORMITTAG", art: "AKUT" },
        { aerztinId: arzt.id, datum: tag, beginn: "08:10", halbtag: "VORMITTAG", art: "AKUT" },
        { aerztinId: arzt.id, datum: tag, beginn: "14:00", halbtag: "NACHMITTAG", art: "AKUT" },
      ],
    });

    const vormittag = await hatAkutPlatz(prisma, tag, "VORMITTAG");
    assert.equal(vormittag.platzFrei, false);
    assert.equal(vormittag.angelegt, 2);

    const nachmittag = await hatAkutPlatz(prisma, tag, "NACHMITTAG");
    assert.equal(nachmittag.platzFrei, true);
    assert.equal(nachmittag.angelegt, 1);
  } finally {
    await aufraeumen();
  }
});

test("BR1: Normalslots zaehlen nicht ins Akut-Kontingent", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    await setAkutKontingent(prisma, 1);
    const arzt = await aerztin(prisma);
    const tag = new Date("2026-12-01T00:00:00");
    await prisma.slot.create({
      data: { aerztinId: arzt.id, datum: tag, beginn: "09:00", halbtag: "VORMITTAG", art: "NORMAL" },
    });
    const platz = await hatAkutPlatz(prisma, tag, "VORMITTAG");
    assert.equal(platz.angelegt, 0);
    assert.equal(platz.platzFrei, true);
  } finally {
    await aufraeumen();
  }
});

test("BR1: die Uebersicht fasst Akutslots je Tag und Halbtag zusammen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    await setAkutKontingent(prisma, 2);
    const arzt = await aerztin(prisma);
    await prisma.slot.createMany({
      data: [
        { aerztinId: arzt.id, datum: new Date("2026-12-01T00:00:00"), beginn: "08:00", halbtag: "VORMITTAG", art: "AKUT" },
        { aerztinId: arzt.id, datum: new Date("2026-12-01T00:00:00"), beginn: "08:10", halbtag: "VORMITTAG", art: "AKUT" },
      ],
    });

    const { kontingent, halbtage } = await getAkutUebersicht(prisma);
    assert.equal(kontingent, 2);
    assert.equal(halbtage.length, 1);
    assert.equal(halbtage[0].halbtag, "VORMITTAG");
    assert.equal(halbtage[0].angelegt, 2);
    assert.equal(halbtage[0].platzFrei, false);
    assert.equal(halbtage[0].hinweis, "keine Akutslots frei");
  } finally {
    await aufraeumen();
  }
});
