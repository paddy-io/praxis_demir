"use client";

import { useActionState, useState } from "react";
import { CalendarCheck, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { buchenAction, type BuchFormState } from "./actions";

type Terminart = { id: number; bezeichnung: string; dauerMinuten: number };
type Slot = {
  id: number;
  datum: string; // "YYYY-MM-DD"
  beginn: string;
  aerztin: string;
  terminartIds: number[];
};

const initial: BuchFormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";
const karte = "rounded-card border border-line bg-surface p-6 shadow-sm sm:p-7";

function Schritt({
  nummer,
  icon: Icon,
  titel,
  children,
}: {
  nummer: string;
  icon: typeof ShieldCheck;
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={karte}>
      <legend className="sr-only">{titel}</legend>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Schritt {nummer}
          </span>
          <h2 className="font-display text-lg font-semibold leading-tight">{titel}</h2>
        </div>
      </div>
      {children}
    </fieldset>
  );
}

function formatTag(iso: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export function BookingForm({
  terminarten,
  slots,
}: {
  terminarten: Terminart[];
  slots: Slot[];
}) {
  const [state, formAction, pending] = useActionState(buchenAction, initial);
  const [versicherungsart, setVersicherungsart] = useState<"GESETZLICH" | "PRIVAT">(
    "GESETZLICH",
  );
  const [terminartId, setTerminartId] = useState<number>(terminarten[0]?.id ?? 0);
  const passendeSlots = slots.filter((slot) =>
    slot.terminartIds.includes(terminartId),
  );

  if (state.erfolg) {
    return (
      <div className={`${karte} flex flex-col items-start gap-4`}>
        <span className="inline-flex items-center gap-2 rounded-pill bg-accent-soft px-3.5 py-1.5 text-sm font-medium text-accent">
          <CalendarCheck className="size-4" aria-hidden />
          Termin gebucht
        </span>
        <div>
          <p className="font-display text-2xl font-semibold">
            {formatTag(state.erfolg.datum)}, {state.erfolg.beginn} Uhr
          </p>
          <p className="mt-1 text-ink-muted">bei {state.erfolg.aerztin}</p>
        </div>
        <p className="text-sm text-ink-muted">
          Bitte bringen Sie Ihre Versichertenkarte zum Termin mit.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <Schritt nummer="1" icon={ShieldCheck} titel="Identifikation">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="versicherungsart">
              Versicherungsart
            </label>
            <select
              id="versicherungsart"
              name="versicherungsart"
              className={feld}
              value={versicherungsart}
              onChange={(e) =>
                setVersicherungsart(e.target.value as "GESETZLICH" | "PRIVAT")
              }
            >
              <option value="GESETZLICH">Gesetzlich versichert</option>
              <option value="PRIVAT">Privatpatient:in</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="nummer">
              {versicherungsart === "GESETZLICH"
                ? "Versichertennummer"
                : "Patientennummer"}
              <span className="ml-1 text-accent" aria-hidden>
                *
              </span>
            </label>
            <input
              id="nummer"
              name="nummer"
              className={`${feld} tabular`}
              required
              autoComplete="off"
            />
          </div>
        </div>
      </Schritt>

      <Schritt nummer="2" icon={Search} titel="Terminart wählen">
        <div className="grid gap-3 sm:grid-cols-2">
          {terminarten.map((art) => (
            <label
              key={art.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3.5 transition ${
                terminartId === art.id
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:bg-sand"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="terminartId"
                  value={art.id}
                  checked={terminartId === art.id}
                  onChange={() => setTerminartId(art.id)}
                  className="accent-accent"
                />
                <span className="font-medium">{art.bezeichnung}</span>
              </span>
              <span className="text-sm text-ink-muted tabular">
                {art.dauerMinuten} Min.
              </span>
            </label>
          ))}
        </div>
      </Schritt>

      <Schritt nummer="3" icon={CalendarCheck} titel="Termin wählen">
        {passendeSlots.length === 0 ? (
          <p className="rounded-lg bg-sand px-4 py-8 text-center text-sm text-ink-muted">
            Für diese Terminart gibt es gerade keine freien Termine. Bitte
            telefonisch melden.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {passendeSlots.map((slot) => (
              <label
                key={slot.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-4 py-3.5 transition hover:bg-sand has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="slotId" value={slot.id} required />
                  <span>
                    <span className="block font-medium tabular">
                      {formatTag(slot.datum)}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {slot.aerztin}
                    </span>
                  </span>
                </span>
                <span className="font-medium tabular">{slot.beginn}</span>
              </label>
            ))}
          </div>
        )}
      </Schritt>

      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || passendeSlots.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50 sm:w-auto"
      >
        <CalendarCheck className="size-4" aria-hidden />
        {pending ? "Bucht…" : "Termin verbindlich buchen"}
      </button>
    </form>
  );
}
