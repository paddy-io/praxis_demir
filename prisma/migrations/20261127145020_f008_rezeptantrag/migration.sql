-- CreateTable
CREATE TABLE "rezeptantrag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "angelegtVonId" INTEGER NOT NULL,
    "freigegebenVonId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ANGELEGT',
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freigegebenAm" DATETIME,
    "notiz" TEXT,
    CONSTRAINT "rezeptantrag_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rezeptantrag_angelegtVonId_fkey" FOREIGN KEY ("angelegtVonId") REFERENCES "mfa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rezeptantrag_freigegebenVonId_fkey" FOREIGN KEY ("freigegebenVonId") REFERENCES "aerztin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
