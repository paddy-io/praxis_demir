import {
  BadgeCheck,
  CalendarClock,
  CalendarOff,
  ClipboardList,
  ClipboardPlus,
  ListChecks,
  Phone,
} from "lucide-react";
import {
  getAerztinnen,
  getFreieSlots,
  getMFAs,
  getTerminarten,
  getTermine,
} from "@/lib/data";
import { getNachtraege } from "@/lib/nachtrag";
import { prisma } from "@/lib/prisma";
import { terminAenderbar } from "@/lib/rules";
import { ErfassenForm } from "./erfassen-form";
import { NachtragForm } from "./nachtrag-form";
import { TerminAktionen } from "./termin-aktionen";

export const dynamic = "force-dynamic";

function formatDatum(datum: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(datum);
}

const statusBadge: Record<string, { label: string; klasse: string }> = {
  GEBUCHT: { label: "gebucht", klasse: "bg-accent-soft text-accent" },
  ERSCHIENEN: { label: "erschienen", klasse: "bg-accent-soft text-accent" },
  ABSAGT: { label: "abgesagt", klasse: "bg-sand text-ink-muted" },
  NO_SHOW: { label: "No-Show", klasse: "bg-red-50 text-red-700" },
  BETROFFEN: { label: "betroffen", klasse: "bg-amber-100 text-amber-800" },
};

const kanalLabel: Record<string, string> = {
  TELEFON: "Telefon",
  TRESEN: "Tresen",
  ONLINE: "Online",
};

function Abschnitt({
  icon: Icon,
  titel,
  beschreibung,
  children,
}: {
  icon: typeof ListChecks;
  titel: string;
  beschreibung?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight">{titel}</h2>
          {beschreibung ? (
            <p className="mt-1 text-sm text-ink-muted">{beschreibung}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function TerminePage() {
  const [terminarten, slots, termine, mfas, nachtraege, aerztinnen] =
    await Promise.all([
      getTerminarten(),
      getFreieSlots(),
      getTermine(),
      getMFAs(),
      getNachtraege(prisma),
      getAerztinnen(),
    ]);

  const nachtragIds = new Set(nachtraege.map((n) => n.terminId));

  const slotLabel = (s: {
    id: number;
    datum: Date;
    beginn: string;
    aerztin: { name: string };
  }) => `${formatDatum(s.datum)}, ${s.beginn} · ${s.aerztin.name}`;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Termine
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Termine an Telefon und Tresen
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Die MFA erfasst, ändert und sagt Termine ab. Anders als online sind hier
          alle Terminarten möglich, auch Akut, Blutabnahme und Erstgespräch.
        </p>
      </header>

      <Abschnitt
        icon={ClipboardPlus}
        titel="Termin erfassen"
        beschreibung="Patient:in identifizieren, Terminart und freien Slot wählen."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          {slots.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center">
              <CalendarOff className="size-8 text-ink-muted" aria-hidden />
              <p className="font-medium">Keine freien Slots verfügbar</p>
              <p className="max-w-sm text-sm text-ink-muted">
                Legen Sie zuerst im Terminplan freie Zeiten an.
              </p>
            </div>
          ) : (
            <ErfassenForm
              terminarten={terminarten.map((a) => ({
                id: a.id,
                bezeichnung: a.bezeichnung,
              }))}
              slots={slots.map((s) => ({ id: s.id, label: slotLabel(s) }))}
              mfas={mfas.map((m) => ({ id: m.id, name: m.name }))}
            />
          )}
        </div>
      </Abschnitt>

      <Abschnitt
        icon={ClipboardList}
        titel="Nachtrag (Kulanz)"
        beschreibung="Zusätzlichen Termin in Absprache mit einer Ärztin eintragen. Belegt keinen Slot."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          <NachtragForm
            terminarten={terminarten.map((a) => ({
              id: a.id,
              bezeichnung: a.bezeichnung,
            }))}
            aerztinnen={aerztinnen.map((a) => ({ id: a.id, name: a.name }))}
            mfas={mfas.map((m) => ({ id: m.id, name: m.name }))}
          />
        </div>
      </Abschnitt>

      <Abschnitt
        icon={ListChecks}
        titel="Alle Termine"
        beschreibung="Umbuchen oder absagen; abgeschlossene Termine sind gesperrt."
      >
        {termine.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
            <CalendarClock className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Noch keine Termine</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald der erste Termin erfasst oder online gebucht ist, erscheint er
              hier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Datum</th>
                  <th className="px-5 py-3.5 font-medium">Uhrzeit</th>
                  <th className="px-5 py-3.5 font-medium">Patient:in</th>
                  <th className="px-5 py-3.5 font-medium">Ärztin</th>
                  <th className="px-5 py-3.5 font-medium">Terminart</th>
                  <th className="px-5 py-3.5 font-medium">Notiz</th>
                  <th className="px-5 py-3.5 font-medium">Kanal</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {termine.map((t) => {
                  const badge = statusBadge[t.status] ?? {
                    label: t.status,
                    klasse: "bg-sand text-ink-muted",
                  };
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-line align-top transition last:border-0 hover:bg-sand"
                    >
                      <td className="px-5 py-4 tabular">
                        {t.slot ? formatDatum(t.slot.datum) : "—"}
                      </td>
                      <td className="px-5 py-4 tabular">{t.slot?.beginn ?? "—"}</td>
                      <td className="px-5 py-4">{t.patient.name}</td>
                      <td className="px-5 py-4 text-ink-muted">{t.aerztin.name}</td>
                      <td className="px-5 py-4 text-ink-muted">
                        {t.terminart.bezeichnung}
                        {nachtragIds.has(t.id) ? (
                          <span className="mt-1 block w-fit rounded-pill bg-sand px-2 py-0.5 text-xs font-medium text-ink-muted">
                            nachtraeglich
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-ink-muted">
                        {t.notiz ? (
                          <span
                            className="block max-w-xs whitespace-pre-line text-xs"
                            title={t.notiz}
                          >
                            {t.notiz}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          {t.kanal === "ONLINE" ? (
                            <BadgeCheck className="size-3.5 text-accent" aria-hidden />
                          ) : (
                            <Phone className="size-3.5" aria-hidden />
                          )}
                          {kanalLabel[t.kanal] ?? t.kanal}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${badge.klasse}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <TerminAktionen
                          terminId={t.id}
                          terminartId={t.terminartId}
                          aenderbar={terminAenderbar(t.status)}
                          terminarten={terminarten.map((a) => ({
                            id: a.id,
                            bezeichnung: a.bezeichnung,
                          }))}
                          freieSlots={slots.map((s) => ({
                            id: s.id,
                            label: slotLabel(s),
                          }))}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Abschnitt>
    </main>
  );
}
