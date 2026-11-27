import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// Terminarten und Dauer aus SPEC.md, Abschnitt 2.
const terminarten = [
  { bezeichnung: "Vorsorge", dauerMinuten: 25, onlineBuchbar: true },
  { bezeichnung: "Beratung", dauerMinuten: 15, onlineBuchbar: true },
  { bezeichnung: "Impfung", dauerMinuten: 10, onlineBuchbar: true },
  { bezeichnung: "Rezept-Abholung", dauerMinuten: 5, onlineBuchbar: true },
  { bezeichnung: "Akut", dauerMinuten: 10, onlineBuchbar: false },
  { bezeichnung: "Blutabnahme", dauerMinuten: 5, onlineBuchbar: false },
  { bezeichnung: "Erstgespraech", dauerMinuten: 25, onlineBuchbar: false },
];

const aerztinnen = ["Dr. Aylin Demir", "Dr. Schaefer", "Dr. Yilmaz"];

async function main() {
  const arztIds = new Map<string, number>();

  for (const name of aerztinnen) {
    const arzt = await prisma.aerztin.upsert({
      where: { id: aerztinnen.indexOf(name) + 1 },
      update: { name },
      create: { name },
    });
    arztIds.set(name, arzt.id);
  }

  for (const art of terminarten) {
    await prisma.terminart.upsert({
      where: { bezeichnung: art.bezeichnung },
      update: art,
      create: art,
    });
  }

  const alleTerminarten = await prisma.terminart.findMany();
  for (const art of alleTerminarten) {
    for (const name of aerztinnen) {
      // Impfung darf nur Dr. Demir durchfuehren (SPEC 3, BR4).
      if (art.bezeichnung === "Impfung" && name !== "Dr. Aylin Demir") continue;

      await prisma.aerztinTerminart.upsert({
        where: {
          aerztinId_terminartId: {
            aerztinId: arztIds.get(name)!,
            terminartId: art.id,
          },
        },
        update: {},
        create: {
          aerztinId: arztIds.get(name)!,
          terminartId: art.id,
        },
      });
    }
  }

  // Fiktive Bestandspatient:innen zum Ausprobieren (keine echten Daten).
  await prisma.patient.upsert({
    where: { versichertennummer: "A123456789" },
    update: {},
    create: {
      name: "Anna Beispiel",
      versicherungsart: "GESETZLICH",
      versichertennummer: "A123456789",
      status: "BESTAND",
    },
  });
  await prisma.patient.upsert({
    where: { patientennummer: "P-1000" },
    update: {},
    create: {
      name: "Bernd Muster",
      versicherungsart: "PRIVAT",
      patientennummer: "P-1000",
      status: "BESTAND",
    },
  });
  await prisma.patient.upsert({
    where: { versichertennummer: "C000000001" },
    update: {},
    create: {
      name: "Clara Gesperrt",
      versicherungsart: "GESETZLICH",
      versichertennummer: "C000000001",
      status: "BESTAND",
      onlineBuchungGesperrt: true,
    },
  });

  // F-006: praxisweite Einstellung (Akut-Kontingent je Halbtag).
  await prisma.praxisEinstellung.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, akutKontingentProHalbtag: 2 },
  });

  // F-005: MFAs zum Erfassen von Terminen (fiktive Namen).
  const mfas = ["MFA Ayse", "MFA Nadine", "MFA Petra", "MFA Sven"];
  for (const name of mfas) {
    const vorhanden = await prisma.mFA.findFirst({ where: { name } });
    if (!vorhanden) {
      await prisma.mFA.create({ data: { name } });
    }
  }

  console.log(
    "Seed fertig: 3 Aerztinnen, 7 Terminarten, Zuordnungen, 4 MFAs und 3 Testpatient:innen.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
