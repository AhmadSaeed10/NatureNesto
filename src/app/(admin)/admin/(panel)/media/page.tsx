import Link from "next/link";
import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { MediaCard } from "@/components/admin/media/MediaCard";
import { MediaUploader } from "@/components/admin/media/MediaUploader";
import { admin } from "@/content/admin";
import { cleanSearch, listMedia } from "@/lib/admin/media";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

const copy = admin.media;

const pageHref = (query: string, page: number): string => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/media?${search}` : "/admin/media";
};

const PAGER =
  "inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm text-ink";

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireStaff(ACCESS.media);
  const params = await searchParams;
  const query = cleanSearch(typeof params.q === "string" ? params.q : "");
  const requested = Number(typeof params.page === "string" ? params.page : 1);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const media = await listMedia({ query, page });

  return (
    <AdminPage title={copy.title} intro={copy.intro}>
      <AdminCard title={copy.upload.title}>
        <MediaUploader />
      </AdminCard>

      <section aria-labelledby="media-library" className="flex flex-col gap-5">
        <h2 id="media-library" className="sr-only">
          {copy.title}
        </h2>
        <form role="search" action="/admin/media" className="flex flex-wrap gap-3">
          <label htmlFor="media-search" className="sr-only">
            {copy.search}
          </label>
          <input
            id="media-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={copy.search}
            className="min-h-(--size-tap) min-w-0 flex-1 rounded-pill border border-ink-muted bg-background px-5"
          />
          <button type="submit" className={PAGER}>
            {copy.searchSubmit}
          </button>
        </form>

        {media.items.length === 0 ? (
          <p className="text-ink-muted">{query ? copy.noResults : copy.empty}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {media.items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </ul>
        )}

        {media.pageCount > 1 ? (
          <nav aria-label={copy.pagination.page(page)} className="flex items-center gap-3">
            {page > 1 ? (
              <Link href={pageHref(query, page - 1)} className={PAGER}>
                {copy.pagination.previous}
              </Link>
            ) : null}
            <span className="text-sm text-ink-muted">
              {copy.pagination.page(page)} / {media.pageCount}
            </span>
            {page < media.pageCount ? (
              <Link href={pageHref(query, page + 1)} className={PAGER}>
                {copy.pagination.next}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </AdminPage>
  );
}
