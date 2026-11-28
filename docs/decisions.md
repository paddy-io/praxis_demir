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

## 2026-11-27 - Design-Durchgang: Buchen und Terminplan aufgewertet

**Was:** Schritt 4 des Design-Durchgangs, Oberfläche von `/buchen` und `/plan`.

- `/buchen`: Kopfbereich mit Telefon-Hinweis als Pille. Das Formular nutzt jetzt
  echte „Schritt 1/2/3"-Karten mit Icon-Badge und `sr-only`-Legenden, weichere
  Karten, sanften Fokusring, Pflichtfeld-Sternchen, voll breiten grünen Button auf
  Mobil und eine Bestätigungskarte mit Hinweis auf die Versichertenkarte. Fehler
  als Alert mit Icon.
- `/plan`: drei klar beschriftete Abschnitte (Terminarten / Neuen Slot anlegen /
  Geplante Slots) mit Icon-Köpfen und kurzen Beschreibungen. Tabelle mit luftigeren
  Zeilen, `overflow-x-auto` für schmale Bildschirme, sanftem Hover und
  Status-Badges als Pillen. Slot-Formular mit Fehler- und Erfolgsmeldung samt Icon.

**Warum:** Fortsetzung der Richtung „ruhig und editorial". Einheitliche Karten,
Abstände und Zustände über alle Seiten.

**Keine Logikänderung:** `actions.ts`, `lib/*` und das Datenmodell sind unverändert.
`npm test` bleibt bei 21/21 grün, Typecheck und Lint sauber.

**Damit abgeschlossen:** Der Design-Durchgang (Schritte 1–4) ist fertig.

## 2026-11-27 - F-003 umgesetzt

**Was:** F-003 „Abwesenheit und Praxisschließung pflegen" ist gebaut. Neues Modell
`Abwesenheit` (`von`, `bis`, `geltungsbereich`, `art`, optionaler `aerztinId`),
Enums `Geltungsbereich` und `AbwesenheitArt`, Migration `f003_abwesenheit`. Reine
Regeln in `lib/rules.ts` (`abwesenheitSperrtSlot`, `findeBetroffeneSlots`,
`findeBetroffeneTermine`, `pruefeAbwesenheit`), Ablauf in `lib/abwesenheit.ts`
(`legeAbwesenheitAn`), Seite `/abwesenheit`, „gesperrt"-Badge auf `/plan`. Tests in
`tests/abwesenheit.test.ts` und `tests/abwesenheit.integration.test.ts`.

**Warum:** Drittes Feature aus Phase 1. v1 verlangt Abwesenheit und
Praxisschließung inklusive Anzeige betroffener Termine (BR4).

**Entscheidungen:**
- Der Geltungsbereich steuert die Sperre: `AERZTIN` sperrt nur die Slots einer
  Ärztin, `PRAXIS` alle Slots des Tages. Ein leerer `aerztinId` bedeutet
  Praxisschließung (SPEC Beziehung 7).
- Ein nachträglicher Eintrag markiert betroffene Termine sofort als `BETROFFEN`
  („betroffen – Umbuchung offen"). Es wird nichts automatisch umgebucht (Out of
  Scope laut SPEC).
