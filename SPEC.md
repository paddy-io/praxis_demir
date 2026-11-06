# SPEC.md - Online-Terminbuchung Praxis Demir & Kollegen (K5)

Stand: nach Meeting 1 (12 von 12 Nachrichten). Quelle der Regeln: Chat mit Dr. Aylin Demir; `M1-n` verweist auf die Nachricht n.

## 1. Kontext

- Kundin: Dr. Aylin Demir, Allgemeinmedizin, Gemeinschaftspraxis in Berlin-Wedding.
- Team: 3 Aerzt:innen (Dr. Demir, Dr. Schaefer, Dr. Yilmaz), 4 MFAs, ca. 2.500 Stammpatient:innen pro Quartal, 80-110 Termine pro Tag. (M1-1, M1-12)
- Problem: Die Terminvergabe am Telefon bindet die MFAs. Gewuenscht ist eine praxistaugliche Online-Buchung. (M1-1)
- Erfolgskriterium: Die MFAs haben weniger Telefonate. (M1-11)
- Prinzip: Die App unterstuetzt die MFA, sie entscheidet nicht. Das gilt fuer Akut-Kulanz, No-Show-Sperre und Erstgespraech. (M1-2, M1-4, M1-7)

## 2. Entitaeten

| Entitaet | Schluessel | Attribute |
|---|---|---|
| Patient | Patientennummer | Name, Versicherungsart (gesetzlich oder privat), Status (neu oder Bestand), Online-Buchung gesperrt (ja/nein) |
| Aerztin | Aerztin-ID | Name |
| MFA | MFA-ID | Name |
| Terminart | Terminart-ID | Bezeichnung, Dauer in Minuten, online buchbar (ja/nein) |
| Termin | Termin-ID | Status (gebucht, erschienen, abgesagt, No-Show), Kanal (Telefon, Tresen, Online), nachtraeglich erfasst (ja/nein), Dringlichkeit |
| Slot | Slot-ID | Datum, Halbtag (Vormittag oder Nachmittag), Art (normal oder Akut), Status (frei oder belegt) |
| Abwesenheit | Abwesenheits-ID | von, bis, Geltungsbereich (einzelne Aerzt:in oder ganze Praxis), Art (Urlaub, Brueckentag, Fortbildung) |
| Rezeptantrag | Antrags-ID | Status (angelegt, freigegeben), Datum |

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

Hinweis: Die Attributlisten sind aus den Antworten abgeleitet. Die Schluessel und einzelne Attribute sind Annahmen und in Abschnitt 6 vermerkt.

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

Die n:m-Beziehung Aerztin - Terminart traegt das Attribut "Dauer" nur, wenn die Dauer je Aerztin abweicht. Das wurde nicht gesagt. Impfung ist nur Dr. Demir zugeordnet, alle anderen Terminarten allen drei Aerzt:innen. (M1-6, M1-8)

## 4. Business Rules

- **BR1 Akut-Kontingent (M1-2, M1-10):** Akutslots sind pro Vormittag und Nachmittag begrenzt. Sind sie voll, zeigt die App "keine Akutslots frei". Der weitere Weg laeuft ueber das Telefon. Eine MFA kann in Absprache mit einer Aerzt:in einen zusaetzlichen Termin im Praxisablauf einschieben (informelle Kulanz). Dieser wird nachtraeglich manuell erfasst und als "nachtraeglich erfasst" gekennzeichnet. Die App bildet die Kulanz nicht ab.
- **BR2 Absage und No-Show (M1-4, M1-5):** Absagen sind mindestens 24 Stunden vorher erwartet. Beim zweiten No-Show innerhalb eines Jahres gibt es eine schriftliche Erinnerung, beim dritten wird die Online-Buchung gesperrt (danach nur telefonisch). Die App erfasst jeden No-Show und fuehrt den Zaehler. Die Sperre greift nicht vollautomatisch: Eine MFA entscheidet vorher. Mit triftigem Grund vermerkt die MFA den Fall, und der Zaehler wird nicht erhoeht. Es gibt keine No-Show-Gebuehr, weder bei Kassen- noch bei Privatpatient:innen.
- **BR3 Rezepte (M1-1, M1-3):** Die MFA legt den Wiederholungsrezept-Antrag an. Nur eine Aerzt:in darf ihn freigeben (Arztvorbehalt, nicht verhandelbar). Bei Abwesenheit der zustaendigen Aerzt:in gibt eine Kollegin oder ein Kollege frei.
- **BR4 Impfung und Abwesenheit (M1-8, M1-11):** Impfungen darf nur Dr. Demir durchfuehren (Qualifikation). Eine Abwesenheit sperrt nur die Slots der betroffenen Aerzt:in. Eine Praxisschliessung sperrt alle Slots des Tages und muss vor der Online-Buchung hinterlegt sein.
- **BR5 Ein Slot, ein Termin (M1-9):** Pro Slot gibt es genau einen Termin. Wer zuerst bestaetigt, hat den Termin. Der Slot wird im Moment der Buchung gesperrt, kanalunabhaengig (Telefon, Tresen, Online). Es gibt keine "kurze Reservierung".

