import "dotenv/config";
import { statSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "./db.ts";

// Die eine PrismaClient-Instanz fuer die App.
//
// Problem: `prisma generate` schreibt den Client nach generated/prisma/. Ein
// bereits laufender `next dev` merkt das nicht und haelt den alten Client im
// Speicher; ein neues Modell ist dann zur Laufzeit undefined ("Cannot read
// properties of undefined (reading 'findMany')").
//
// Loesung: `prisma` ist ein Proxy, der bei jedem Zugriff prueft, ob der
// generierte Client sich geaendert hat, und dann einen frischen erzeugt. So
// bleibt kein veralteter Client haengen, auch ohne Dev-Server-Neustart.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaStamp: number | undefined;
};

function clientStamp(): number {
  try {
    return statSync(join(process.cwd(), "generated", "prisma", "client.ts")).mtimeMs;
  } catch {
    return 0;
  }
}

// Entscheidet, ob ein neuer Client noetig ist. Rein, damit es testbar bleibt.
export function brauchtNeuenClient(
  gecachterStamp: number | undefined,
  aktuellerStamp: number,
  istEntwicklung: boolean,
): boolean {
  if (!istEntwicklung) return false;
  return gecachterStamp !== aktuellerStamp;
}

function aktuellerClient(): PrismaClient {
  const vorhanden = globalForPrisma.prisma;
  const istEntwicklung = process.env.NODE_ENV !== "production";

  if (!istEntwicklung && vorhanden) {
    return vorhanden;
  }

  const stamp = clientStamp();
  if (vorhanden && !brauchtNeuenClient(globalForPrisma.prismaStamp, stamp, istEntwicklung)) {
    return vorhanden;
  }

  const client = createPrismaClient(process.env.DATABASE_URL ?? "file:./dev.db");
  // Alten Client freigeben, damit keine Verbindung offen bleibt.
  if (vorhanden && vorhanden !== client) {
    void vorhanden.$disconnect().catch(() => {});
  }
  globalForPrisma.prisma = client;
  globalForPrisma.prismaStamp = stamp;
  return client;
}

// Ein Proxy, der jeden Zugriff an den aktuellen Client weiterreicht.
export const prisma = new Proxy({} as PrismaClient, {
  get(_ziel, eigenschaft) {
    const client = aktuellerClient();
    const wert = Reflect.get(client as object, eigenschaft, client);
    return typeof wert === "function" ? wert.bind(client) : wert;
  },
});
