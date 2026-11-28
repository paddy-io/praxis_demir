# Offene Fragen an die Kundin

Diese Punkte sind in `SPEC.md` (Abschnitt 7) noch nicht final geklärt. Die App
läuft mit einer dokumentierten Annahme weiter; ein Häkchen heißt: bestätigt.

## Vor der Abgabe zu klären

- [ ] **Höhe des Akut-Kontingents (BR1, M2-8):** Wie viele Akutslots sind pro
  Vormittag und Nachmittag vorgesehen? Aktuell einstellbar, Standard 2.
- [ ] **No-Show-Sperre in v1? (BR2):** Ist die Online-Sperre nach dem dritten
  No-Show gewünscht (mit F-007 umgesetzt)? Oder erst später?
- [ ] **Zuständigkeit bei Rezepten (BR3, M1-3):** Fester Patient-Arzt-Bezug oder
  Tagesplan? Aktuell darf jede anwesende Ärzt:in freigeben.

## Bereits mit einer Annahme umgesetzt

- [ ] **Opt-in je Kanal und widerrufbar (BR9):** getrennt für SMS und E-Mail,
  jederzeit widerrufbar.
- [ ] **Erinnerung als Aufgabe (BR2):** Die App legt eine Aufgabe für die MFA an,
  sie erzeugt keinen Brief selbst. E-Mail nur mit Opt-in, sonst Brief.
- [ ] **Online nur für Bestandspatient:innen (BR9, M1-7):** Neupatient:innen
  laufen über das telefonische Erstgespräch.
- [ ] **Akut führt jede Ärzt:in durch (BR1):** keine Zuordnung in der SPEC.
- [ ] **Urlaub einer Ärzt:in = Praxisschließung (BR4):** gebuchte Termine werden
  gleich behandelt (betroffen, Umbuchung offen).
- [ ] **Dauer einer Impfung / Reservierung bei Abbruch (M1-6, M1-9):** offen; die
  Impfung ist im Seed mit 10 Minuten angesetzt, abgebrochene Buchungen halten
  keinen Slot.

## „Haben wir etwas übersehen?" (M2-8)

Blieb im zweiten Meeting unbeantwortet. Beim nächsten Termin stellen.
