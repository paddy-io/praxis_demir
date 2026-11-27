"use client";

import { useActionState } from "react";
import { CalendarPlus, CircleCheck, TriangleAlert } from "lucide-react";
import { slotAnlegenAction, type FormState } from "./actions";

type Aerztin = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function SlotForm({ aerztinnen }: { aerztinnen: Aerztin[] }) {
  const [state, formAction, pending] = useActionState(slotAnlegenAction, initial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label} htmlFor="aerztinId">
          Ärztin
        </label>
        <select id="aerztinId" name="aerztinId" className={feld} required>
          {aerztinnen.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="datum">
          Datum
        </label>
        <input id="datum" name="datum" type="date" className={feld} required />
      </div>

      <div>
        <label className={label} htmlFor="beginn">
          Uhrzeit
        </label>
        <input
          id="beginn"
          name="beginn"
          type="time"
          className={`${feld} tabular`}
          required
        />
      </div>

      <div>
        <label className={label} htmlFor="halbtag">
          Halbtag
        </label>
        <select id="halbtag" name="halbtag" className={feld}>
          <option value="VORMITTAG">Vormittag</option>
          <option value="NACHMITTAG">Nachmittag</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="art">
          Art
        </label>
        <select id="art" name="art" className={feld}>
          <option value="NORMAL">Normal</option>
          <option value="AKUT">Akut</option>
        </select>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 sm:col-span-2"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-center gap-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-accent sm:col-span-2">
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          Slot angelegt.
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <CalendarPlus className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Slot anlegen"}
        </button>
      </div>
    </form>
  );
}
