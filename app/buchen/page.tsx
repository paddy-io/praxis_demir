import { Phone } from "lucide-react";
import { getFreieOnlineSlots, getOnlineTerminarten } from "@/lib/data";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function BuchenPage() {
  const [terminarten, slots] = await Promise.all([
    getOnlineTerminarten(),
    getFreieOnlineSlots(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Online-Terminbuchung
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Termin selbst buchen
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Nur für Bestandspatient:innen. Die Buchung ist verbindlich; der Termin ist
          für Sie reserviert, sobald Sie bestätigen.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-sand px-4 py-2 text-sm text-ink-muted">
          <Phone className="size-4 text-accent" aria-hidden />
          Akut, Blutabnahme und Erstgespräch bleiben beim Telefon.
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
