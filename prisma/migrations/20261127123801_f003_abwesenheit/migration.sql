-- CreateTable
CREATE TABLE "abwesenheit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "von" DATETIME NOT NULL,
    "bis" DATETIME NOT NULL,
    "geltungsbereich" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "aerztinId" INTEGER,
    "erfasstAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "abwesenheit_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
