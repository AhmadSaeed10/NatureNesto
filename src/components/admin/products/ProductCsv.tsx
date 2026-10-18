"use client";

import { useActionState } from "react";
import { type ImportState, importProducts } from "@/app/actions/admin-products-import";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";

const copy = admin.products.csv;
const INITIAL: ImportState = { status: "idle" };

function messages(state: ImportState): string[] {
  switch (state.status) {
    case "idle":
      return [];
    case "file":
      return [copy.errors.file];
    case "header":
      return [copy.errors.header];
    case "forbidden":
      return [admin.form.forbidden];
    case "done":
      return [
        copy.done(state.created ?? 0, state.updated ?? 0),
        ...(state.badLines?.length ? [copy.errors.rows(state.badLines.join(", "))] : []),
        ...(state.failed ?? []).map((handle) => copy.errors.save(handle)),
      ];
  }
}

export function ProductCsv() {
  const [state, action, pending] = useActionState(importProducts, INITIAL);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <a
          href="/admin/products/export"
          download
          className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm text-ink"
        >
          {copy.export}
        </a>
      </div>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="product-csv" className="text-sm font-medium">
            {copy.file}
          </label>
          <input
            id="product-csv"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="block w-full rounded-2xl border border-ink-muted bg-background px-4 py-3 text-sm file:mr-4 file:min-h-(--size-tap) file:rounded-pill file:border-0 file:bg-surface file:px-4 file:text-ink"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? copy.importing : copy.import}
        </Button>
      </form>
      <div role="status" aria-live="polite" className="flex flex-col gap-1 text-sm">
        {messages(state).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
