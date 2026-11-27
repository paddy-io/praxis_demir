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

## 2026-11-27 - Hydration-Warnung durch Browser-Erweiterung

**Was:** Am `<body>` in `app/layout.tsx` steht `suppressHydrationWarning`.

**Warum:** Erweiterungen wie Grammarly schreiben eigene Attribute
(`data-gr-ext-installed`, `data-new-gr-c-s-check-loaded`) ins `<body>`, bevor
React übernimmt. Das erzeugt eine Hydration-Warnung, die nicht aus der App
stammt. Die Unterdrückung gilt bewusst nur für dieses eine Element.

## 2026-11-27 - F-002 umgesetzt

**Was:** F-002 „Online-Termin buchen" ist gebaut: Modelle `Patient` und `Termin`,
Migration `f002_online_buchung`, Buchungslogik in `lib/booking.ts` (Prüfungen) und
`lib/buchen.ts` (transaktionale Buchung), die Seite `/buchen` mit
Identifikation → Terminart → Slot → Bestätigung. Tests decken BR5, BR6 und BR9 ab.

**Warum:** Zweites Feature aus Phase 1.

**BR5 hart abgesichert:** `Termin.slotId` ist eindeutig (Datenbank-Ebene), und der
Slot wird per bedingtem Update nur von `FREI` auf `BELEGT` gesetzt. Zwei
gleichzeitige Buchungen desselben Slots können daher nicht beide gewinnen
(Integrationstest gegen eine echte SQLite-Testdatenbank).

**Entscheidungen:** Die `Einwilligung`-Entität (Opt-in, BR9-Versand) gehört zu F-004
und wurde hier bewusst nicht angelegt, weil beim Buchen nichts versendet wird. Die
Annahme „nur Bestandspatient:innen" aus SPEC §7 ist umgesetzt.

**Tests:** `npm test` läuft mit `node --test --import tsx`; Integrationstests bauen
eine temporäre SQLite-Datei aus den echten Migrationen auf (`tests/helpers/testdb.ts`).

## 2026-11-27 - Feinschliff Design-System (Richtung LumaDental)

**Was:** Das Farb- und Schrift-System in `app/globals.css` wurde überarbeitet.
Grundfläche ist jetzt ein wärmeres Elfenbein (`#faf7f2`), Karten sind echt weiß
(`#ffffff`), dazu eine gedämpfte Sektionston-Fläche `sand` (`#f1ebe1`). Text und
Überschriften laufen in tiefem Waldgrün (`#17332b`), Labels gedämpft (`#5d6b64`).
Der Akzent bleibt das kräftige Grün (`#1f6b5c`), ergänzt um `accent-strong`
(`#175548`) für Hover. Zusätzlich: Überschriften zentral in der Serife, sanfter
Scroll, grünliche Textauswahl, sichtbarer Fokusring, weichere Karten-Radien.

**Warum:** Wunsch, die Oberfläche an eine ruhige, editoriale Dental-Referenz
anzunähern (warme Töne, viel Weißraum, kräftige Serifen-Überschriften, ein
einziger Akzent). `AGENTS.md` verlangt getönte Grundfläche, kräftige Akzentfarbe
ohne Indigo/Lila und eine Schrift mit Charakter.

**Hinweis:** Reiner Design-Durchgang, kein neues Feature. Logik und Datenmodell
unverändert; `npm test` bleibt bei 21/21 grün.

**Nächste Schritte (Design, noch offen):** gemeinsamer Rahmen (Header/Footer),
Startseite als editorialer Hero mit Trust-Reihe, Aufwertung von `/buchen` und
`/plan`. Bilder: entweder ohne Fotos (ruhige Flächen/Linien) oder 2-3 dezente
Bilder per Imagegen.

## 2026-11-27 - Design-Durchgang: Rahmen und Startseite

**Was:** Gemeinsamer Rahmen und neue Startseite.

- `components/site-header.tsx`: klebender Header mit Wortmarke, Navigation
  (Start / Termin buchen / Terminplan) und grünem CTA. Der aktive Menüpunkt wird
  über `usePathname` grün hervorgehoben.
- `components/site-footer.tsx`: dreispaltiger Footer (Kurzbeschreibung,
  Navigation, Kontakt-Hinweise).
- `app/layout.tsx`: Header und Footer eingebunden, Body als
  `min-h-screen flex-col`, damit der Footer unten sitzt.
- `app/page.tsx`: editorialer Hero mit zwei CTAs, ruhiges Panel ohne Fotos
  (Verläufe/Linien plus Team-Liste), Trust-Reihe mit belegten Zahlen aus der SPEC
  (3 Ärzt:innen, 4 MFAs, 2.500 Stammpatient:innen, 80–110 Termine/Tag), Ablauf in
  drei nummerierten Karten und ein grüner Abschluss-CTA.

**Warum:** Fortsetzung der Richtung „ruhig und editorial" (Richtung LumaDental).
Wiedererkennbarer Rahmen für alle Seiten, Startseite als ruhiger Einstieg mit
Trust-Elementen.

**Keine erfundenen Daten:** Adresse und Sprechzeiten stehen nicht in der SPEC und
wurden bewusst weggelassen. Nur belegte Fakten verwendet.

**Hinweis:** Reiner Design-Durchgang, kein neues Feature. `npm test` bleibt bei
21/21 grün, Typecheck und Lint sauber.

**Noch offen (Design):** Aufwertung von `/buchen` und `/plan` (Schritt 4).
