# SPEC.md - Online-Terminbuchung Praxis Demir & Kollegen (K5)

Version 2, Stand: nach Meeting 2. Quelle der Regeln: Chat mit Dr. Aylin Demir. `M1-n` verweist auf Nachricht n aus Meeting 1 (12 Nachrichten), `M2-n` auf Nachricht n aus Meeting 2. Nachricht M2-8 blieb wegen eines technischen Problems unbeantwortet.

## 1. Kontext

- Kundin: Dr. Aylin Demir, Allgemeinmedizin, Gemeinschaftspraxis in Berlin-Wedding.
- Team: 3 Aerzt:innen (Dr. Demir, Dr. Schaefer, Dr. Yilmaz), 4 MFAs, ca. 2.500 Stammpatient:innen pro Quartal, 80-110 Termine pro Tag. (M1-1, M1-12, M2-1)
- Problem: Die Terminvergabe am Telefon bindet die MFAs. Gewuenscht ist eine praxistaugliche Online-Buchung. (M1-1)
- Erfolgskriterium: Die MFAs haben weniger Telefonate. (M1-11)
- Prinzip: Die App unterstuetzt die MFA, sie entscheidet nicht. Das gilt fuer Akut-Kulanz, No-Show-Sperre, Erstgespraech und Umbuchung. (M1-2, M1-4, M1-7, M2-6, M2-7)
- Datenschutz: Die DSGVO-Regeln gelten als Teil des Auftrags ("heilig, kein Spielraum"). (M2-4, M2-5)

## 2. Entitaeten

| Entitaet | Schluessel | Attribute |
|---|---|---|
| Patient | Versichertennummer (gesetzlich) oder interne Patientennummer (privat) | Name, Versicherungsart, Status (neu oder Bestand), Online-Buchung gesperrt (ja/nein) |
| Einwilligung | Einwilligungs-ID | Kanal (SMS oder E-Mail), erteilt am, widerrufen am |
| Aerztin | Aerztin-ID | Name |
| MFA | MFA-ID | Name |
| Terminart | Terminart-ID | Bezeichnung, Dauer in Minuten, online buchbar (ja/nein) |
| Termin | Termin-ID | Status (gebucht, erschienen, abgesagt, No-Show, betroffen - Umbuchung offen), Kanal (Telefon, Tresen, Online), nachtraeglich erfasst (ja/nein), Dringlichkeit |
| Slot | Slot-ID | Datum, Halbtag (Vormittag oder Nachmittag), Art (normal oder Akut), Status (frei oder belegt) |
| Abwesenheit | Abwesenheits-ID | von, bis, Geltungsbereich (einzelne Aerzt:in oder ganze Praxis), Art (Urlaub, Brueckentag, Fortbildung) |
| Rezeptantrag | Antrags-ID | Status (angelegt, freigegeben), Datum |

Das sind 9 Entitaeten. Wenn du nur 6-8 willst, fasse Einwilligung als Attribut von Patient zusammen (Kanal und Datum je Patient).

Terminarten und Dauer (M1-6):

| Terminart | Dauer | Online buchbar |
|---|---|---|
| Vorsorge | 20-30 Min. | ja |
| Erstgespraech | 20-30 Min. | nein |
| Beratung | ca. 15 Min. | ja |
| Akut | ca. 10 Min. | nein |
| Blutabnahme | ca. 5 Min. | nein |
| Rezept-Abholung | ca. 5 Min. | ja |
| Impfung | nicht genannt | ja |

## 3. Beziehungen

| Nr. | Beziehung | Kardinalitaet |
|---|---|---|
| 1 | Patient - Termin | 1:n |
| 2 | Aerztin - Termin | 1:n |
| 3 | Terminart - Termin | 1:n |
| 4 | **Aerztin - Terminart** ("darf durchfuehren") | **n:m** |
| 5 | Aerztin - Slot | 1:n |
| 6 | Slot - Termin | 1:0..1 |
| 7 | Aerztin - Abwesenheit | 0..1:n (leer = Praxisschliessung) |
| 8 | Patient - Rezeptantrag | 1:n |
| 9 | Rezeptantrag - Aerztin (Freigabe) | n:1 |
| 10 | MFA - Termin (erfasst) und MFA - Rezeptantrag (angelegt) | 1:n |
| 11 | Patient - Einwilligung | 1:n (je Kanal eine) |

Impfung ist nur Dr. Demir zugeordnet, alle anderen Terminarten allen drei Aerzt:innen. (M1-6, M1-8)

## 4. Business Rules

**Kernregeln**

