import { test } from "node:test";
import assert from "node:assert/strict";
import { testDb } from "./helpers/testdb.ts";
import {
  erfasseNoShow,
  getNoShowUebersicht,
  getOffeneErinnerungen,
  setzeOnlineSperre,
  hebeOnlineSperre,
} from "../lib/noshow.ts";
import { bucheOnlineTermin } from "../lib/buchen.ts";

type Prisma = Awaited<ReturnType<typeof testDb>>["prisma"];

async function setup(prisma: Prisma) {
  const aerztin = await prisma.aerztin.create({ data: { name: "Dr. Aylin Demir" } });
  const terminart = await prisma.terminart.create({
    data: { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  });
  await prisma.aerztinTerminart.create({
    data: { aerztinId: aerztin.id, terminartId: terminart.id },
  });
  const patient = await prisma.patient.create({
    data: {
      name: "Testpatientin",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  return { aerztin, terminart, patient };
}

// Legt n gebuchte Termine in der Vergangenheit an und gibt die Termin-IDs zurueck.
async function termineAnlegen(
  prisma: Prisma,
  patientId: number,
  aerztinId: number,
  terminartId: number,
  n: number,
) {
  const ids: number[] = [];
  for (let i = 0; i < n; i++) {
    const slot = await prisma.slot.create({
      data: {
        aerztinId,
        datum: new Date(`2026-0${(i % 9) + 1}-01T00:00:00`),
        beginn: `0${8 + i}:00`,
        halbtag: "VORMITTAG",
        status: "BELEGT",
      },
    });
    const termin = await prisma.termin.create({
      data: {
        patientId,
        aerztinId,
        terminartId,
        slotId: slot.id,
        status: "GEBUCHT",
      },
    });
    ids.push(termin.id);
  }
  return ids;
}

test("BR2: der zweite No-Show legt eine Erinnerungsaufgabe an (Brief ohne Opt-in)", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { aerztin, terminart, patient } = await setup(prisma);
    const termine = await termineAnlegen(prisma, patient.id, aerztin.id, terminart.id, 2);

    const erster = await erfasseNoShow(prisma, termine[0]);
    assert.equal(erster.ok, true);
    if (erster.ok) {
      assert.equal(erster.anzahl, 1);
      assert.equal(erster.erinnerungAngelegt, false);
    }

    const zweiter = await erfasseNoShow(prisma, termine[1]);
    assert.equal(zweiter.ok, true);
    if (zweiter.ok) {
      assert.equal(zweiter.anzahl, 2);
      assert.equal(zweiter.erinnerungAngelegt, true);
    }

    const erinnerungen = await getOffeneErinnerungen(prisma);
    assert.equal(erinnerungen.length, 1);
    // Ohne E-Mail-Opt-in wird ein Brief vorgeschlagen.
    assert.equal(erinnerungen[0].kanal, "BRIEF");
  } finally {
    await aufraeumen();
  }
});

test("BR2: mit E-Mail-Opt-in wird die Erinnerung per E-Mail vorgeschlagen", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { aerztin, terminart, patient } = await setup(prisma);
    await prisma.einwilligung.create({
      data: { patientId: patient.id, kanal: "EMAIL" },
    });
    const termine = await termineAnlegen(prisma, patient.id, aerztin.id, terminart.id, 2);
    await erfasseNoShow(prisma, termine[0]);
    await erfasseNoShow(prisma, termine[1]);

    const erinnerungen = await getOffeneErinnerungen(prisma);
    assert.equal(erinnerungen[0].kanal, "EMAIL");
  } finally {
    await aufraeumen();
  }
});

test("BR2: ein triftiger Grund zaehlt nicht mit", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { aerztin, terminart, patient } = await setup(prisma);
    const termine = await termineAnlegen(prisma, patient.id, aerztin.id, terminart.id, 2);
    await erfasseNoShow(prisma, termine[0], { triftigerGrund: "Notfall" });
    const zweiter = await erfasseNoShow(prisma, termine[1]);
    if (zweiter.ok) assert.equal(zweiter.anzahl, 1);
    assert.equal((await getOffeneErinnerungen(prisma)).length, 0);
  } finally {
    await aufraeumen();
  }
});

test("BR2: nach dem dritten No-Show kann die MFA sperren, danach ist Online-Buchen blockiert", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { aerztin, terminart, patient } = await setup(prisma);
    const termine = await termineAnlegen(prisma, patient.id, aerztin.id, terminart.id, 3);
    for (const id of termine) await erfasseNoShow(prisma, id);

    const uebersicht = await getNoShowUebersicht(prisma);
    const zeile = uebersicht.find((z) => z.patientId === patient.id);
    assert.equal(zeile?.anzahl, 3);
    assert.equal(zeile?.stufe, 3);

    await setzeOnlineSperre(prisma, patient.id);

    // Ein freier Slot fuer den Buchungsversuch.
    const slot = await prisma.slot.create({
      data: {
        aerztinId: aerztin.id,
        datum: new Date("2026-12-20T00:00:00"),
        beginn: "09:00",
        halbtag: "VORMITTAG",
      },
    });
    const gebucht = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });
    assert.equal(gebucht.ok, false);
    if (!gebucht.ok) assert.match(gebucht.grund, /gesperrt/);

    // Sperre heben, dann klappt die Buchung.
    await hebeOnlineSperre(prisma, patient.id);
    const danach = await bucheOnlineTermin(prisma, {
      versicherungsart: "GESETZLICH",
      nummer: patient.versichertennummer!,
      slotId: slot.id,
      terminartId: terminart.id,
    });
    assert.equal(danach.ok, true);
  } finally {
    await aufraeumen();
  }
});

test("BR2: ein bereits erfasster No-Show wird nicht doppelt gezaehlt", async () => {
  const { prisma, aufraeumen } = await testDb();
  try {
    const { aerztin, terminart, patient } = await setup(prisma);
    const termine = await termineAnlegen(prisma, patient.id, aerztin.id, terminart.id, 1);
    await erfasseNoShow(prisma, termine[0]);
    const zweite = await erfasseNoShow(prisma, termine[0]);
    assert.equal(zweite.ok, false);
  } finally {
    await aufraeumen();
  }
});
