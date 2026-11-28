-- CreateTable
CREATE TABLE "erstgespraech" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "mfaId" INTEGER NOT NULL,
    "aerztinId" INTEGER NOT NULL,
    "terminId" INTEGER NOT NULL,
    "situation" TEXT NOT NULL,
    "dringlichkeit" TEXT NOT NULL,
    "aufnahmeMoeglich" BOOLEAN NOT NULL,
    "erfasstAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "erstgespraech_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "erstgespraech_mfaId_fkey" FOREIGN KEY ("mfaId") REFERENCES "mfa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "erstgespraech_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "erstgespraech_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "termin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "erstgespraech_terminId_key" ON "erstgespraech"("terminId");
