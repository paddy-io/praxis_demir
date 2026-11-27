-- CreateTable
CREATE TABLE "aerztin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "terminart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bezeichnung" TEXT NOT NULL,
    "dauerMinuten" INTEGER NOT NULL,
    "onlineBuchbar" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "aerztin_terminart" (
    "aerztinId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,

    PRIMARY KEY ("aerztinId", "terminartId"),
    CONSTRAINT "aerztin_terminart_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "aerztin_terminart_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "terminart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "slot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datum" DATETIME NOT NULL,
    "beginn" TEXT NOT NULL,
    "halbtag" TEXT NOT NULL,
    "art" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'FREI',
    "aerztinId" INTEGER NOT NULL,
    CONSTRAINT "slot_aerztinId_fkey" FOREIGN KEY ("aerztinId") REFERENCES "aerztin" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "terminart_bezeichnung_key" ON "terminart"("bezeichnung");

-- CreateIndex
CREATE UNIQUE INDEX "slot_aerztinId_datum_beginn_key" ON "slot"("aerztinId", "datum", "beginn");