- **BR1 Akut-Kontingent (M1-2, M1-10):** Akutslots sind pro Vormittag und Nachmittag begrenzt. Sind sie voll, zeigt die App "keine Akutslots frei". Der weitere Weg laeuft ueber das Telefon. Eine MFA kann in Absprache mit einer Aerzt:in einen zusaetzlichen Termin im Praxisablauf einschieben (informelle Kulanz). Dieser wird nachtraeglich manuell erfasst und als "nachtraeglich erfasst" gekennzeichnet. Die App bildet die Kulanz nicht ab.
- **BR2 Absage und No-Show (M1-4, M1-5, M2-5, M2-7):** Absagen sind mindestens 24 Stunden vorher erwartet. Gezaehlt wird in einem rollierenden 12-Monats-Fenster (immer die letzten 12 Monate ab heute, nicht Kalenderjahr). Die App zaehlt automatisch. Beim zweiten No-Show ohne Absage gibt es eine schriftliche Erinnerung, beim dritten wird die Online-Buchung gesperrt (danach nur telefonisch). Die Sperre setzt und hebt eine MFA, sie greift nicht vollautomatisch. Mit triftigem Grund vermerkt die MFA den Fall, und der Zaehler wird nicht erhoeht. Es gibt keine No-Show-Gebuehr, weder bei Kassen- noch bei Privatpatient:innen. Die schriftliche Erinnerung geht per E-Mail nur mit Opt-in, sonst per Brief (Post) oder Anruf durch die MFA. Ausnahmen gibt es keine.
- **BR3 Rezepte (M1-1, M1-3):** Die MFA legt den Wiederholungsrezept-Antrag an. Nur eine Aerzt:in darf ihn freigeben (Arztvorbehalt, nicht verhandelbar). Bei Abwesenheit der zustaendigen Aerzt:in gibt eine Kollegin oder ein Kollege frei.
- **BR4 Impfung, Abwesenheit und Schliessung (M1-8, M1-11, M2-6):** Impfungen darf nur Dr. Demir durchfuehren (Qualifikation). Eine Abwesenheit sperrt nur die Slots der betroffenen Aerzt:in. Eine Praxisschliessung sperrt alle Slots des Tages und muss vor der Online-Buchung hinterlegt sein. Wird eine Schliessung nachtraeglich eingetragen, zeigt das System sofort alle betroffenen Termine an (Status "betroffen - Umbuchung offen"). Die MFA entscheidet, wie sie die Patient:innen kontaktiert (Telefon, E-Mail nur mit Opt-in). Automatisches Umbuchen findet nicht statt.
- **BR5 Ein Slot, ein Termin (M1-9):** Pro Slot gibt es genau einen Termin. Wer zuerst bestaetigt, hat den Termin. Der Slot wird im Moment der Buchung gesperrt, kanalunabhaengig (Telefon, Tresen, Online). Es gibt keine "kurze Reservierung".

**Weitere Regeln**

- **BR6 Online-Buchbarkeit (M1-6):** Online buchbar sind nur Vorsorge, Beratung, Impfung und Rezept-Abholung. Akut, Blutabnahme und Erstgespraech bleiben beim Telefon.
- **BR7 Berechtigungen (M1-3):** Termine eintragen, aendern und absagen darf nur die MFA. Alle vier MFAs haben dieselben Rechte.
- **BR8 Erstgespraech (M1-7):** Die MFA fuehrt telefonisch eine Vorklaerung durch (Versicherung, grobe Situation, Dringlichkeit, Aufnahme moeglich, passende Aerzt:in). Das Erstgespraech selbst fuehrt eine Aerzt:in in der Praxis (20-30 Min.).
- **BR9 Identifikation und Kommunikation (M2-4, M2-5):** Jede Online-Buchung muss die Patient:in eindeutig identifizieren: gesetzlich Versicherte ueber die Versichertennummer, Privatpatient:innen ueber die interne Patientennummer. Ohne Identifikation ist keine Buchung moeglich. Standardmaessig wird keine E-Mail verschickt. SMS und E-Mail-Erinnerungen sind nur mit ausdruecklicher Zustimmung (Opt-in) erlaubt. Die App speichert den Opt-in-Status je Patient:in und prueft ihn vor jedem Versand. Ausnahmen gibt es keine.

## 5. Widersprueche (aufgeloest)

- **W1 Erstgespraech (M1-6, M1-7):** Aussage A: "Erstgespraeche machen alle drei Aerzt:innen". Aussage B: "Das macht eine MFA telefonisch." **Aufloesung:** Beides stimmt auf zwei Ebenen. Die MFA koordiniert telefonisch (Mini-Triage), die Aerzt:in fuehrt das Gespraech in der Praxis. Das Erstgespraech bleibt telefonisch und ist nicht online buchbar.
- **W2 Akut (M1-2, M1-9, M1-10):** Aussage A: "Ein Slot, ein Termin, keine Ausnahme." Aussage B: "Bei Akutfaellen findet die MFA trotzdem irgendwie einen Platz." **Aufloesung:** Offiziell gilt BR5. Der Ueberziehungspuffer (5-10 Minuten zwischen zwei Terminen) ist keine Slot-Buchung, sondern informelle Kulanz. Er wird nachtraeglich manuell erfasst. Annahme: Die App erzwingt BR5 und erlaubt den manuellen Nachtrag, ohne einen Slot zu belegen.

