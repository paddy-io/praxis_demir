-- CreateTable
CREATE TABLE "nachtrag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "terminId" INTEGER NOT NULL,
    "abspracheMitId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "notiz" TEXT,
    "erfasstAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nachtrag_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "termin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nachtrag_abspracheMitId_fkey" FOREIGN KEY ("abspracheMitId") REFERENCES "aerztin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_termin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'GEBUCHT',
    "kanal" TEXT NOT NULL DEFAULT 'ONLINE',
    "nachtraeglichErfasst" BOOLEAN NOT NULL DEFAULT false,
    "dringlichkeit" TEXT,
    "noShowAm" DATETIME,
    "triftigerGrund" TEXT,
    "patientId" INTEGER NOT NULL,
    "aerztinId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,
    "erfasstVonId" INTEGER,
    "slotId" INTEGER,
    CONSTRAINT "termin_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "terminart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "termin_erfasstVonId_fkey" FOREIGN KEY ("erfasstVonId") REFERENCES "mfa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_termin" ("aerztinId", "dringlichkeit", "erfasstVonId", "id", "kanal", "nachtraeglichErfasst", "noShowAm", "patientId", "slotId", "status", "terminartId", "triftigerGrund") SELECT "aerztinId", "dringlichkeit", "erfasstVonId", "id", "kanal", "nachtraeglichErfasst", "noShowAm", "patientId", "slotId", "status", "terminartId", "triftigerGrund" FROM "termin";
DROP TABLE "termin";
ALTER TABLE "new_termin" RENAME TO "termin";
CREATE UNIQUE INDEX "termin_slotId_key" ON "termin"("slotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "nachtrag_terminId_key" ON "nachtrag"("terminId");
