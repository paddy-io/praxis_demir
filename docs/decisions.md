# Entscheidungen

Kurzes Protokoll wichtiger Entscheidungen. Format je Eintrag: Datum, was, warum.
Design- und Architekturentscheidungen gehören hierher (siehe `AGENTS.md`).

## 2026-11-27 - Designrichtung: ruhig und editorial

**Was:** Die Oberfläche wird ruhig und editorial gestaltet.

- Grundfläche: warmes Off-White (`#f6f3ee`), Karten in `#fffdfa`.
- Text: gedeckte Tinte (`#26231f`), gedämpfte Labels (`#6f6a62`), Linien `#e6e0d7`.
- Akzent: kräftiges Grün (`#1f6b5c`) für Hauptaktionen und aktiven Menüpunkt, sparsam.
- Schrift: Fraunces (Serife) für Überschriften, Inter für Fließtext, über `next/font`.
- Zahlen und Datumswerte mit `tabular-nums`, großzügige Abstände, einheitliche Radien.

**Warum:** `AGENTS.md` verlangt eine eigene Richtung statt Standard-Tailwind,
getönte Grundfläche, eine kräftige Akzentfarbe (kein Indigo, keine Lila-Blau-Verläufe)
und eine Schrift mit Charakter. Eine Praxis soll seriös und ruhig wirken.

## 2026-11-27 - Stack

**Was:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Prisma 7 mit lokalem
SQLite, Icons aus lucide-react, npm als Paketmanager.

**Warum:** So in `AGENTS.md` vorgegeben. Prisma 7 ist Rust-frei und braucht einen
Driver-Adapter (`@prisma/adapter-better-sqlite3`); die DB-URL steht in
`prisma.config.ts`. Details in `docs/architecture.md`.

## 2026-11-27 - Test-Runner: Node-Testrunner

**Was:** Tests laufen mit dem in Node eingebauten Testrunner (`node --test`) auf
TypeScript-Dateien. Keine zusätzliche Abhängigkeit.

**Warum:** Node 26 führt TypeScript nativ aus, dadurch genügt `node --test`.
Regellogik liegt in reinen Funktionen (`lib/`), damit Tests ohne Datenbank laufen.

## 2026-11-27 - Offene Frage: Höhe des Akut-Kontingents

**Was:** BR1 begrenzt Akutslots je Vormittag und Nachmittag, nennt aber keine Zahl.
Die Regel ist als Funktion mit konfigurierbarem Kontingent umgesetzt.

**Warum:** Die SPEC nennt keine Anzahl. Statt eine Zahl zu erfinden, bleibt sie
konfigurierbar. **Offene Frage an die Kundin** (Kandidat für M2-8, „haben wir etwas
übersehen?"): Wie viele Akutslots pro Halbtag sind vorgesehen?

## 2026-11-27 - F-001 umgesetzt

**Was:** F-001 „Terminplan und Slots pflegen" ist gebaut: Prisma-Modelle
(`Aerztin`, `Terminart`, `AerztinTerminart`, `Slot`), Migration
`f001_terminplan`, Seed mit 3 Ärztinnen und 7 Terminarten, Regelfunktionen in
`lib/rules.ts` und die Seite `/plan`. Tests für BR6, BR7 und BR1 laufen über
`npm test`.

**Warum:** Erster Ablauf aus Phase 1. BR1 (Akut-Kontingent) liegt laut Backlog
eigentlich bei F-006; die Regel ist hier nur als reine, getestete Funktion mit
konfigurierbarem Kontingent vorbereitet, damit F-006 später nur noch die
Oberfläche ergänzt.

**Hinweis:** `next/font/google` lädt Fraunces und Inter zur Build-Zeit. Ohne
Internet schlägt der Build fehl (in der Sandbox der Fall); mit Internet läuft er.
Alternative bei Bedarf: Schriften selbst hosten (`next/font/local`).
