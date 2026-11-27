-- CreateTable
CREATE TABLE "einwilligung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "kanal" TEXT NOT NULL,
    "erteiltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "widerrufenAm" DATETIME,
    CONSTRAINT "einwilligung_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "einwilligung_patientId_kanal_key" ON "einwilligung"("patientId", "kanal");
