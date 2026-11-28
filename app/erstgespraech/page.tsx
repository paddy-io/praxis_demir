import { ListChecks, Phone, PhoneCall, UserRoundPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAerztinnen, getFreieSlots, getMFAs } from "@/lib/data";
import { getErstgespraeche } from "@/lib/erstgespraech";
import { VorklaerungForm } from "./vorklaerung-form";

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

export default async function ErstgespraechPage() {
  const [mfas, aerztinnen, slots, gespraeche] = await Promise.all([
    getMFAs(),
    getAerztinnen(),
    getFreieSlots(),
    getErstgespraeche(prisma),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Erstgespräch
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Erstgespräch vorklären
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Die MFA klärt am Telefon Versicherung, grobe Situation, Dringlichkeit und
          die passende Ärztin. Das Erstgespräch selbst führt eine Ärztin in der
          Praxis – es ist nicht online buchbar.
        </p>
      </header>

      <Abschnitt
        icon={PhoneCall}
        titel="Vorklärung erfassen"
        beschreibung="Bestandspatient:in wählen oder eine neue Patient:in anlegen."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          {slots.length === 0 || mfas.length === 0 ? (
            <p className="rounded-lg bg-sand px-4 py-6 text-center text-sm text-ink-muted">
              Es fehlen freie Slots oder MFAs. Bitte zuerst im Terminplan anlegen.
            </p>
          ) : (
            <VorklaerungForm
              mfas={mfas.map((m) => ({ id: m.id, name: m.name }))}
              aerztinnen={aerztinnen.map((a) => ({ id: a.id, name: a.name }))}
              slots={slots.map((s) => ({
                id: s.id,
                aerztinId: s.aerztinId,
                label: `${formatDatum(s.datum)}, ${s.beginn} · ${s.aerztin.name}`,
              }))}
            />
          )}
        </div>
      </Abschnitt>

      <Abschnitt
        icon={Phone}
        titel="Erfasste Erstgespräche"
        beschreibung="Vorklärung und vergebener Termin."
      >
        {gespraeche.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
            <UserRoundPlus className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Noch keine Erstgespräche</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald eine Vorklärung erfasst ist, erscheint sie hier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Patient:in</th>
                  <th className="px-5 py-3.5 font-medium">Situation</th>
                  <th className="px-5 py-3.5 font-medium">Dringlichkeit</th>
                  <th className="px-5 py-3.5 font-medium">Ärztin</th>
                  <th className="px-5 py-3.5 font-medium">Termin</th>
                  <th className="px-5 py-3.5 font-medium">Vorklärung</th>
                </tr>
              </thead>
              <tbody>
                {gespraeche.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-line transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4">
                      {g.patient.name}
                      {g.patient.status === "NEU" ? (
                        <span className="ml-2 rounded-pill bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                          neu
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{g.situation}</td>
                    <td className="px-5 py-4 text-ink-muted">{g.dringlichkeit}</td>
                    <td className="px-5 py-4">{g.aerztin.name}</td>
                    <td className="px-5 py-4 tabular">
                      {g.termin.slot
                        ? `${formatDatum(g.termin.slot.datum)}, ${g.termin.slot.beginn}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {g.mfa.name}
                      <span className="block text-xs tabular">
                        {formatDatum(g.erfasstAm)}
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
