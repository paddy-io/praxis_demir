import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
        Praxis Demir &amp; Kollegen
      </p>
      <h1 className="font-display text-5xl leading-tight font-semibold text-balance sm:text-6xl">
        Online-Terminbuchung
      </h1>
      <p className="max-w-xl text-lg text-ink-muted">
        Das Projekt ist eingerichtet. Oberfläche, Datenmodell und Regeln entstehen
        Feature für Feature, beginnend mit F-001 aus dem Backlog.
      </p>
      <div className="rounded-card border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">F-001 Terminplan</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Terminarten ansehen und Slots für die Ärztinnen anlegen.
        </p>
        <Link
          href="/plan"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90"
        >
          Zum Terminplan
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </main>
  );
}
