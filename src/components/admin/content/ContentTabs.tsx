"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin } from "@/content/admin";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home", href: "/admin/content" },
  { key: "pages", href: "/admin/content/pages" },
  { key: "blog", href: "/admin/content/blog" },
  { key: "workshops", href: "/admin/content/workshops" },
  { key: "faq", href: "/admin/content/faq" },
  { key: "navigation", href: "/admin/content/navigation" },
  { key: "redirects", href: "/admin/content/redirects" },
] as const;

export function ContentTabs({ showRedirects }: { showRedirects: boolean }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin/content"
      ? pathname === href || pathname.startsWith("/admin/content/home")
      : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <nav aria-label={admin.content.title}>
      <ul className="flex flex-wrap gap-2">
        {TABS.filter((tab) => showRedirects || tab.key !== "redirects").map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.href}
              aria-current={active(tab.href) ? "page" : undefined}
              className={cn(
                "inline-flex min-h-(--size-tap) items-center rounded-pill border px-5 text-sm",
                active(tab.href)
                  ? "border-primary-dark bg-primary-dark text-background"
                  : "border-line bg-background text-ink",
              )}
            >
              {admin.content.tabs[tab.key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
