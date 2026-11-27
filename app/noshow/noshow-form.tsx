"use client";

import { useActionState } from "react";
import { CircleCheck, TriangleAlert, UserX } from "lucide-react";
import { noShowAction, type FormState } from "./actions";

type Kandidat = { id: number; label: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function NoShowForm({ kandidaten }: { kandidaten: Kandidat[] }) {
  const [state, formAction, pending] = useActionState(noShowAction, initial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label} htmlFor="terminId">
          Termin
        </label>
        <select id="terminId" name="terminId" className={feld} required>
          <option value="">Termin wählen…</option>
          {kandidaten.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={label} htmlFor="triftigerGrund">
          Triftiger Grund (optional)
        </label>
        <input
          id="triftigerGrund"
          name="triftigerGrund"
          className={feld}
          placeholder="z. B. Notfall – dann zählt der Fall nicht"
          autoComplete="off"
        />
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
          {state.ok}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending || kandidaten.length === 0}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <UserX className="size-4" aria-hidden />
          {pending ? "Speichert…" : "No-Show erfassen"}
        </button>
      </div>
    </form>
  );
}
