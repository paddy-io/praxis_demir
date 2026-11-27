import { CalendarOff, CalendarX2, ListChecks, TriangleAlert } from "lucide-react";
import {
  getAbwesenheiten,
  getAerztinnen,
  getBetroffeneTermine,
} from "@/lib/data";
import { AbwesenheitForm } from "./abwesenheit-form";

export const dynamic = "force-dynamic";

function formatDatum(datum: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(datum);
}

const artLabel: Record<string, string> = {
  URLAUB: "Urlaub",
  BRUECKENTAG: "Brückentag",
  FORTBILDUNG: "Fortbildung",
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

export default async function AbwesenheitPage() {
  const [aerztinnen, abwesenheiten, betroffeneTermine] = await Promise.all([
    getAerztinnen(),
    getAbwesenheiten(),
    getBetroffeneTermine(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Abwesenheit
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Abwesenheit und Schließung pflegen
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Eine Abwesenheit sperrt nur die Slots einer Ärztin. Eine
          Praxisschließung sperrt alle Slots des Tages. Betroffene Termine werden
          sofort als „betroffen – Umbuchung offen“ angezeigt.
        </p>
      </header>

      <Abschnitt
        icon={CalendarOff}
        titel="Abwesenheit eintragen"
        beschreibung="Zeitraum, Art und Geltungsbereich festlegen."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          <AbwesenheitForm
            aerztinnen={aerztinnen.map((a) => ({ id: a.id, name: a.name }))}
          />
        </div>
      </Abschnitt>

      <Abschnitt
        icon={CalendarX2}
        titel="Hinterlegte Abwesenheiten"
        beschreibung="Alle eingetragenen Zeiträume."
      >
        {abwesenheiten.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <CalendarOff className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Noch keine Abwesenheit hinterlegt</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald ein Zeitraum eingetragen ist, erscheint er hier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Von</th>
                  <th className="px-5 py-3.5 font-medium">Bis</th>
                  <th className="px-5 py-3.5 font-medium">Geltungsbereich</th>
                  <th className="px-5 py-3.5 font-medium">Art</th>
                </tr>
              </thead>
              <tbody>
                {abwesenheiten.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4 tabular">{formatDatum(a.von)}</td>
                    <td className="px-5 py-4 tabular">{formatDatum(a.bis)}</td>
                    <td className="px-5 py-4">
                      {a.geltungsbereich === "PRAXIS" ? (
                        <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                          Praxisschließung
                        </span>
                      ) : (
                        a.aerztin?.name ?? "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {artLabel[a.art] ?? a.art}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Abschnitt>

      <Abschnitt
        icon={TriangleAlert}
        titel="Betroffene Termine"
        beschreibung="Diese Termine brauchen eine Umbuchung. Die MFA entscheidet, wie sie kontaktiert."
      >
        {betroffeneTermine.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <TriangleAlert className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Keine betroffenen Termine</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Aktuell ist kein gebuchter Termin von einer Abwesenheit betroffen.
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
                  <th className="px-5 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {betroffeneTermine.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4 tabular">{formatDatum(t.slot.datum)}</td>
                    <td className="px-5 py-4 tabular">{t.slot.beginn}</td>
                    <td className="px-5 py-4">{t.patient.name}</td>
                    <td className="px-5 py-4 text-ink-muted">{t.aerztin.name}</td>
                    <td className="px-5 py-4 text-ink-muted">{t.terminart.bezeichnung}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-pill bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        <TriangleAlert className="size-3.5" aria-hidden />
                        betroffen
                      </span>
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
