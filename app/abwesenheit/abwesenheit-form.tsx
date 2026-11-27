"use client";

import { useActionState, useState } from "react";
import { CalendarOff, CircleCheck, TriangleAlert } from "lucide-react";
import { abwesenheitAnlegenAction, type FormState } from "./actions";

type Aerztin = { id: number; name: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function AbwesenheitForm({ aerztinnen }: { aerztinnen: Aerztin[] }) {
  const [state, formAction, pending] = useActionState(
    abwesenheitAnlegenAction,
    initial,
  );
  const [bereich, setBereich] = useState<"AERZTIN" | "PRAXIS">("AERZTIN");

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label} htmlFor="geltungsbereich">
          Geltungsbereich
        </label>
        <select
          id="geltungsbereich"
          name="geltungsbereich"
          className={feld}
          value={bereich}
          onChange={(e) => setBereich(e.target.value as "AERZTIN" | "PRAXIS")}
        >
          <option value="AERZTIN">Einzelne Ärztin</option>
          <option value="PRAXIS">Praxisschließung (alle)</option>
        </select>
      </div>

      {bereich === "AERZTIN" ? (
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
      ) : null}

      <div>
        <label className={label} htmlFor="von">
          Von
        </label>
        <input id="von" name="von" type="date" className={feld} required />
      </div>

      <div>
        <label className={label} htmlFor="bis">
          Bis
        </label>
        <input id="bis" name="bis" type="date" className={feld} />
      </div>

      <div className="sm:col-span-2">
        <label className={label} htmlFor="art">
          Art
        </label>
        <select id="art" name="art" className={feld}>
          <option value="URLAUB">Urlaub</option>
          <option value="BRUECKENTAG">Brückentag</option>
          <option value="FORTBILDUNG">Fortbildung</option>
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
      {state.erfolg ? (
        <p className="flex items-center gap-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-accent sm:col-span-2">
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          Abwesenheit gespeichert. Betroffene Termine markiert:{" "}
          <span className="tabular">{state.erfolg.betroffeneTermine}</span>
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <CalendarOff className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Abwesenheit eintragen"}
        </button>
      </div>
    </form>
  );
}
