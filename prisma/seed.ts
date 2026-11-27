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

  console.log("Seed fertig: 3 Aerztinnen, 7 Terminarten, Zuordnungen gesetzt.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
