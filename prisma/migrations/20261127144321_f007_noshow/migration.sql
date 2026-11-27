-- AlterTable
ALTER TABLE "termin" ADD COLUMN "noShowAm" DATETIME;
ALTER TABLE "termin" ADD COLUMN "triftigerGrund" TEXT;

-- CreateTable
CREATE TABLE "erinnerung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "terminId" INTEGER,
    "kanal" TEXT NOT NULL,
    "ausgeloestAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "erledigtAm" DATETIME,
    "notiz" TEXT,
    CONSTRAINT "erinnerung_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "erinnerung_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "termin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
