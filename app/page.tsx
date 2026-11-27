import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const trust = [
  { wert: "3", label: "Ärzt:innen im Team" },
  { wert: "4", label: "MFAs am Empfang" },
  { wert: "2.500", label: "Stammpatient:innen pro Quartal" },
  { wert: "80–110", label: "Termine pro Tag" },
];

const schritte = [
  {
    nummer: "01",
    icon: ShieldCheck,
    titel: "Identifizieren",
    text: "Versicherungsart und Versichertennummer eingeben. Online buchbar sind Bestandspatient:innen.",
  },
  {
    nummer: "02",
    icon: ClipboardList,
    titel: "Terminart wählen",
    text: "Vorsorge, Beratung, Impfung oder Rezept-Abholung – passend zu Ihrem Anliegen.",
  },
  {
    nummer: "03",
    icon: CalendarCheck,
    titel: "Slot bestätigen",
    text: "Freien Termin auswählen und verbindlich buchen. Der Slot ist sofort für Sie reserviert.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill bg-accent-soft px-3.5 py-1.5 text-sm font-medium text-accent">
              <Sparkles className="size-4" aria-hidden />
              Online-Terminbuchung
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
              Ihr Termin, <br className="hidden sm:block" />
              ohne Warteschleife.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              Praxis Demir &amp; Kollegen in Berlin-Wedding. Buchen Sie Vorsorge,
              Beratung, Impfung oder Rezept-Abholung bequem online – rund um die Uhr.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/buchen"
                className="inline-flex items-center gap-2 rounded-pill bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-strong"
              >
                Termin buchen
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-6 py-3 font-medium text-ink transition hover:bg-sand"
              >
                Zum Terminplan
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
              <Phone className="size-4 text-accent" aria-hidden />
              Akut, Blutabnahme und Erstgespräch bleiben beim Telefon.
            </p>
          </div>

          {/* Dekorative Fläche – ruhige Linien und Verläufe, keine Fotos */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-4/5 overflow-hidden rounded-card border border-line bg-sand">
              <div className="absolute -top-16 -right-16 size-72 rounded-full bg-accent-soft blur-2xl" />
              <div className="absolute bottom-10 -left-10 size-56 rounded-full bg-white/70 blur-2xl" />
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  Unser Team
                </span>
                <div className="space-y-5">
                  {[
                    "Dr. Aylin Demir",
                    "Dr. Schaefer",
                    "Dr. Yilmaz",
                  ].map((name, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between border-b border-line pb-4 last:border-0"
                    >
                      <span className="font-display text-lg font-semibold">
                        {name}
                      </span>
                      <span className="tabular text-sm text-ink-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-ink-muted">
                  Fachärzt:innen für Allgemeinmedizin – Impfungen führt Dr. Demir
                  durch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust-Reihe */}
      <section className="border-y border-line bg-sand">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.label}>
              <p className="font-display text-4xl font-semibold tabular">{t.wert}</p>
              <p className="mt-1 text-sm text-ink-muted">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ablauf in drei Schritten */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
            So funktioniert es
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
            In drei Schritten zum Termin
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {schritte.map((s) => (
            <article
              key={s.nummer}
              className="rounded-card border border-line bg-surface p-7 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <span className="font-display text-3xl font-semibold text-line tabular">
                  {s.nummer}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{s.titel}</h3>
              <p className="mt-2 text-sm text-ink-muted">{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-card bg-accent px-8 py-12 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">
              Bereit? Wählen Sie Ihren Termin.
            </h2>
            <p className="mt-3 max-w-lg text-white/80">
              Die Buchung ist verbindlich. Sobald Sie bestätigen, ist der Termin für
              Sie reserviert.
            </p>
          </div>
          <Link
            href="/buchen"
            className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-white px-6 py-3 font-medium text-accent transition hover:bg-accent-soft"
          >
            Termin buchen
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
