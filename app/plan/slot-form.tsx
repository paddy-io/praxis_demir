"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import { slotAnlegenAction, type FormState } from "./actions";

type Aerztin = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";
const label = "text-xs font-medium tracking-wide text-ink-muted uppercase";

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
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="sm:col-span-2 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          Slot angelegt.
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <CalendarPlus className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Slot anlegen"}
        </button>
      </div>
    </form>
  );
}