- Die Online-Buchung (`lib/buchen.ts`) lehnt Slots ab, die in eine hinterlegte
  Abwesenheit fallen; `getFreieOnlineSlots` blendet sie aus (BR4: „muss vor der
  Online-Buchung hinterlegt sein").
- Der Slot-Status in der Datenbank bleibt `frei`/`belegt` wie in der SPEC; ob ein
  Slot gesperrt ist, wird aus den Abwesenheiten abgeleitet und nur angezeigt.

**Nicht Teil von F-003:** automatisches Umbuchen (Out of Scope), Opt-in-Versand
der Benachrichtigung (F-004), Akut-Kontingent (F-006).

## 2026-11-27 - F-004 umgesetzt

**Was:** F-004 „Einwilligung (Opt-in) verwalten und vor jedem Versand prüfen" ist
gebaut. Neues Modell `Einwilligung` (`patientId`, `kanal`, `erteiltAm`,
`widerrufenAm`) mit `@@unique([patientId, kanal])`, Enum `EinwilligungsKanal`
(`SMS`, `EMAIL`), Migration `f004_einwilligung`. Reine Regeln in `lib/rules.ts`
(`istEinwilligungAktiv`, `darfVersenden`, `versandHinweis`), Abläufe in
`lib/einwilligung.ts` (`erteileEinwilligung`, `widerrufeEinwilligung`,
`pruefeVersand`, `findePatient`), Seite `/einwilligungen`. Tests in
`tests/einwilligung.test.ts` und `tests/einwilligung.integration.test.ts`.

**Warum:** Viertes Feature aus Phase 1. v1 verlangt die Opt-in-Prüfung vor jedem
Versand (BR9).

**Entscheidungen:**
- Je Patient:in und Kanal genau ein Eintrag (SPEC Beziehung 11: „1:n, je Kanal
  eine"). Die Eindeutigkeit erzwingt das auf Datenbank-Ebene.
- Ein Widerruf setzt `widerrufenAm`, der Eintrag bleibt für den Verlauf bestehen.
  Erneutes Erteilen hebt den Widerruf wieder auf (Annahme aus SPEC §7: Opt-in je
  Kanal und widerrufbar).
- Ohne Eintrag gilt die Einwilligung als nicht erteilt. `pruefeVersand` ist die
  zentrale Funktion, die spätere Features (z. B. F-007 Erinnerung, Kontakt bei
  Abwesenheit) vor jedem Versand aufrufen.
- Beim Buchen wird nichts verschickt, daher ändert F-004 den Buchungsablauf nicht
  (BR9: standardmäßig keine E-Mail).

**Nicht Teil von F-004:** der tatsächliche Versand (E-Mail/Brief) und die
Erinnerung selbst. F-004 liefert nur die Verwaltung und die Prüffunktion.

## 2026-11-27 - F-005 umgesetzt

**Was:** F-005 „Termine erfassen, ändern und absagen (Telefon und Tresen)" ist
gebaut. Neues Modell `MFA` und optionales `Termin.erfasstVonId`, Migration
`f005_terminverwaltung`. Gemeinsame BR5-Helfer in `lib/slots.ts` (`belegeSlot`,
`gibSlotFrei`), Regeln in `lib/rules.ts` (`darfTerminVerwalten`,
`terminAenderbar`, `terminAbsagbar`), Abläufe in `lib/terminverwaltung.ts`
(`erfasseTermin`, `aendereTermin`, `sageTerminAb`), Seite `/termine`. Tests in
`tests/terminverwaltung.test.ts` und `tests/terminverwaltung.integration.test.ts`.

**Warum:** Letztes Feature der Phase 1. v1 verlangt Termine an Telefon und Tresen
durch die MFA (BR7), und BR5 („ein Slot, ein Termin") gilt kanalunabhängig.

**Entscheidungen:**
- Die MFA ist ein eigenes Modell (`MFA`), wie in der SPEC genannt; `Termin` hält
  optional fest, wer einen Termin erfasst hat (SPEC Beziehung 10). Online-Buchungen
  haben keine MFA.
- Der Sperrcode für BR5 liegt jetzt einmal in `lib/slots.ts` und wird von der
  Online-Buchung (`lib/buchen.ts`) und der manuellen Verwaltung genutzt.
- Manuell sind alle Terminarten erlaubt – BR6 (Online-Buchbarkeit) gilt nur für die
  Online-Buchung. Akut, Blutabnahme und Erstgespräch lassen sich also am Tresen
  erfassen. Eine hinterlegte Abwesenheit sperrt den Slot trotzdem.
- Umbuchen ist eine Transaktion: neuer Slot wird zuerst gesperrt, dann der alte
  freigegeben, dann der Termin aktualisiert. Absagen setzt den Status `ABSAGT` und
  gibt den Slot wieder frei.
- Änderbar/absagbar sind nur `GEBUCHT` und `BETROFFEN`; `ABSAGT`, `ERSCHIENEN` und
  `NO_SHOW` sind gesperrt.
- Hinweis: Prisma benennt den Accessor `mFA` (Tabellenname bleibt `mfa`).

**Nicht Teil von F-005:** No-Show und Erschienen (F-007), Nachtrag „nachtraeglich
erfasst" (F-010), Akut-Kontingent (F-006), Rezeptanträge (F-008), Anlegen neuer
Patient:innen.

## 2026-11-27 - F-006 umgesetzt

**Was:** F-006 „Akut-Kontingent je Halbtag führen" ist gebaut. Neues Modell
`PraxisEinstellung` als Einzelzeile (`akutKontingentProHalbtag`, Default 2),
Migration `f006_akut_kontingent`. Regeln in `lib/rules.ts`
(`akutStatusFuerHalbtag`, `darfAkutslotAnlegen`), Logik in `lib/akut.ts`
(`getAkutKontingent`, `setAkutKontingent`, `hatAkutPlatz`, `getAkutUebersicht`),
neuer Abschnitt „Akut-Kontingent" auf `/plan`. Tests in `tests/akut.test.ts` und
`tests/akut.integration.test.ts`.

**Warum:** Erstes Feature der Phase 2. BR1 begrenzt Akutslots je Vormittag und
Nachmittag und verlangt die Anzeige „keine Akutslots frei". Die Rechenfunktionen
gab es schon aus F-001, sie waren aber nirgends angeschlossen.

**Entscheidungen:**
- Die Höhe des Kontingents nennt die SPEC nicht (offene Frage M2-8). Sie liegt
  deshalb in der Datenbank (`PraxisEinstellung`) und ist über die Oberfläche
  einstellbar, statt fest im Code zu stehen. Der frühere Wert 2 ist nur noch der
  Default.
- Das Kontingent gilt praxisweit je Tag und Halbtag, nicht je Ärztin (Lesart von
  „pro Vormittag und Nachmittag").
- Beim Anlegen eines Akutslots prüft `app/plan/actions.ts` das Kontingent und lehnt
  mit klarer Meldung ab, wenn es erreicht ist. Normalslots sind nicht betroffen.
- Kein neuer Menüpunkt: Der Abschnitt liegt auf `/plan`, wo auch die Slots gepflegt
  werden. So bleibt die Navigation schlank.

**Nicht Teil von F-006:** Nachtrag/„nachtraeglich erfasst" bei Kulanz (F-010),
automatisches Umbuchen (Out of Scope), Online-Buchung von Akut (Out of Scope).

## 2026-11-27 - F-007 umgesetzt

**Was:** F-007 „No-Show erfassen, rollierend zählen, erinnern und Online-Sperre
setzen/heben" ist gebaut. `Termin` bekommt `noShowAm` und `triftigerGrund`, neues
Modell `Erinnerung` (Aufgabe für die MFA) mit Enum `ErinnerungsKanal`
(`EMAIL`, `BRIEF`, `ANRUF`), Migration `f007_noshow`. Regeln in `lib/rules.ts`
(`fensterBeginn`, `zaehleNoShows`, `noShowEskalation`, `erinnerungsKanal`),
Abläufe in `lib/noshow.ts` (`erfasseNoShow`, `getNoShowUebersicht`,
`setzeOnlineSperre`, `hebeOnlineSperre`, `getOffeneErinnerungen`,
`erledigeErinnerung`), Seite `/noshow`. Tests in `tests/noshow.test.ts` und
`tests/noshow.integration.test.ts`.

**Warum:** BR2 verlangt automatisches Zählen im rollierenden 12-Monats-Fenster,
eine Erinnerung nach dem zweiten und eine Online-Sperre nach dem dritten No-Show.
Im Backlog als Phase-2-Feature geführt.

**Entscheidungen:**
- Das Fenster ist rollierend (heute minus 12 Monate bis heute), nicht das
  Kalenderjahr, wie in BR2 gefordert.
- Ein triftiger Grund (`Termin.triftigerGrund`) lässt den Fall nicht mitzählen;
  die MFA trägt ihn beim Erfassen ein.
- Die Sperre greift nicht vollautomatisch: Die App macht sie nur „fällig", gesetzt
  und gehoben wird sie ausschließlich durch die MFA (SPEC §7, keine feste Frist).
- Die Erinnerung ist eine Aufgabe für die MFA (SPEC §7). Der Kanal richtet sich
  nach dem Opt-in: E-Mail nur mit Zustimmung, sonst Brief. Die Prüfung nutzt die
  bestehende Funktion `pruefeVersand` aus F-004. Die App erzeugt keinen Brief.
- Keine No-Show-Gebühr und keine Rechnungsstellung (Out of Scope, M1-5); die App
  zählt, erinnert und sperrt nur.

**Hinweis:** BR2 stand in der SPEC als „v1 oder später, noch zu entscheiden". Wie
im Backlog vorgesehen, ist es als F-007 in Phase 2 umgesetzt.

**Nicht Teil von F-007:** automatisches Sperren ohne MFA, tatsächlicher Briefdruck.

## 2026-11-27 - F-008 umgesetzt

**Was:** F-008 „Rezeptantrag anlegen und durch eine Ärzt:in freigeben" ist gebaut.
Neues Modell `Rezeptantrag` (`patientId`, `angelegtVonId`, `freigegebenVonId`,
`status`, `datum`, `freigegebenAm`, `notiz`), Enum `RezeptStatus`
(`ANGELEGT`, `FREIGEGEBEN`), Migration `f008_rezeptantrag`. Regeln in
`lib/rules.ts` (`darfRezeptantragAnlegen`, `darfRezeptFreigeben`,
`aerztinAbwesend`), Abläufe in `lib/rezept.ts` (`legeRezeptantragAn`,
`gibRezeptFrei`, `getRezeptantraege`), Seite `/rezepte`. Tests in
`tests/rezept.test.ts` und `tests/rezept.integration.test.ts`.

**Warum:** BR3 verlangt, dass die MFA den Wiederholungsrezept-Antrag anlegt und
nur eine Ärzt:in ihn freigibt (Arztvorbehalt). Im Backlog als Phase-2-Feature.

**Entscheidungen:**
- Die SPEC lässt die Zuständigkeit offen („wer ist gerade zuständig?", §7).
  Deshalb gibt es keine feste Patient-Arzt-Zuordnung: Jede anwesende Ärzt:in darf
  freigeben. So ist „bei Abwesenheit gibt eine Kollegin oder ein Kollege frei"
  sauber abgedeckt, ohne einen Bezug zu erfinden.
- Die Abwesenheitsprüfung nutzt die bestehende Regel aus F-003. Eine
  Praxisschließung sperrt die Freigabe für alle; eine Ärztin-Abwesenheit nur für
  die betroffene Ärztin.
- Freigeben darf nur die Rolle `AERZTIN` (`darfRezeptFreigeben`); Anlegen nur die
  Rolle `MFA` (`darfRezeptantragAnlegen`). Ein bereits freigegebener Antrag kann
  nicht erneut freigegeben werden.
- Die Notiz ist freiwillig und dient z. B. Medikament und Dosierung.

**Offene Frage an die Kundin:** Falls eine feste Zuständigkeit (fester
Patient-Arzt-Bezug) gewünscht ist, wird das später ergänzt. Aktuell: jede
anwesende Ärzt:in.

**Nicht Teil von F-008:** E-Rezept-Anbindung, Druck/Versand, Rezeptgebühren.

## 2026-11-27 - Fix: veralteter Prisma-Client im laufenden Dev-Server

**Was:** `lib/prisma.ts` gibt `prisma` jetzt als Proxy aus. Bei jedem Zugriff wird
geprüft, ob sich der generierte Client (`generated/prisma/client.ts`) geändert
hat; ist das der Fall (und läuft die App in der Entwicklung), wird ein frischer
Client erzeugt und der alte getrennt. Die reine Entscheidung liegt in
`brauchtNeuenClient(...)` und ist in `tests/prisma.test.ts` getestet.

**Warum:** Nach jeder `prisma migrate dev` schreibt Prisma den Client neu. Ein
bereits laufender `next dev` merkte das nicht und hielt den alten Client im
Speicher; ein neues Modell war zur Laufzeit `undefined` (Fehler
`Cannot read properties of undefined (reading 'findMany')`). Das trat bei F-003,
F-006, F-007 und F-008 auf. Mit dem Proxy lädt der Server den Client selbst neu,
ohne Neustart.

**Zusammenspiel mit dem `predev`-Hook:** Der Hook stellt sicher, dass vor jedem
`npm run dev` ein aktueller Client existiert; der Proxy fängt Änderungen während
eines laufenden Servers ab. Ein Neustart ist damit nicht mehr nötig.

## 2026-11-28 - F-009 umgesetzt

**Was:** F-009 „Erstgespräch telefonisch vorklären und Termin vergeben" ist gebaut.
Neues Modell `Erstgespraech` (`patientId`, `mfaId`, `aerztinId`, eindeutige
`terminId`, `situation`, `dringlichkeit`, `aufnahmeMoeglich`, `erfasstAm`),
Migration `f009_erstgespraech`. Regeln in `lib/rules.ts`
(`darfErstgespraechVorklaeren`, `pruefeVorklaerung`, `darfTerminVergeben`),
Abläufe in `lib/erstgespraech.ts` (`erfasseErstgespraech`, `getErstgespraeche`),
Seite `/erstgespraech`. Tests in `tests/erstgespraech.test.ts` und
`tests/erstgespraech.integration.test.ts`.

**Warum:** BR8 verlangt die telefonische Vorklärung durch die MFA (Versicherung,
grobe Situation, Dringlichkeit, Aufnahme möglich, passende Ärztin); das
Erstgespräch selbst führt eine Ärztin. BR6: nicht online buchbar.

**Entscheidungen:**
- Das Vorklärungsprotokoll ist ein eigenes Modell, weil BR8 fünf Angaben nennt,
  die sonst nirgends hingehören (wie `Erinnerung` in F-007).
- Die MFA kann in der Vorklärung eine **neue Patient:in** anlegen (Status `NEU`);
  das deckt die SPEC-Annahme §7 ab (Neupatient:innen kommen telefonisch). Eine
  bestehende Nummer kann ebenso genutzt werden.
- Ohne „Aufnahme möglich" wird kein Termin vergeben (`darfTerminVergeben`).
- Der Termin läuft über die bestehende BR5-Logik (`belegeSlot`) und den Kanal
  `TELEFON`; der Slot wird gesperrt. Es gibt nur einen verknüpften Termin je
  Vorklärung (eindeutige `terminId`).
- W1 bleibt gewahrt: Die MFA koordiniert telefonisch, die Ärztin führt das
  Gespräch. „Erstgespraech" bleibt nicht online buchbar (Test).

**Nicht Teil von F-009:** Online-Buchung von Erstgesprächen (Out of Scope),
automatische Ärztin-Zuweisung, Vorab-Fragebogen (F-011).

**Hinweis:** Die MFA-Navigation hat jetzt neun Einträge. Das Aufräumen und
Gruppieren der Navigation ist als eigener kleiner Design-Schritt vorgemerkt
(kein Feature).

## 2026-11-28 - F-010 umgesetzt

**Was:** F-010 „Nachtrag erfassen und als ‚nachtraeglich erfasst' kennzeichnen" ist
gebaut. `Termin.slotId` ist jetzt optional (`Int?`, bleibt eindeutig); neues Modell
`Nachtrag` (`terminId` eindeutig, `abspracheMitId`, `datum`, `notiz`, `erfasstAm`),
Migration `f010_nachtrag`. Regeln in `lib/rules.ts` (`darfNachtragErfassen`,
`pruefeNachtrag`, `nachtragBelegtSlot`), Abläufe in `lib/nachtrag.ts`
(`erfasseNachtrag`, `getNachtraege`), neuer Abschnitt „Nachtrag (Kulanz)" auf
`/termine`. Tests in `tests/nachtrag.test.ts` und
`tests/nachtrag.integration.test.ts`.

**Warum:** BR1 erlaubt der MFA, in Absprache mit einer Ärzt:in einen zusätzlichen
Termin einzuschieben (informelle Kulanz), der nachträglich erfasst wird. W2 hält
fest: Die App erzwingt BR5 und der Nachtrag belegt keinen Slot.

**Entscheidungen:**
- Ein Nachtrag ist ein `Termin` mit `slotId = null` und
  `nachtraeglichErfasst = true`, Kanal `TELEFON`. Es wird kein Slot belegt oder
  angelegt; `nachtragBelegtSlot()` macht die Regel testbar.
- `Termin.slotId` wurde dafür optional. In SQLite erlaubt ein Unique-Index mehrere
  `NULL`, BR5 („ein Slot, ein Termin") bleibt also vollständig erhalten.
- Das `Nachtrag`-Modell hält die Absprache-Ärzt:in und das Datum fest (wie
  `Erinnerung` in F-007 und `Erstgespraech` in F-009).
- Alle Stellen, die `termin.slot` anzeigen, sind jetzt null-sicher; Termine ohne
  Slot zeigen „nachtraeglich" bzw. „—". Umbuchen/Absagen behandeln `slotId = null`
  sauber (kein Freigeben eines nicht vorhandenen Slots).
- Kein neuer Menüpunkt: Der Nachtrag liegt auf `/termine`, wo die MFA Termine
  verwaltet. Die Navigation bleibt bei neun Einträgen.

**Nicht Teil von F-010:** die Kulanz-Entscheidung selbst (trifft die MFA),
automatische Puffer zwischen Terminen (Out of Scope, M1-10), Akut-Kontingent
(F-006).
