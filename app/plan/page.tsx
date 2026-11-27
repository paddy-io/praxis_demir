import { BadgeCheck, CalendarClock, CalendarPlus, ListChecks } from "lucide-react";
import { getAerztinnen, getSlots, getTerminarten } from "@/lib/data";
import { istOnlineBuchbar } from "@/lib/rules";
import { SlotForm } from "./slot-form";

export const dynamic = "force-dynamic";

function formatDatum(datum: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(datum);
}

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

export default async function PlanPage() {
  const [terminarten, aerztinnen, slots] = await Promise.all([
    getTerminarten(),
    getAerztinnen(),
    getSlots(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Terminplan
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Slots und Terminarten pflegen
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Die MFA legt fest, welche Termine zu welcher Zeit vergeben werden können.
          Nur Terminarten mit Häkchen sind online buchbar.
        </p>
      </header>

      <Abschnitt
        icon={ListChecks}
        titel="Terminarten"
        beschreibung="Welche Leistungen es gibt und ob sie online buchbar sind."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terminarten.map((art) => {
            const online = istOnlineBuchbar(art.bezeichnung);
            return (
              <article
                key={art.id}
                className="rounded-card border border-line bg-surface p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{art.bezeichnung}</h3>
                  {online ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                      <BadgeCheck className="size-3.5" aria-hidden />
                      online
                    </span>
                  ) : (
                    <span className="rounded-pill bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
                      Telefon
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-ink-muted">
                  Dauer: <span className="tabular">{art.dauerMinuten}</span> Min.
                </p>
              </article>
            );
          })}
        </div>
      </Abschnitt>

      <Abschnitt
        icon={CalendarPlus}
        titel="Neuen Slot anlegen"
        beschreibung="Eine freie Zeit für eine Ärztin eintragen."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          <SlotForm aerztinnen={aerztinnen.map((a) => ({ id: a.id, name: a.name }))} />
        </div>
      </Abschnitt>

      <Abschnitt
        icon={CalendarClock}
        titel="Geplante Slots"
        beschreibung="Alle eingetragenen Zeiten mit Status."
      >
        {slots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
            <CalendarClock className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Noch keine Slots angelegt</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald die erste Zeit eingetragen ist, erscheint sie hier als Tabelle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Datum</th>
                  <th className="px-5 py-3.5 font-medium">Uhrzeit</th>
                  <th className="px-5 py-3.5 font-medium">Ärztin</th>
                  <th className="px-5 py-3.5 font-medium">Halbtag</th>
                  <th className="px-5 py-3.5 font-medium">Art</th>
                  <th className="px-5 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr
                    key={slot.id}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4 tabular">{formatDatum(slot.datum)}</td>
                    <td className="px-5 py-4 tabular">{slot.beginn}</td>
                    <td className="px-5 py-4">{slot.aerztin.name}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {slot.halbtag === "VORMITTAG" ? "Vormittag" : "Nachmittag"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {slot.art === "AKUT" ? "Akut" : "Normal"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {slot.status === "FREI" ? (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                          <BadgeCheck className="size-3.5" aria-hidden />
                          frei
                        </span>
                      ) : (
                        <span className="rounded-pill bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
                          belegt
                        </span>
                      )}
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
