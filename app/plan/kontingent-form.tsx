"use client";

import { useActionState } from "react";
import { CircleCheck, Gauge, TriangleAlert } from "lucide-react";
import { kontingentAction, type FormState } from "./actions";

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function KontingentForm({ aktuell }: { aktuell: number }) {
  const [state, formAction, pending] = useActionState(kontingentAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="sm:w-56">
        <label className={label} htmlFor="akutKontingent">
          Akutslots je Halbtag
        </label>
        <input
          id="akutKontingent"
          name="akutKontingent"
          type="number"
          min={0}
          defaultValue={aktuell}
          className={`${feld} tabular`}
          required
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
      >
        <Gauge className="size-4" aria-hidden />
        {pending ? "Speichert…" : "Kontingent speichern"}
      </button>

      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-red-700"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-center gap-2 text-sm text-accent">
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          Kontingent gespeichert.
        </p>
      ) : null}
    </form>
  );
}
