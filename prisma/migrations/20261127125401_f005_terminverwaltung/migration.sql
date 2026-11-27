-- CreateTable
CREATE TABLE "mfa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
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
    "patientId" INTEGER NOT NULL,
    "aerztinId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,
    "erfasstVonId" INTEGER,
    "slotId" INTEGER NOT NULL,
    CONSTRAINT "termin_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "terminart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_erfasstVonId_fkey" FOREIGN KEY ("erfasstVonId") REFERENCES "mfa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_termin" ("aerztinId", "dringlichkeit", "id", "kanal", "nachtraeglichErfasst", "patientId", "slotId", "status", "terminartId") SELECT "aerztinId", "dringlichkeit", "id", "kanal", "nachtraeglichErfasst", "patientId", "slotId", "status", "terminartId" FROM "termin";
DROP TABLE "termin";
ALTER TABLE "new_termin" RENAME TO "termin";
CREATE UNIQUE INDEX "termin_slotId_key" ON "termin"("slotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
