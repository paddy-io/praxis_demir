# praxis_demir – Online-Terminbuchung Praxis Demir & Kollegen

Web-App zur Online-Terminbuchung für die Praxis Demir & Kollegen
(Allgemeinmedizin, Berlin-Wedding). Entstanden im Kurs *Smart Applications*
(HTW Berlin, Wintersemester 2026/27, Gruppe 5, Kunde K5).

Die App unterstützt die MFAs, sie entscheidet nicht (Prinzip aus `SPEC.md`).
Fachliche Grundlage ist `SPEC.md`; die Umsetzung folgt dem Backlog in
`docs/backlog.md`.

## Was die App kann

- **Terminplan pflegen** (`/plan`): Ärzt:innen, Terminarten und Slots je Halbtag anlegen; Akut-Kontingent je Vormittag/Nachmittag verwalten.
- **Online buchen** (`/buchen`): Bestandspatient:innen buchen selbst Vorsorge, Beratung, Impfung oder Rezept-Abholung. Der Slot wird im Moment der Buchung gesperrt (ein Slot, ein Termin).
- **Abwesenheit und Schließung** (`/abwesenheit`): Urlaub, Brückentag, Fortbildung oder Praxisschließung eintragen; betroffene Termine werden sofort als „betroffen – Umbuchung offen" angezeigt.
- **Einwilligungen** (`/einwilligungen`): Opt-in für SMS und E-Mail je Patient:in verwalten; wird vor jedem Versand geprüft.
- **Termine verwalten** (`/termine`): Termine an Telefon und Tresen erfassen, ändern, absagen und Nachträge (informelle Kulanz) eintragen.
- **No-Show** (`/noshow`): No-Shows erfassen, rollierend über 12 Monate zählen, Erinnerungen anlegen und die Online-Buchung sperren oder freigeben.
- **Rezepte** (`/rezepte`): Wiederholungsrezept-Anträge anlegen und durch eine Ärzt:in freigeben (Arztvorbehalt).
- **Erstgespräch** (`/erstgespraech`): telefonische Vorklärung durch die MFA und Terminvergabe bei einer Ärzt:in.
- **Vorab-Fragebogen**: nach der Online-Buchung freiwillig ausfüllen; die Antworten erscheinen als Notiz am Termin.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Tailwind CSS v4, Icons aus lucide-react
- **Datenbank:** SQLite über Prisma 7 (lokale Datei, kein Server)
- **Tests:** Node-Testrunner (`node --test`) auf TypeScript

Details und Begründungen stehen in `docs/architecture.md`.

## Loslegen

```bash
npm install
npx prisma migrate dev      # Datenbank anlegen
npm run db:seed             # Beispiel-Ärzt:innen, Terminarten, MFAs, Testpatient:innen
npm run dev                 # http://localhost:3000
```

Nach einer Änderung am Datenmodell:

```bash
npx prisma migrate dev --name <name>
```

Der Dev-Server lädt den Prisma-Client automatisch nach (Proxy in `lib/prisma.ts`);
der `predev`-Hook erzeugt ihn zusätzlich vor jedem Start. Bei Problemen hilft
`rm -rf .next`.

### Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver (führt vorher `prisma generate` aus) |
| `npm run build` | Produktions-Build |
| `npm test` | Alle Tests |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |
| `npm run db:seed` | Beispieldaten einspielen |
| `npx prisma studio` | Datenbank im Browser ansehen |

### Testdaten

Fiktive Datensätze aus dem Seed (keine echten Personendaten):

- Gesetzlich versichert: `A123456789`
- Privatpatient:in: `P-1000`
- Online-Buchung gesperrt: `C000000001`

## Designrichtung

Ruhig und editorial: warme Elfenbein-Grundfläche, weiße Karten, tiefes Waldgrün
als Text und ein kräftiger Grün-Akzent für Hauptaktionen. Überschriften in der
Serifenschrift Fraunces, Fließtext in Inter. Zahlen mit `tabular-nums`. Die
Entscheidungen stehen in `docs/decisions.md`.

## Projektstruktur

```
app/            Seiten (App Router) je Ablauf, dazu Layout und Styles
components/     Header und Footer (gemeinsamer Rahmen)
lib/            Fachliche Logik und Regeln (rein, testbar) + Prisma-Zugriff
prisma/         Schema, Migrationen, Seed
tests/          Unit- und Integrationstests
docs/           backlog.md, architecture.md, decisions.md
SPEC.md         Anforderungsmodell (Quelle der Regeln)
```

Die reinen Regeln liegen in `lib/rules.ts` und sind ohne Datenbank testbar; die
Abläufe (z. B. `lib/buchen.ts`, `lib/terminverwaltung.ts`) laufen in Transaktionen
und werden gegen eine echte SQLite-Testdatenbank geprüft.

## Doku

| Datei | Inhalt |
|---|---|
| `SPEC.md` | Anforderungsmodell: Entitäten, Beziehungen, Business Rules, Widersprüche, Prioritäten, offene Fragen |
| `docs/backlog.md` | Features (F-001 … F-011) mit Status und abgedeckten Regeln |
| `docs/architecture.md` | Technische Entscheidungen und Projekt-Setup |
| `docs/decisions.md` | Protokoll der Design- und Architekturentscheidungen |
| `AGENTS.md` | Arbeitsregeln für den Coding-Agenten |

## Hinweis zur KI-Nutzung

Bei der Erstellung wurde mit KI-Unterstützung gearbeitet:

- **Anforderungsmodell (`SPEC.md`):** entstanden aus zwei selbst geführten
  Gesprächen mit der KI-Kundin Dr. Aylin Demir; unterstützt durch einen
  KI-Assistenten (Perplexity). Inhalt, Annahmen und offene Fragen wurden selbst
  erstellt.
- **Umsetzung (Code):** mit einem KI-Coding-Agenten (OpenAI Codex) nach den Regeln
  in `AGENTS.md`; ein Feature pro Sitzung, jede Business Rule mit mindestens einem
  Test.
- Verantwortlich für das Ergebnis ist der Autor.
