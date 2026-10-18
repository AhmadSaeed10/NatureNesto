import Link from "next/link";
import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { AdminPager, pageParam, param, withParams } from "@/components/admin/AdminPager";
import { AdjustForm } from "@/components/admin/inventory/AdjustForm";
import { admin } from "@/content/admin";
import { type StockFilter, listInventory, recentAdjustments } from "@/lib/admin/inventory";
import { cleanSearch } from "@/lib/admin/media";
import { ACCESS, requireStaff } from "@/lib/auth/staff";
import { cn } from "@/lib/utils";

const copy = admin.inventory;
const FILTERS: StockFilter[] = ["all", "low", "out"];
const isFilter = (value: string): value is StockFilter => (FILTERS as string[]).includes(value);
const DATE = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  await requireStaff(ACCESS.catalog);
  const params = await searchParams;
  const query = cleanSearch(param(params.q));
  const filterParam = param(params.filter);
  const filter: StockFilter = isFilter(filterParam) ? filterParam : "all";
  const page = pageParam(params.page);
  const [inventory, history] = await Promise.all([
    listInventory({ query, filter, page }),
    recentAdjustments(),
  ]);
  const href = (next: Partial<{ filter: StockFilter; page: number }>) =>
    withParams("/admin/inventory", {
      q: query,
      filter: (next.filter ?? filter) === "all" ? "" : (next.filter ?? filter),
      page: next.page ?? 1,
    });

  return (
    <AdminPage title={copy.title} intro={copy.intro}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <nav aria-label={copy.title}>
          <ul className="flex flex-wrap gap-2">
            {FILTERS.map((key) => (
              <li key={key}>
                <Link
                  href={href({ filter: key })}
                  aria-current={filter === key ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-(--size-tap) items-center rounded-pill border px-5 text-sm",
                    filter === key
                      ? "border-primary-dark bg-primary-dark text-background"
                      : "border-line bg-background",
                  )}
                >
                  {copy.filters[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form role="search" className="flex min-w-0 flex-1 gap-2 md:max-w-sm">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <label htmlFor="inventory-q" className="sr-only">
            {copy.search}
          </label>
          <input
            id="inventory-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={copy.search}
            className="min-h-(--size-tap) min-w-0 flex-1 rounded-pill border border-ink-muted bg-background px-4 text-sm"
          />
          <button
            type="submit"
            className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm"
          >
            {admin.shell.searchSubmit}
          </button>
        </form>
      </div>

      {inventory.rows.length === 0 ? (
        <p className="text-ink-muted">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-background">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-line text-ink-muted">
              <tr>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.product}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.sku}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.stock}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.adjust}
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.rows.map((row) => {
                const label = `${row.productTitle} · ${row.variantTitle}`;
                return (
                  <tr
                    key={row.variantId}
                    className="border-b border-line align-top last:border-b-0"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {row.productTitle}
                      </Link>
                      <span className="block text-ink-muted">{row.variantTitle}</span>
                    </td>
                    <td className="p-3 text-ink-muted">{row.sku}</td>
                    <td className="p-3">
                      <span className="font-medium">{row.stock}</span>
                      {row.level !== "ok" ? (
                        <span className="ml-2 rounded-pill border border-ink px-2 text-xs">
                          {row.level === "out" ? copy.out : copy.low}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <AdjustForm variantId={row.variantId} label={label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager
        page={inventory.page}
        pageCount={inventory.pageCount}
        href={(n) => href({ page: n })}
      />

      <AdminCard title={copy.history.title}>
        {history.length === 0 ? (
          <p className="text-sm text-ink-muted">{copy.history.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line text-sm">
            {history.map((line) => (
              <li key={line.id} className="flex flex-wrap justify-between gap-x-4 py-2">
                <span className="font-medium">{line.label}</span>
                <span className="text-ink-muted">
                  {copy.history.line(line.delta, line.after)} · {copy.reasons[line.reason]}
                  {line.note ? ` · ${line.note}` : ""} ·{" "}
                  <time dateTime={line.at}>{DATE.format(new Date(line.at))}</time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminPage>
  );
}
