import Link from "next/link";
import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { AdminPager, pageParam, param, withParams } from "@/components/admin/AdminPager";
import { ProductCsv } from "@/components/admin/products/ProductCsv";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { admin } from "@/content/admin";
import { cleanSearch } from "@/lib/admin/media";
import { type StatusFilter, listCollectionOptions, listProducts } from "@/lib/admin/products";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

const copy = admin.products;
const STATUS_FILTERS: StatusFilter[] = ["all", "active", "draft", "archived", "deleted"];
const FIELD =
  "min-h-(--size-tap) rounded-pill border border-ink-muted bg-background px-4 text-sm text-ink";
const isStatusFilter = (value: string): value is StatusFilter =>
  (STATUS_FILTERS as string[]).includes(value);

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireStaff(ACCESS.catalog);
  const params = await searchParams;
  const query = cleanSearch(param(params.q));
  const statusParam = param(params.status);
  const status: StatusFilter = isStatusFilter(statusParam) ? statusParam : "all";
  const collectionId = /^[0-9a-f-]{36}$/.test(param(params.collection))
    ? param(params.collection)
    : "";
  const page = pageParam(params.page);

  const [list, collections] = await Promise.all([
    listProducts({ query, status, collectionId, page }),
    listCollectionOptions(),
  ]);

  return (
    <AdminPage
      title={copy.title}
      actions={
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-(--size-tap) items-center rounded-pill bg-primary-dark px-6 font-medium text-background"
        >
          {copy.add}
        </Link>
      }
    >
      <form
        role="search"
        aria-label={copy.filters.label}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="products-q" className="text-sm">
            {admin.shell.search}
          </label>
          <input
            id="products-q"
            name="q"
            type="search"
            defaultValue={query}
            className={`${FIELD} w-full`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="products-status" className="text-sm">
            {copy.filters.status}
          </label>
          <select id="products-status" name="status" defaultValue={status} className={FIELD}>
            {STATUS_FILTERS.map((key) => (
              <option key={key} value={key}>
                {key === "all" ? copy.filters.all : admin.status[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="products-collection" className="text-sm">
            {copy.filters.collection}
          </label>
          <select
            id="products-collection"
            name="collection"
            defaultValue={collectionId}
            className={FIELD}
          >
            <option value="">{copy.filters.anyCollection}</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm"
        >
          {copy.filters.apply}
        </button>
      </form>

      {list.rows.length === 0 ? (
        <p className="text-ink-muted">{copy.empty}</p>
      ) : (
        <ProductTable rows={list.rows} showDeleted={status === "deleted"} />
      )}
      <AdminPager
        page={list.page}
        pageCount={list.pageCount}
        href={(n) =>
          withParams("/admin/products", {
            q: query,
            status: status === "all" ? "" : status,
            collection: collectionId,
            page: n,
          })
        }
      />

      <AdminCard title={copy.csv.title} description={copy.csv.intro}>
        <ProductCsv />
      </AdminCard>
    </AdminPage>
  );
}
