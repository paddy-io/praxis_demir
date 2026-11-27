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
        <h2 className="font-display text-xl font-semibold">Nächste Schritte</h2>
        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
          <li>F-001 Terminplan und Slots pflegen</li>
          <li>Datenmodell als Prisma-Migration anlegen</li>
          <li>Designrichtung in docs/decisions.md festschreiben</li>
        </ul>
      </div>
    </main>
  );
}
