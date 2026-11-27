"use client";

import { useActionState } from "react";
import { CircleCheck, MailCheck, TriangleAlert } from "lucide-react";
import { erinnerungAction, type FormState } from "./actions";

const initial: FormState = {};

export function ErinnerungButton({ erinnerungId }: { erinnerungId: number }) {
  const [state, formAction, pending] = useActionState(erinnerungAction, initial);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="erinnerungId" value={erinnerungId} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-sand disabled:opacity-50"
        >
          <MailCheck className="size-3.5" aria-hidden />
          {pending ? "…" : "Erledigt"}
        </button>
      </form>
      {state.error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-700">
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
