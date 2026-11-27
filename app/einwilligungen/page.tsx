import { BellRing, Mail, Search, Smartphone, UserRound, ListChecks } from "lucide-react";
import { getEinwilligungen, findePatient } from "@/lib/einwilligung";
import { prisma } from "@/lib/prisma";
import { istEinwilligungAktiv } from "@/lib/rules";
import { EinwilligungButtons } from "./einwilligung-buttons";

export const dynamic = "force-dynamic";

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

const kanalInfo = {
  EMAIL: { label: "E-Mail", icon: Mail },
  SMS: { label: "SMS", icon: Smartphone },
} as const;

export default async function EinwilligungenPage({
  searchParams,
}: {
  searchParams: Promise<{ nummer?: string }>;
}) {
  const { nummer } = await searchParams;
  const gesucht = nummer?.trim() ?? "";
  const patient = gesucht ? await findePatient(prisma, gesucht) : null;
  const einwilligungen = patient
    ? await getEinwilligungen(prisma, patient.id)
    : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Einwilligungen
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Opt-in verwalten
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          SMS und E-Mail nur mit ausdrücklicher Zustimmung. Standardmäßig wird
          nichts verschickt. Der Status wird je Kanal getrennt gespeichert und ist
          widerrufbar.
        </p>
      </header>

      <Abschnitt
        icon={Search}
        titel="Patient:in suchen"
        beschreibung="Über die Versichertennummer (gesetzlich) oder die Patientennummer (privat)."
      >
        <form method="get" className="flex flex-col gap-3 sm:flex-row">
          <input
            name="nummer"
            defaultValue={gesucht}
            placeholder="z. B. A123456789 oder P-1000"
            className="tabular w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong"
          >
            <Search className="size-4" aria-hidden />
            Suchen
          </button>
        </form>
      </Abschnitt>

      {gesucht && !patient ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
          <UserRound className="size-8 text-ink-muted" aria-hidden />
          <p className="font-medium">Keine Patient:in gefunden</p>
          <p className="max-w-sm text-sm text-ink-muted">
            Bitte die Nummer prüfen. Gesetzlich Versicherte nutzen die
            Versichertennummer, Privatpatient:innen die interne Patientennummer.
          </p>
        </div>
      ) : null}

      {patient ? (
        <Abschnitt
          icon={BellRing}
          titel={patient.name}
          beschreibung={
            patient.versicherungsart === "GESETZLICH"
              ? `Gesetzlich versichert · ${patient.versichertennummer}`
              : `Privatpatient:in · ${patient.patientennummer}`
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {(["EMAIL", "SMS"] as const).map((kanal) => {
              const eintrag = einwilligungen.find((e) => e.kanal === kanal);
              const aktiv = eintrag ? istEinwilligungAktiv(eintrag) : false;
              const info = kanalInfo[kanal];
              const Icon = info.icon;
              return (
                <article
                  key={kanal}
                  className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-accent" aria-hidden />
                      {info.label}
                    </span>
                    {aktiv ? (
                      <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                        erlaubt
                      </span>
                    ) : (
                      <span className="rounded-pill bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
                        kein Opt-in
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted">
                    {eintrag
                      ? aktiv
                        ? `Erteilt am ${eintrag.erteiltAm.toLocaleDateString("de-DE")}.`
                        : `Widerrufen am ${eintrag.widerrufenAm?.toLocaleDateString("de-DE") ?? "—"}.`
                      : "Noch keine Einwilligung hinterlegt."}
                  </p>
                  <EinwilligungButtons
                    patientId={patient.id}
                    kanal={kanal}
                    aktiv={aktiv}
                  />
                </article>
              );
            })}
          </div>
        </Abschnitt>
      ) : null}
    </main>
  );
}
