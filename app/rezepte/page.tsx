import { FilePlus2, ListChecks, Pill, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAerztinnen, getMFAs } from "@/lib/data";
import { getRezeptantraege } from "@/lib/rezept";
import { aerztinAbwesend } from "@/lib/rules";
import { AnlegenForm } from "./anlegen-form";
import { FreigebenForm } from "./freigeben-form";

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

export default async function RezeptePage() {
  const [antraege, mfas, aerztinnen, abwesenheiten] = await Promise.all([
    getRezeptantraege(prisma),
    getMFAs(),
    getAerztinnen(),
    prisma.abwesenheit.findMany(),
  ]);

  const heute = new Date();
  const aerztinnenMitStatus = aerztinnen.map((a) => ({
    id: a.id,
    name: a.name,
    abwesend: aerztinAbwesend(abwesenheiten, a.id, heute),
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Rezepte
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Wiederholungsrezepte
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Die MFA legt den Antrag an, eine Ärztin oder ein Arzt gibt ihn frei
          (Arztvorbehalt). Bei Abwesenheit kann eine anwesende Kollegin oder ein
          Kollege freigeben.
        </p>
      </header>

      <Abschnitt
        icon={FilePlus2}
        titel="Rezeptantrag anlegen"
        beschreibung="Patient:in identifizieren und optional eine Notiz ergänzen."
      >
        <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7">
          {mfas.length === 0 ? (
            <p className="rounded-lg bg-sand px-4 py-6 text-center text-sm text-ink-muted">
              Es ist noch keine MFA angelegt.
            </p>
          ) : (
            <AnlegenForm mfas={mfas.map((m) => ({ id: m.id, name: m.name }))} />
          )}
        </div>
      </Abschnitt>

      <Abschnitt
        icon={Pill}
        titel="Rezeptanträge"
        beschreibung="Offene Anträge können hier freigegeben werden."
      >
        {antraege.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
            <Pill className="size-8 text-ink-muted" aria-hidden />
            <p className="font-medium">Noch keine Rezeptanträge</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Sobald der erste Antrag angelegt ist, erscheint er hier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Patient:in</th>
                  <th className="px-5 py-3.5 font-medium">Notiz</th>
                  <th className="px-5 py-3.5 font-medium">Angelegt</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Freigabe</th>
                  <th className="px-5 py-3.5 text-right font-medium">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {antraege.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-line align-top transition last:border-0 hover:bg-sand"
                  >
                    <td className="px-5 py-4">{a.patient.name}</td>
                    <td className="px-5 py-4 text-ink-muted">{a.notiz ?? "—"}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      <span className="tabular">{formatDatum(a.datum)}</span>
                      <span className="block text-xs">{a.angelegtVon.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      {a.status === "FREIGEGEBEN" ? (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                          <ShieldCheck className="size-3.5" aria-hidden />
                          freigegeben
                        </span>
                      ) : (
                        <span className="rounded-pill bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
                          angelegt
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {a.freigegebenVon ? (
                        <>
                          {a.freigegebenVon.name}
                          <span className="block text-xs tabular">
                            {a.freigegebenAm ? formatDatum(a.freigegebenAm) : ""}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {a.status === "ANGELEGT" ? (
                        <FreigebenForm
                          antragId={a.id}
                          aerztinnen={aerztinnenMitStatus}
                        />
                      ) : (
                        <span className="block text-right text-xs text-ink-muted">
                          abgeschlossen
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
