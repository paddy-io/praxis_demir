// Baut eine frische Test-Datenbank im Temp-Ordner auf, indem die echten
// Prisma-Migrationen ausgefuehrt werden. So testen wir gegen das gleiche Schema
// wie die App, ohne den Entwicklungs-Stand anzufassen.

import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "@/lib/db.ts";

export type TestDb = {
  prisma: PrismaClient;
  aufraeumen: () => Promise<void>;
};

export async function testDb(): Promise<TestDb> {
  const ordner = mkdtempSync(join(tmpdir(), "praxis-test-"));
  const datei = join(ordner, "test.db");
  const db = new Database(datei);

  const migrationsVerzeichnis = join(process.cwd(), "prisma", "migrations");
  const migrationen = readdirSync(migrationsVerzeichnis)
    .filter((eintrag) => eintrag !== "migration_lock.toml")
    .sort();

  for (const migration of migrationen) {
    const sql = readFileSync(
      join(migrationsVerzeichnis, migration, "migration.sql"),
      "utf8",
    );
    db.exec(sql);
  }
  db.close();

  const prisma = createPrismaClient(`file:${datei}`);

  return {
    prisma,
    aufraeumen: async () => {
      await prisma.$disconnect();
      rmSync(ordner, { recursive: true, force: true });
    },
  };
}
