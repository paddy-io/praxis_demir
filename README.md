# praxis_demir - Anforderungsmodell Online-Terminbuchung

Anforderungsmodell (SPEC.md) fuer die Online-Terminbuchung der Praxis Demir & Kollegen (Allgemeinmedizin, Berlin-Wedding). Das Projekt entsteht im Kurs *Smart Applications* (HTW Berlin, Wintersemester 2026/27, Gruppe 5, Kunde K5).

## Kurzbeschreibung

Die Praxis hat 3 Aerzt:innen und 4 MFAs und bearbeitet taeglich 80 bis 110 Termine, die meisten per Telefon. Ziel ist eine Online-Terminbuchung, die die MFAs von Telefonaten entlastet. Die App unterstuetzt die MFAs, sie entscheidet nicht.

Dieses Repository enthaelt das Anforderungsmodell, das aus zwei Kundengespraechen mit der KI-Kundin Dr. Aylin Demir entstanden ist. Es enthaelt noch keinen Quellcode.

## Inhalt

| Datei | Beschreibung |
|---|---|
| `SPEC.md` | Anforderungsmodell: Entitaeten, Beziehungen, Business Rules, Widersprueche, Prioritaeten, offene Fragen |
| `README.md` | Diese Uebersicht |

Die `SPEC.md` verweist bei jeder Regel mit `M1-n` und `M2-n` auf die Chat-Nachricht aus Meeting 1 bzw. Meeting 2, aus der sie stammt.

## Versionen

Die Versionen stehen in der Commit-Historie (Reiter *History*):

- `SPEC.md v1 nach Meeting 1`: Stand nach dem ersten Kundengespraech.
- `SPEC.md v2 nach Meeting 2`: Ergaenzt um Datenschutz (Einwilligung, Identifikation), rollierende No-Show-Zaehlung und den Umgang mit nachtraeglichen Schliessungen.

## Lesen und Starten

Es gibt nichts zu installieren oder zu starten. Oeffne `SPEC.md` direkt auf GitHub. Eine Darstellung als Vorschau mit Tabellen ist der Standard.

## Hinweis zur KI-Nutzung

Bei der Erstellung wurde mit KI unterstuetzend gearbeitet:

- **Tool und Modell:** Perplexity (KI-Assistent).
- **Einsatz:** Unterstützung bei den Fragen an die Kundin, Entwuerfe von `SPEC.md` und `README.md`.
- **Eigenleistung:** Die Gespraeche mit der Kundin wurden selbst gefuehrt. Inhalt, Annahmen und offene Fragen wurden selbst erstellt. Verantwortlich fuer das Ergebnis ist der Autor.
