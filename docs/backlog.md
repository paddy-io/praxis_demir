# Backlog - Online-Terminbuchung Praxis Demir & Kollegen

Grundlage: `SPEC.md` (v2). Regeln für Features siehe `AGENTS.md`.

Ein Feature ist ein Ablauf, den eine Person von Anfang bis Ende durchspielen kann. Datenmodell, Oberfläche, Business Rules und Tests gehören jeweils in dieses Feature. Business Rules (BR1-BR9) und Entitäten sind der `SPEC.md` entnommen.

- **Phase 1:** v1, muss am ersten Tag laufen (max. 5 Features).
- **Phase 2:** später bzw. in der `SPEC.md` als "später" geführt.
- **Status:** offen, in Arbeit, fertig.

## Phase 1

| ID | Name | Phase | Status | BR/Entitäten |
|---|---|---|---|---|
| F-001 | Terminplan und Slots pflegen (Ärzt:innen, Terminarten, Slots je Halbtag) | 1 | fertig | BR6, BR7 - Ärztin, Terminart, Slot |
| F-002 | Online-Termin buchen (Identifikation und Slot-Sperre im Moment der Buchung) | 1 | fertig | BR5, BR6, BR9 - Patient, Termin, Slot, Terminart, Ärztin |
| F-003 | Abwesenheit und Praxisschliessung pflegen, betroffene Termine anzeigen | 1 | offen | BR4 - Abwesenheit, Slot, Termin, Ärztin |
| F-004 | Einwilligung (Opt-in) verwalten und vor jedem Versand prüfen | 1 | offen | BR9 - Einwilligung, Patient |
| F-005 | Termin erfassen, ändern und absagen (Telefon und Tresen) | 1 | offen | BR5, BR7 - Termin, Slot, MFA, Patient |

## Phase 2

| ID | Name | Phase | Status | BR/Entitäten |
|---|---|---|---|---|
| F-006 | Akut-Kontingent je Halbtag führen und "keine Akutslots frei" anzeigen | 2 | offen | BR1 - Slot, Termin |
| F-007 | No-Show erfassen, rollierend zählen, erinnern und Online-Sperre setzen/heben | 2 | offen | BR2 - Termin, Patient, MFA, Einwilligung |
| F-008 | Rezeptantrag anlegen und durch eine Ärzt:in freigeben | 2 | offen | BR3 - Rezeptantrag, MFA, Ärztin |
| F-009 | Erstgespräch telefonisch vorklären und Termin vergeben | 2 | offen | BR6, BR8 - Termin, MFA, Ärztin |
| F-010 | Nachtrag erfassen und als "nachtraeglich erfasst" kennzeichnen (informelle Kulanz) | 2 | offen | BR1 - Termin |
| F-011 | Vorab-Fragebogen nach der Online-Buchung, Antworten als Notiz am Termin | 2 | offen | (SPEC "später", M1-12) - Termin |

## Nicht im Backlog (Out of Scope)

- No-Show-Gebühr oder Rechnungsstellung (M1-5)
- Online-Buchung von Akut, Blutabnahme und Erstgespräch (M1-6)
- Automatische Abbildung des Akut-Überziehungspuffers (M1-10)
- Automatisches Umbuchen bei Schliessung oder Abwesenheit (M2-6)
- Technische Umsetzung der Slot-Sperre (Lösungsweg ist Sache des Teams) (M1-9)

## Offene Entscheidungen

- BR2 (No-Show-Eskalation und Sperre): v1 oder später, laut SPEC noch zu entscheiden. Aktuell als F-007 in Phase 2 geführt.
- Offene Fragen und Annahmen aus `SPEC.md` Abschnitt 7 fliessen beim Bauen in das jeweilige Feature ein.
