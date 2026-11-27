import {
  BellRing,
  ListChecks,
  Mail,
  ShieldAlert,
  UserX,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getNoShowKandidaten,
  getNoShowUebersicht,
  getOffeneErinnerungen,
} from "@/lib/noshow";
import { NoShowForm } from "./noshow-form";
import { SperreButton } from "./sperre-button";
import { ErinnerungButton } from "./erinnerung-button";

export const dynamic = "force-dynamic";

function formatDatum(datum: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(datum);
}

const kanalLabel: Record<string, string> = {
  EMAIL: "E-Mail",
  BRIEF: "Brief",
  ANRUF: "Anruf",
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

export default async function NoShowPage() {
  const [kandidaten, uebersicht, erinnerungen] = await Promise.all([
    getNoShowKandidaten(prisma),
    getNoShowUebersicht(prisma),
    getOffeneErinnerungen(prisma),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          No-Show
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          No-Shows und Online-Sperre
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Gezählt wird in den letzten 12 Monaten. Beim zweiten No-Show entsteht eine
          Erinnerungsaufgabe, beim dritten kann die Online-Buchung gesperrt werden.
          Die Sperre setzt und hebt die MFA.
        </p>
      </header>

      <Abschnitt
        icon={UserX}
        titel="No-Show erfassen"
        beschreibung="Ein triftiger Grund zählt nicht mit."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          {kandidaten.length === 0 ? (
            <p className="rounded-lg bg-sand px-4 py-6 text-center text-sm text-ink-muted">
              Es gibt gerade keine gebuchten Termine, die erfasst werden könnten.
            </p>
          ) : (
            <NoShowForm
              kandidaten={kandidaten.map((t) => ({
                id: t.id,
                label: `${formatDatum(t.slot.datum)}, ${t.slot.beginn} · ${t.patient.name} · ${t.aerztin.name}`,
              }))}
            />
          )}
        </div>
      </Abschnitt>

      <Abschnitt
        icon={ShieldAlert}
        titel="No-Show-Übersicht"
        beschreibung="Anzahl im rollierenden 12-Monats-Fenster und Sperrstatus."
      >
        {uebersicht.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <ShieldAlert className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Keine No-Shows im Fenster</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald ein No-Show erfasst ist, erscheint die Patient:in hier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Patient:in</th>
                  <th className="px-5 py-3.5 font-medium">No-Shows</th>
                  <th className="px-5 py-3.5 font-medium">Stufe</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Sperre</th>
                </tr>
              </thead>
              <tbody>
                {uebersicht.map((z) => (
                  <tr
                    key={z.patientId}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4">{z.name}</td>
                    <td className="px-5 py-4 tabular">{z.anzahl}</td>
                    <td className="px-5 py-4 text-ink-muted">{z.hinweis}</td>
                    <td className="px-5 py-4">
                      {z.onlineBuchungGesperrt ? (
                        <span className="rounded-pill bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          gesperrt
                        </span>
                      ) : (
                        <span className="rounded-pill bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
                          offen
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <SperreButton
                        patientId={z.patientId}
                        gesperrt={z.onlineBuchungGesperrt}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Abschnitt>

      <Abschnitt
        icon={BellRing}
        titel="Offene Erinnerungen"
        beschreibung="Aufgaben für die MFA; E-Mail nur mit Opt-in, sonst Brief."
      >
        {erinnerungen.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <BellRing className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Keine offenen Erinnerungen</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Erinnerungen entstehen automatisch beim zweiten No-Show.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Patient:in</th>
                  <th className="px-5 py-3.5 font-medium">Kanal</th>
                  <th className="px-5 py-3.5 font-medium">Ausgelöst am</th>
                  <th className="px-5 py-3.5 text-right font-medium">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {erinnerungen.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4">{e.patient.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-ink-muted">
                        <Mail className="size-3.5" aria-hidden />
                        {kanalLabel[e.kanal] ?? e.kanal}
                      </span>
                    </td>
                    <td className="px-5 py-4 tabular">{formatDatum(e.ausgeloestAm)}</td>
                    <td className="px-5 py-4">
                      <ErinnerungButton erinnerungId={e.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Abschnitt>
    </main>
  );
}
