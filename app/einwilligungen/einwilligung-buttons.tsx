"use client";

import { useActionState } from "react";
import { BellRing, BellOff, CircleCheck, TriangleAlert } from "lucide-react";
import { einwilligungAction, type FormState } from "./actions";

const initial: FormState = {};

export function EinwilligungButtons({
  patientId,
  kanal,
  aktiv,
}: {
  patientId: number;
  kanal: "SMS" | "EMAIL";
  aktiv: boolean;
}) {
  const [state, formAction, pending] = useActionState(einwilligungAction, initial);

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="kanal" value={kanal} />
        <input type="hidden" name="aktion" value={aktiv ? "widerrufen" : "erteilen"} />
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
            aktiv
              ? "border border-line bg-surface text-ink hover:bg-sand"
              : "bg-accent text-white hover:bg-accent-strong"
          }`}
        >
          {aktiv ? (
            <BellOff className="size-4" aria-hidden />
          ) : (
            <BellRing className="size-4" aria-hidden />
          )}
          {pending ? "Speichert…" : aktiv ? "Widerrufen" : "Einwilligung erteilen"}
        </button>
      </form>
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
          {state.ok}
        </p>
      ) : null}
    </div>
  );
}
