"use client";

import { useActionState } from "react";
import { Lock, LockOpen, TriangleAlert } from "lucide-react";
import { sperreAction, type FormState } from "./actions";

const initial: FormState = {};

export function SperreButton({
  patientId,
  gesperrt,
}: {
  patientId: number;
  gesperrt: boolean;
}) {
  const [state, formAction, pending] = useActionState(sperreAction, initial);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="aktion" value={gesperrt ? "heben" : "setzen"} />
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            gesperrt
              ? "border-line bg-surface text-ink hover:bg-sand"
              : "border-line bg-surface text-red-700 hover:bg-red-50"
          }`}
        >
          {gesperrt ? (
            <LockOpen className="size-3.5" aria-hidden />
          ) : (
            <Lock className="size-3.5" aria-hidden />
          )}
          {pending ? "…" : gesperrt ? "Sperre aufheben" : "Sperre setzen"}
        </button>
      </form>
      {state.error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-700">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
