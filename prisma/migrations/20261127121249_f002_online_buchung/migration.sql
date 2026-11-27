-- CreateTable
CREATE TABLE "patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "versicherungsart" TEXT NOT NULL,
    "versichertennummer" TEXT,
    "patientennummer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BESTAND',
    "onlineBuchungGesperrt" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "termin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'GEBUCHT',
    "kanal" TEXT NOT NULL DEFAULT 'ONLINE',
    "nachtraeglichErfasst" BOOLEAN NOT NULL DEFAULT false,
    "dringlichkeit" TEXT,
    "patientId" INTEGER NOT NULL,
    "aerztinId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    CONSTRAINT "termin_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "terminart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "termin_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_versichertennummer_key" ON "patient"("versichertennummer");

-- CreateIndex
CREATE UNIQUE INDEX "patient_patientennummer_key" ON "patient"("patientennummer");

-- CreateIndex
CREATE UNIQUE INDEX "termin_slotId_key" ON "termin"("slotId");