In Meeting 2 sind keine neuen Widersprueche aufgetreten. Die moegliche Luecke "schriftliche Erinnerung ohne E-Mail" ist in BR2 geloest (Brief oder Anruf).

## 6. Prioritaeten

**v1 (muss am ersten Tag laufen) (M1-11)**
- Online-Buchung fuer Vorsorge, Beratung, Impfung und Rezept-Abholung
- Eindeutige Identifikation der Patient:in (BR9)
- Slot-Sperre im Moment der Buchung (BR5)
- Abwesenheit und Praxisschliessung inklusive Anzeige betroffener Termine (BR4)
- Opt-in-Pruefung vor jedem Versand (BR9)

**Spaeter**
- Vorab-Fragebogen nach der Online-Buchung, passend zur Terminart, Antworten als Notiz am Termin (M1-12). In Meeting 2 bestaetigt: "erst die Basis" (M2-2, M2-3). Hintergrund: Am Tresen werden Besuchsgrund, Beschwerdebeginn, Versichertenkarte und Status (Stamm oder neu) abgefragt, 3-5 Minuten pro Person (M2-1). Geschaetzter Nutzen: ca. 5 Minuten pro Termin bei 80-110 Terminen pro Tag, etwa 30 % kommen ohne Vorabinfo (M1-12). Die Zahlen sind Schaetzungen der Kundin und weichen leicht ab (z. B. "zwanzigmal am Tag", 80-100 Termine) (M2-1).
- No-Show-Eskalation und Sperre (BR2): v1 oder spaeter, noch zu entscheiden.

**Out of Scope**
- No-Show-Gebuehr oder Rechnungsstellung (M1-5)
- Online-Buchung von Akut, Blutabnahme und Erstgespraech (M1-6)
- Automatische Abbildung des Akut-Ueberziehungspuffers (M1-10)
- Automatisches Umbuchen bei Schliessung oder Abwesenheit (M2-6)
- Technische Umsetzung der Slot-Sperre (Loesungsweg ist Sache des Entwicklungsteams) (M1-9)

## 7. Offene Fragen und Annahmen

- Aufhebung der No-Show-Sperre ist intern nicht final geregelt. Idee der Kundin: manuell durch die MFA nach einem Gespraech oder nach einem Jahr ohne weiteren Vorfall. **Annahme:** Die MFA kann die Sperre jederzeit aufheben, die App erzwingt keine feste Frist. (M2-7)
- Wer ist fuer Rezeptantraege "gerade zustaendig" (fester Patient-Arzt-Bezug oder Tagesplan)? (M1-3)
- Gilt der Opt-in getrennt fuer SMS und E-Mail, und ist er widerrufbar? Annahme: Ja, je Kanal und widerrufbar.
- Erzeugt die App den Brief fuer die schriftliche Erinnerung selbst oder legt sie nur eine Aufgabe fuer die MFA an? Annahme: Aufgabe fuer die MFA.
- Wie lange dauert eine Impfung? Wie lange bleibt ein Slot bei abgebrochener Online-Buchung reserviert? (M1-6, M1-9)
- **Annahme:** Online-Buchung nur fuer Bestandspatient:innen, da Neupatient:innen noch keine Nummer haben und das Erstgespraech telefonisch laeuft. (M1-7, M1-11)
- **Annahme:** Wer die Terminart "Akut" durchfuehrt, ist nicht genannt. Es wird angenommen, dass alle drei Aerzt:innen sie anbieten.
- **Annahme:** Bei Urlaub einer einzelnen Aerzt:in gilt fuer gebuchte Termine dasselbe wie bei einer Praxisschliessung (BR4).
- "Haben wir etwas uebersehen?" blieb in Meeting 2 unbeantwortet (technisches Problem, M2-8).

## 8. Aenderungen gegenueber Version 1

- Neue Entitaet Einwilligung (Beziehung 11), Patientenschluessel nach Versicherungsart getrennt.
- BR2 erweitert: rollierendes 12-Monats-Fenster, automatische Zaehlung, Sperre durch MFA, Zustellung der Erinnerung nach Opt-in.
- BR4 erweitert: Anzeige betroffener Termine bei nachtraeglicher Schliessung, kein automatisches Umbuchen.
- Neue Regel BR9 (Identifikation und Kommunikation, DSGVO).
- Geschlossene offene Fragen: Zaehlung rollierend, bestehende Termine bei Schliessung.
- Vorab-Fragebogen bleibt Prioritaet "spaeter".
