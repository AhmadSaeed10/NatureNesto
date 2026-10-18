import Link from "next/link";
import { admin } from "@/content/admin";

const PAGER =
  "inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-sm text-ink";

interface AdminPagerProps {
  page: number;
  pageCount: number;
  /** Builds the link for a page, keeping the current filters. */
  href: (page: number) => string;
}

export function AdminPager({ page, pageCount, href }: AdminPagerProps) {
  if (pageCount <= 1) return null;
  const copy = admin.media.pagination;
  return (
    <nav aria-label={copy.label} className="flex items-center gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={PAGER}>
          {copy.previous}
        </Link>
      ) : null}
      <span className="text-sm text-ink-muted">
        {copy.page(page)} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={PAGER}>
          {copy.next}
        </Link>
      ) : null}
    </nav>
  );
}

/** Query string helper: drops empty values so links stay clean. */
export function withParams(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1))
      search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/** First string value of a search param. */
export const param = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export const pageParam = (value: string | string[] | undefined): number => {
  const n = Number(param(value) || 1);
  return Number.isInteger(n) && n > 0 ? n : 1;
};
