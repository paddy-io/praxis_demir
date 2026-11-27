import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import {
  erteileEinwilligung,
  widerrufeEinwilligung,
  pruefeVersand,
  findePatient,
} from "../lib/einwilligung.ts";

async function patient(prisma: Awaited<ReturnType<typeof testDb>>["prisma"]) {
  return prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
}

test("BR9: vor dem Versand wird die Einwilligung geprueft", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const p = await patient(prisma);

    assert.equal(await pruefeVersand(prisma, p.id, "EMAIL"), false);

    await erteileEinwilligung(prisma, p.id, "EMAIL");
    assert.equal(await pruefeVersand(prisma, p.id, "EMAIL"), true);
    // SMS bleibt getrennt und weiterhin gesperrt.
    assert.equal(await pruefeVersand(prisma, p.id, "SMS"), false);

    await widerrufeEinwilligung(prisma, p.id, "EMAIL");
    assert.equal(await pruefeVersand(prisma, p.id, "EMAIL"), false);
  } finally {
    await aufraeumen();
  }
});

test("BR9: je Kanal gibt es hoechstens einen Eintrag", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const p = await patient(prisma);
    await erteileEinwilligung(prisma, p.id, "EMAIL");
    await erteileEinwilligung(prisma, p.id, "EMAIL");
    assert.equal(await prisma.einwilligung.count({ where: { patientId: p.id } }), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR9: ein Widerruf laesst sich durch erneutes Erteilen aufheben", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const p = await patient(prisma);
    await erteileEinwilligung(prisma, p.id, "SMS");
    await widerrufeEinwilligung(prisma, p.id, "SMS");
    assert.equal(await pruefeVersand(prisma, p.id, "SMS"), false);

    await erteileEinwilligung(prisma, p.id, "SMS");
    assert.equal(await pruefeVersand(prisma, p.id, "SMS"), true);
    assert.equal(await prisma.einwilligung.count({ where: { patientId: p.id } }), 1);
  } finally {
    await aufraeumen();
  }
});

test("BR9: Patient:in ist ueber beide Nummernarten auffindbar", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    await prisma.patient.create({
      data: {
        name: "Privat",
        versicherungsart: "PRIVAT",
        patientennummer: "P-1000",
        status: "BESTAND",
      },
    });
    const p = await patient(prisma);

    assert.equal((await findePatient(prisma, "A123456789"))?.id, p.id);
    assert.equal((await findePatient(prisma, "P-1000"))?.name, "Privat");
    assert.equal(await findePatient(prisma, "GIBT-ES-NICHT"), null);
  } finally {
    await aufraeumen();
  }
});
