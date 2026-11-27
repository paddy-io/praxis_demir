import { getFreieOnlineSlots, getOnlineTerminarten } from "@/lib/data";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function BuchenPage() {
  const [terminarten, slots] = await Promise.all([
    getOnlineTerminarten(),
    getFreieOnlineSlots(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Online-Terminbuchung
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Termin selbst buchen
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Nur für Bestandspatient:innen. Die Buchung ist verbindlich; der Termin
          ist für Sie reserviert, sobald Sie bestätigen.
        </p>
      </header>

      <BookingForm
        terminarten={terminarten.map((art) => ({
          id: art.id,
          bezeichnung: art.bezeichnung,
          dauerMinuten: art.dauerMinuten,
        }))}
        slots={slots.map((slot) => ({
          id: slot.id,
          datum: slot.datum.toISOString().slice(0, 10),
          beginn: slot.beginn,
          aerztin: slot.aerztin.name,
          terminartIds: slot.aerztin.terminarten.map((t) => t.terminartId),
        }))}
      />
    </main>
  );
}
