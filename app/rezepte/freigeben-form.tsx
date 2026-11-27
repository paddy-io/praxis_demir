"use client";

import { useActionState } from "react";
import { BadgeCheck, TriangleAlert } from "lucide-react";
import { freigebenAction, type FormState } from "./actions";

type Aerztin = { id: number; name: string; abwesend: boolean };

const initial: FormState = {};

export function FreigebenForm({
  antragId,
  aerztinnen,
}: {
  antragId: number;
  aerztinnen: Aerztin[];
}) {
  const [state, formAction, pending] = useActionState(freigebenAction, initial);
  const verfuegbar = aerztinnen.filter((a) => !a.abwesend);

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
        <input type="hidden" name="antragId" value={antragId} />
        <select
          name="aerztinId"
          required
          defaultValue={verfuegbar[0]?.id ?? ""}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {aerztinnen.map((a) => (
            <option key={a.id} value={a.id} disabled={a.abwesend}>
              {a.name}
              {a.abwesend ? " (abwesend)" : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || verfuegbar.length === 0}
          className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-1.5 text-xs font-medium text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          <BadgeCheck className="size-3.5" aria-hidden />
          {pending ? "…" : "Freigeben"}
        </button>
      </form>
      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-700"
        >
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
