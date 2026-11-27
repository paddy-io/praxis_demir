"use client";

import { useActionState } from "react";
import { CircleCheck, ClipboardPlus, TriangleAlert } from "lucide-react";
import { erfassenAction, type FormState } from "./actions";

type Terminart = { id: number; bezeichnung: string };
type Slot = { id: number; label: string };
type Mfa = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function ErfassenForm({
  terminarten,
  slots,
  mfas,
}: {
  terminarten: Terminart[];
  slots: Slot[];
  mfas: Mfa[];
}) {
  const [state, formAction, pending] = useActionState(erfassenAction, initial);

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
        <label className={label} htmlFor="kanal">
          Kanal
        </label>
        <select id="kanal" name="kanal" className={feld}>
          <option value="TELEFON">Telefon</option>
          <option value="TRESEN">Tresen</option>
        </select>
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
        <label className={label} htmlFor="slotId">
          Slot
        </label>
        <select id="slotId" name="slotId" className={feld} required>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="dringlichkeit">
          Dringlichkeit (optional)
        </label>
        <input
          id="dringlichkeit"
          name="dringlichkeit"
          className={feld}
          placeholder="z. B. zeitnah"
          autoComplete="off"
        />
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
          disabled={pending || slots.length === 0}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <ClipboardPlus className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Termin erfassen"}
        </button>
      </div>
    </form>
  );
}
