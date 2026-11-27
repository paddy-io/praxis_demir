"use client";

import { useActionState, useState } from "react";
import {
  CalendarClock,
  CircleCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { aendernAction, absagenAction, type FormState } from "./actions";

type Terminart = { id: number; bezeichnung: string };
type Slot = { id: number; label: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function TerminAktionen({
  terminId,
  terminartId,
  aenderbar,
  terminarten,
  freieSlots,
}: {
  terminId: number;
  terminartId: number;
  aenderbar: boolean;
  terminarten: Terminart[];
  freieSlots: Slot[];
}) {
  const [offen, setOffen] = useState(false);
  const [aenderState, aenderAction, aenderPending] = useActionState(
    aendernAction,
    initial,
  );
  const [abState, abAction, abPending] = useActionState(absagenAction, initial);

  const state = aenderState.error || aenderState.ok ? aenderState : abState;

  if (!aenderbar) {
    return <span className="text-xs text-ink-muted">abgeschlossen</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setOffen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-sand"
        >
          <CalendarClock className="size-3.5" aria-hidden />
          {offen ? "Schließen" : "Umbuchen"}
        </button>
        <form action={abAction}>
          <input type="hidden" name="terminId" value={terminId} />
          <button
            type="submit"
            disabled={abPending}
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="size-3.5" aria-hidden />
            {abPending ? "…" : "Absagen"}
          </button>
        </form>
      </div>

      {offen ? (
        <form
          action={aenderAction}
          className="flex w-full flex-col gap-2 rounded-lg border border-line bg-sand p-3 sm:w-72"
        >
          <input type="hidden" name="terminId" value={terminId} />
          <select name="terminartId" defaultValue={terminartId} className={feld}>
            {terminarten.map((art) => (
              <option key={art.id} value={art.id}>
                {art.bezeichnung}
              </option>
            ))}
          </select>
          <select name="slotId" className={feld} required>
            <option value="">Neuen Slot wählen…</option>
            {freieSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={aenderPending || freieSlots.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
          >
            {aenderPending ? "Bucht um…" : "Umbuchung speichern"}
          </button>
        </form>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-700"
        >
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-center gap-1.5 text-xs text-accent">
          <CircleCheck className="size-3.5 shrink-0" aria-hidden />
          {state.ok}
        </p>
      ) : null}
    </div>
  );
}
