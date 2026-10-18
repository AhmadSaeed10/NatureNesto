"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { type BulkAction, bulkUpdateProducts } from "@/app/actions/admin-products";
import { admin } from "@/content/admin";
import type { ProductRow, ProductStatus } from "@/lib/admin/products";
import { cn } from "@/lib/utils";

const copy = admin.products;
const STATUSES: ProductStatus[] = ["active", "draft", "archived"];
const SELECT =
  "min-h-(--size-tap) rounded-pill border border-ink-muted bg-background px-4 text-sm text-ink";
const CHECKBOX = "size-5 accent-primary-dark";

export function ProductTable({ rows, showDeleted }: { rows: ProductRow[]; showDeleted: boolean }) {
  const router = useRouter();
  const actionId = useId();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<BulkAction | "">("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  function run(ids: string[], next: BulkAction) {
    startTransition(async () => {
      const result = await bulkUpdateProducts(ids, next);
      setMessage(result.ok ? copy.bulk.done(result.count) : admin.form.failed);
      if (result.ok) {
        setSelected(new Set());
        setAction("");
        router.refresh();
      }
    });
  }

  function applyBulk() {
    if (selected.size === 0) return setMessage(copy.bulk.none);
    if (!action) return;
    if (action === "delete" && !window.confirm(copy.bulk.confirmDelete)) return;
    run([...selected], action);
  }

  const bulkActions: BulkAction[] = showDeleted
    ? ["restore"]
    : ["active", "draft", "archived", "delete"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={actionId} className="text-sm">
          {copy.bulk.label}
        </label>
        <select
          id={actionId}
          value={action}
          onChange={(event) => setAction(event.target.value as BulkAction | "")}
          className={SELECT}
        >
          <option value="">{copy.bulk.choose}</option>
          {bulkActions.map((key) => (
            <option key={key} value={key}>
              {copy.bulk[key]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={applyBulk}
          disabled={pending || !action}
          className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm disabled:opacity-50"
        >
          {copy.bulk.apply}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-background">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-ink-muted">
            <tr>
              <th scope="col" className="w-12 p-3">
                <input
                  type="checkbox"
                  aria-label={copy.selectAll}
                  className={CHECKBOX}
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)))
                  }
                />
              </th>
              <th scope="col" className="p-3 font-medium">
                {copy.columns.product}
              </th>
              <th scope="col" className="p-3 font-medium">
                {copy.columns.status}
              </th>
              <th scope="col" className="p-3 font-medium">
                {copy.columns.inventory}
              </th>
              <th scope="col" className="p-3 font-medium">
                {copy.columns.type}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-line last:border-b-0",
                  selected.has(row.id) && "bg-surface",
                )}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={copy.selectRow(row.title)}
                    className={CHECKBOX}
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-surface">
                      {row.thumbnail ? (
                        <Image
                          src={row.thumbnail}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={`/admin/products/${row.id}`}
                        className="font-medium text-ink underline-offset-4 hover:underline"
                      >
                        {row.title}
                      </Link>
                      <span className="truncate text-ink-muted">{row.handle}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {row.deleted ? (
                    admin.status.deleted
                  ) : (
                    <select
                      aria-label={copy.rowStatus(row.title)}
                      value={row.status}
                      disabled={pending}
                      onChange={(event) => run([row.id], event.target.value as ProductStatus)}
                      className={SELECT}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {admin.status[status]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-3 text-ink-muted">
                  {row.tracked ? copy.inventory(row.stock, row.variantCount) : copy.notTracked}
                </td>
                <td className="p-3 text-ink-muted">{row.productType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
