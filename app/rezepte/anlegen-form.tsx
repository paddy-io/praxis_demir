"use client";

import { useActionState } from "react";
import { CircleCheck, FilePlus2, TriangleAlert } from "lucide-react";
import { anlegenAction, type FormState } from "./actions";

type Mfa = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function AnlegenForm({ mfas }: { mfas: Mfa[] }) {
  const [state, formAction, pending] = useActionState(anlegenAction, initial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor="nummer">
          Patient:innennummer
        </label>
        <input
          id="nummer"
          name="nummer"
          className={`${feld} tabular`}
          placeholder="A123456789 oder P-1000"
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label className={label} htmlFor="angelegtVonId">
          Angelegt von (MFA)
        </label>
        <select id="angelegtVonId" name="angelegtVonId" className={feld} required>
          {mfas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={label} htmlFor="notiz">
          Notiz (optional)
        </label>
        <input
          id="notiz"
          name="notiz"
          className={feld}
          placeholder="z. B. Medikament und Dosierung"
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
          disabled={pending || mfas.length === 0}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <FilePlus2 className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Rezeptantrag anlegen"}
        </button>
      </div>
    </form>
  );
}