Weitere Regeln:

- **BR6 Online-Buchbarkeit (M1-6):** Online buchbar sind nur Vorsorge, Beratung, Impfung und Rezept-Abholung. Akut, Blutabnahme und Erstgespraech bleiben beim Telefon.
- **BR7 Berechtigungen (M1-3):** Termine eintragen, aendern und absagen darf nur die MFA. Alle vier MFAs haben im Buchungssystem dieselben Rechte.
- **BR8 Erstgespraech (M1-7):** Die MFA fuehrt telefonisch eine Vorklaerung durch (Versicherung, grobe Situation, Dringlichkeit, Aufnahme moeglich, passende Aerzt:in). Das Erstgespraech selbst fuehrt eine Aerzt:in in der Praxis (20-30 Min.).

## 5. Widersprueche (aufgeloest)

- **W1 Erstgespraech (M1-6, M1-7):** Aussage A: "Erstgespraeche machen alle drei Aerzt:innen". Aussage B: "Das macht eine MFA telefonisch." **Aufloesung:** Beides stimmt auf zwei Ebenen. Die MFA koordiniert telefonisch (Mini-Triage), die Aerzt:in fuehrt das Gespraech in der Praxis. Das Erstgespraech bleibt telefonisch und ist nicht online buchbar.
- **W2 Akut (M1-2, M1-9, M1-10):** Aussage A: "Ein Slot, ein Termin, keine Ausnahme." Aussage B: "Bei Akutfaellen findet die MFA trotzdem irgendwie einen Platz." **Aufloesung:** Offiziell gilt BR5. Der Ueberziehungspuffer (5-10 Minuten zwischen zwei Terminen) ist keine Slot-Buchung, sondern informelle Kulanz. Er wird nachtraeglich manuell erfasst. Annahme: Die App erzwingt BR5 und erlaubt den manuellen Nachtrag, ohne einen Slot zu belegen.

## 6. Prioritaeten

**v1 (muss am ersten Tag laufen) (M1-11)**
- Online-Buchung fuer Vorsorge, Beratung, Impfung und Rezept-Abholung
- Eindeutige Identifikation der Patient:in ueber Versichertennummer oder Praxis-Patientennummer
- Slot-Sperre im Moment der Buchung (BR5)
- Abwesenheit und Praxisschliessung (BR4)

**Spaeter**
- Vorab-Fragebogen nach der Online-Buchung, passend zur Terminart, Antworten als Notiz am Termin (M1-12). Die Kundin sieht ihn als naechsten Schritt, wenn die Basis laeuft. Geschaetzter Nutzen: ca. 5 Minuten pro Termin bei 80-110 Terminen pro Tag. Etwa 30 % der Patient:innen kommen ohne Vorabinfo.
- No-Show-Eskalation und Sperre (BR2): v1 oder spaeter, noch zu entscheiden.

**Out of Scope**
- No-Show-Gebuehr oder Rechnungsstellung (M1-5)
- Online-Buchung von Akut, Blutabnahme und Erstgespraech (M1-6)
- Automatische Abbildung des Akut-Ueberziehungspuffers (M1-10)
- Technische Umsetzung der Slot-Sperre (Loesungsweg ist Sache des Entwicklungsteams) (M1-9)

## 7. Offene Fragen und Annahmen

- Wer ist fuer Rezeptantraege "gerade zustaendig" (fester Patient-Arzt-Bezug oder Tagesplan)? (M1-3)
- Was passiert mit bereits gebuchten Terminen, wenn nachtraeglich ein Urlaub oder eine Schliessung eingetragen wird? (M1-8, M1-11)
- Wird der No-Show-Zaehler rollierend (12 Monate ab heute) oder pro Kalenderjahr gefuehrt? Wann endet die Sperre? (M1-4)
- Wie lange dauert eine Impfung? Wie lange bleibt ein Slot bei abgebrochener Online-Buchung reserviert? (M1-6, M1-9)
- Annahme: Online-Buchung nur fuer Bestandspatient:innen, da Neupatient:innen noch keine Praxis-Patientennummer haben und das Erstgespraech telefonisch laeuft. (M1-7, M1-11)
- Annahme: Der Patientenschluessel ist die Versichertennummer oder die Praxis-Patientennummer. (M1-11)
- Annahme: Wer die Terminart "Akut" durchfuehrt, ist nicht genannt. Es wird angenommen, dass alle drei Aerzt:innen sie anbieten.
- Annahme: Bei Urlaub einer einzelnen Aerzt:in gilt fuer gebuchte Termine dasselbe wie bei einer Praxisschliessung.
