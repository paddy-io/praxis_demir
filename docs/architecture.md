# Architektur & Projekt-Setup

Dokumentiert die technischen Grundentscheidungen für das Projekt. Grundlage sind
`AGENTS.md` und `SPEC.md`. Datenmodell-Details stehen bewusst noch nicht hier,
sondern entstehen mit dem jeweiligen Feature (siehe `docs/backlog.md`).

## Ziel

Online-Terminbuchung für die Gemeinschaftspraxis Demir & Kollegen. Die App
unterstützt die MFA, sie entscheidet nicht (Prinzip aus `SPEC.md`, Abschnitt 1).

## Entscheidungen

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript | Laut `AGENTS.md`. App Router ist der Standard; TypeScript gibt Typen für Domäne und Datenbank. |
| UI | Tailwind CSS v4 | Laut `AGENTS.md` (Design-Regeln). |
| Icons | lucide-react | `AGENTS.md`: Icons aus einer Bibliothek, einheitlich. |
| Datenbank | SQLite als lokale Datei | Laut `AGENTS.md`: kein Server, eine Datei. |
| ORM | Prisma 7 (`prisma` + `@prisma/client`, exakt v7) | Laut `AGENTS.md`: keine Vorabversion. |
| DB-Treiber | `@prisma/adapter-better-sqlite3` | Prisma 7 ist Rust-frei und braucht zwingend einen Driver-Adapter. |
| Konfiguration | `prisma.config.ts` statt `url` im Schema | Prisma 7 liest die DB-URL aus der Config-Datei. |
| Module | `"type": "module"` in `package.json` | Prisma 7 liefert einen ESM-first Client; Next.js 16 unterstützt ESM-Projekte. |
| Migrationen | `npx prisma migrate dev` | `AGENTS.md`: nie die DB-Datei von Hand ändern. |
| Paketmanager | npm | Node 26 / npm 11 vorhanden. |

## Projektstruktur

```
praxis_demir/
  app/                  Next.js App Router (Layout, Seiten, Styles)
    layout.tsx          Grundgerüst, Schriften, Metadaten
    page.tsx            Startseite (Platzhalter, noch kein Feature)
    globals.css         Tailwind v4 + Design-Tokens (Farben, Schriften)
  lib/
    prisma.ts           Einzige PrismaClient-Instanz (mit SQLite-Adapter)
  prisma/
    schema.prisma       Generator + Datasource (Modelle kommen mit F-001)
  prisma.config.ts      Prisma-7-Config inkl. DB-URL
  docs/
    backlog.md          Features (F-001 …)
    architecture.md     Diese Datei
  .env                  DATABASE_URL (nicht im Repo, siehe .gitignore)
```

## Designrichtung (vorläufig)

Ruhig und editorial: warmes Off-White als Grundfläche, gedeckte Tinte als Text,
eine kräftige grüne Akzentfarbe (`#1f6b5c`) für Hauptaktionen, Überschriften in
einer Serifenschrift (Fraunces), Fließtext in Inter. Die endgültige, verbindliche
Festlegung erfolgt mit dem ersten Feature in `docs/decisions.md` (Vorgabe aus
`AGENTS.md`, Abschnitt „Design“).

## Befehle

| Befehl | Zweck |
|---|---|
| `npm install` | Abhängigkeiten installieren |
| `npm run dev` | Entwicklungsserver, http://localhost:3000 (führt vorher automatisch `prisma generate` aus) |
| `npm run build` | Produktions-Build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript ohne Ausgabe |
| `npx prisma migrate dev --name <name>` | Migration erzeugen und anwenden |
| `npx prisma generate` | Prisma-Client erzeugen |
| `npx prisma studio` | Datenbank im Browser ansehen |

## Prisma-Client und laufender Dev-Server

`prisma migrate dev` und `prisma generate` schreiben den Prisma-Client nach
`generated/prisma/`. Ein **bereits laufender** `next dev`-Prozess merkt das nicht:
Er hält den alten Client im Speicher (zusätzlich gecacht in `globalThis` über
`lib/prisma.ts`). Ein neues Modell ist dann zur Laufzeit `undefined`, und die App
meldet z. B. `Cannot read properties of undefined (reading 'findMany')`.

Deshalb:

- **Nach jeder Migration den Dev-Server neu starten** (`Strg+C`, dann `npm run dev`).
- Der `predev`-Hook in `package.json` führt vor jedem `npm run dev` automatisch
  `prisma generate` aus. Das fängt einen veralteten oder fehlenden Client ab –
  ersetzt aber keinen Neustart, wenn der Server schon läuft.
- Bei hartnäckigen Fällen zusätzlich `rm -rf .next`.

## Offene Punkte

- Datenmodell (Entitäten aus `SPEC.md`) wird mit F-001 als Prisma-Migration angelegt.
- Die SQLite-Datei liegt lokal (Standard `dev.db`); Pfad wird zur Laufzeit über
  `DATABASE_URL` aufgelöst und ist in `.gitignore` ausgeschlossen.
- Falls die Prisma-CLI ohne ESM-Modus Probleme meldet, ist `"type": "module"`
  bereits gesetzt; alternativ kann sie auf `.cts`-Configs ausweichen.
