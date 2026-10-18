"use client";

import { useActionState, useId } from "react";
import { type AdjustState, adjustStock } from "@/app/actions/admin-inventory";
import { CONTROL } from "@/components/admin/fields";
import { admin } from "@/content/admin";
import { cn } from "@/lib/utils";

const copy = admin.inventory;
const INITIAL: AdjustState = { status: "idle" };
const REASONS = ["received", "correction", "damaged", "returned", "sold", "other"] as const;

export function AdjustForm({ variantId, label }: { variantId: string; label: string }) {
  const uid = useId();
  const [state, action, pending] = useActionState(adjustStock, INITIAL);
  const message =
    state.status === "done" && state.stock !== undefined
      ? copy.adjust.done(state.stock)
      : state.status === "delta"
        ? copy.adjust.errors.delta
        : state.status === "forbidden"
          ? admin.form.forbidden
          : state.status === "failed"
            ? copy.adjust.errors.failed
            : "";

  return (
    <form action={action} className="flex flex-col gap-1">
      <fieldset className="grid grid-cols-[5rem_minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2">
        <legend className="sr-only">{`${copy.columns.adjust}: ${label}`}</legend>
        <input type="hidden" name="variantId" value={variantId} />
        <label htmlFor={`${uid}-delta`} className="sr-only">
          {copy.adjust.delta}
        </label>
        <input
          id={`${uid}-delta`}
          name="delta"
          inputMode="numeric"
          placeholder="+0"
          aria-describedby={`${uid}-hint`}
          aria-invalid={state.status === "delta" ? true : undefined}
          className={cn(CONTROL, "text-sm")}
        />
        <label htmlFor={`${uid}-reason`} className="sr-only">
          {copy.adjust.reason}
        </label>
        <select
          id={`${uid}-reason`}
          name="reason"
          defaultValue="received"
          className={cn(CONTROL, "text-sm")}
        >
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {copy.reasons[reason]}
            </option>
          ))}
        </select>
        <label htmlFor={`${uid}-note`} className="sr-only">
          {copy.adjust.note}
        </label>
        <input
          id={`${uid}-note`}
          name="note"
          maxLength={300}
          placeholder={copy.adjust.note}
          className={cn(CONTROL, "text-sm")}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-4 text-sm disabled:opacity-50"
        >
          {copy.adjust.submit}
        </button>
      </fieldset>
      <p id={`${uid}-hint`} className="sr-only">
        {copy.adjust.deltaHint}
      </p>
      <p role="status" aria-live="polite" className="text-xs">
        {message}
      </p>
    </form>
  );
}
