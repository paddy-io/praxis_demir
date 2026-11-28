"use client";

import { useActionState } from "react";
import { CircleCheck, ClipboardList, TriangleAlert } from "lucide-react";
import { fragebogenAction, type BuchFormState } from "./actions";

const initial: BuchFormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function Fragebogen({
  terminId,
  fragen,
}: {
  terminId: number;
  fragen: { feld: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(fragebogenAction, initial);

  if (fragen.length === 0) return null;

  if (state.fragebogenGespeichert) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-accent">
        <CircleCheck className="size-4 shrink-0" aria-hidden />
        Danke! Ihre Angaben sind beim Termin hinterlegt.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full rounded-lg border border-line bg-sand p-5"
    >
      <input type="hidden" name="terminId" value={terminId} />
      <h3 className="flex items-center gap-2 font-display text-base font-semibold">
        <ClipboardList className="size-4 text-accent" aria-hidden />
        Kurz vorab ausfüllen (freiwillig)
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        Ihre Angaben helfen der Praxis, den Termin vorzubereiten. Sie können diesen
        Schritt auch überspringen.
      </p>
      <div className="mt-4 grid gap-3">
        {fragen.map((frage) => (
          <div key={frage.feld}>
            <label className={label} htmlFor={`frage_${frage.feld}`}>
              {frage.label}
            </label>
            <input
              id={`frage_${frage.feld}`}
              name={`frage_${frage.feld}`}
              className={feld}
              autoComplete="off"
            />
          </div>
        ))}
      </div>
      {state.error ? (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
      >
        <ClipboardList className="size-4" aria-hidden />
        {pending ? "Speichert…" : "Angaben speichern"}
      </button>
    </form>
  );
}
