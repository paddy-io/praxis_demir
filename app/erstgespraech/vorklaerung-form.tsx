"use client";

import { useActionState, useState } from "react";
import { CircleCheck, Phone, TriangleAlert } from "lucide-react";
import { erstgespraechAction, type FormState } from "./actions";

type Mfa = { id: number; name: string };
type Aerztin = { id: number; name: string };
type Slot = { id: number; aerztinId: number; label: string };

const initial: FormState = {};

const feld =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink-muted uppercase";

export function VorklaerungForm({
  mfas,
  aerztinnen,
  slots,
}: {
  mfas: Mfa[];
  aerztinnen: Aerztin[];
  slots: Slot[];
}) {
  const [state, formAction, pending] = useActionState(erstgespraechAction, initial);
  const [modus, setModus] = useState<"bestand" | "neu">("bestand");
  const [aerztinId, setAerztinId] = useState<number>(aerztinnen[0]?.id ?? 0);
  const passendeSlots = slots.filter((s) => s.aerztinId === aerztinId);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="modus" value={modus} />

      <div className="sm:col-span-2 flex gap-2">
        {(["bestand", "neu"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModus(m)}
            className={`rounded-pill px-4 py-2 text-sm font-medium transition ${
              modus === m
                ? "bg-accent text-white"
                : "border border-line bg-surface text-ink hover:bg-sand"
            }`}
          >
            {m === "bestand" ? "Bestandspatient:in" : "Neue Patient:in"}
          </button>
        ))}
      </div>

      {modus === "bestand" ? (
        <div className="sm:col-span-2">
          <label className={label} htmlFor="nummer">
            Patient:innennummer
          </label>
          <input
            id="nummer"
            name="nummer"
            className={`${feld} tabular`}
            placeholder="A123456789 oder P-1000"
            autoComplete="off"
          />
        </div>
      ) : (
        <>
          <div>
            <label className={label} htmlFor="name">
              Name
            </label>
            <input id="name" name="name" className={feld} autoComplete="off" />
          </div>
          <div>
            <label className={label} htmlFor="versicherungsart">
              Versicherungsart
            </label>
            <select id="versicherungsart" name="versicherungsart" className={feld}>
              <option value="GESETZLICH">Gesetzlich versichert</option>
              <option value="PRIVAT">Privatpatient:in</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="neueNummer">
              Neue Nummer
            </label>
            <input
              id="neueNummer"
              name="neueNummer"
              className={`${feld} tabular`}
              placeholder="Versichertennummer oder Patientennummer"
              autoComplete="off"
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label className={label} htmlFor="situation">
          Grobe Situation
        </label>
        <input
          id="situation"
          name="situation"
          className={feld}
          placeholder="z. B. anhaltende Beschwerden, Abklärung nötig"
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label className={label} htmlFor="dringlichkeit">
          Dringlichkeit
        </label>
        <select id="dringlichkeit" name="dringlichkeit" className={feld} required>
          <option value="normal">Normal</option>
          <option value="zeitnah">Zeitnah</option>
          <option value="dringend">Dringend</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="mfaId">
          Vorklärung durch (MFA)
        </label>
        <select id="mfaId" name="mfaId" className={feld} required>
          {mfas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="aerztinId">
          Passende Ärztin
        </label>
        <select
          id="aerztinId"
          name="aerztinId"
          className={feld}
          value={aerztinId}
          onChange={(e) => setAerztinId(Number(e.target.value))}
          required
        >
          {aerztinnen.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="slotId">
          Freier Slot
        </label>
        <select id="slotId" name="slotId" className={feld} required>
          {passendeSlots.length === 0 ? (
            <option value="">Keine freien Slots</option>
          ) : (
            passendeSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))
          )}
        </select>
      </div>

      <label className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
        <input type="checkbox" name="aufnahmeMoeglich" className="accent-accent" />
        <span className="text-sm">
          Aufnahme möglich (Voraussetzung für einen Termin)
        </span>
      </label>

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
          <Phone className="size-4" aria-hidden />
          {pending ? "Speichert…" : "Erstgespräch vergeben"}
        </button>
      </div>
    </form>
  );
}
