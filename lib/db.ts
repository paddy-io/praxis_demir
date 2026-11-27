import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Erzeugt einen PrismaClient fuer eine bestimmte SQLite-Datei. Tests koennen so
// eine eigene, temporaere Datenbank benutzen.
export function createPrismaClient(url: string): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}
