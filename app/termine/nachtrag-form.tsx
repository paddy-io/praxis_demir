"use client";

import { useActionState } from "react";
import { CircleCheck, ClipboardList, TriangleAlert } from "lucide-react";
import { nachtragAction, type FormState } from "./actions";

type Terminart = { id: number; bezeichnung: string };
type Aerztin = { id: number; name: string };
type Mfa = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function NachtragForm({
  terminarten,
  aerztinnen,
  mfas,
}: {
  terminarten: Terminart[];
  aerztinnen: Aerztin[];
  mfas: Mfa[];
}) {
  const [state, formAction, pending] = useActionState(nachtragAction, initial);

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
        <label className={label} htmlFor="terminartId">
          Terminart
        </label>
        <select id="terminartId" name="terminartId" className={feld} required>
          {terminarten.map((art) => (
            <option key={art.id} value={art.id}>
              {art.bezeichnung}
            </option>
          ))}
        </select>
      </div>

      <div>
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
        <label className={label} htmlFor="abspracheMitId">
          Absprache mit
        </label>
        <select id="abspracheMitId" name="abspracheMitId" className={feld} required>
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
        <label className={label} htmlFor="erfasstVonId">
          Erfasst von
        </label>
        <select id="erfasstVonId" name="erfasstVonId" className={feld}>
          <option value="">—</option>
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
        <input id="notiz" name="notiz" className={feld} autoComplete="off" />
      </div>

      <p className="sm:col-span-2 rounded-lg bg-sand px-3.5 py-2.5 text-xs text-ink-muted">
        Ein Nachtrag belegt keinen Slot. Der Termin wird als „nachtraeglich erfasst“
        gekennzeichnet.
      </p>

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
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <ClipboardList className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Nachtrag erfassen"}
        </button>
      </div>
    </form>
  );
}
