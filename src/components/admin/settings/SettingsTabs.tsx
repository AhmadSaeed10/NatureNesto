"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin } from "@/content/admin";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "store", href: "/admin/settings" },
  { key: "staff", href: "/admin/settings/staff" },
  { key: "account", href: "/admin/settings/account" },
] as const;

export function SettingsTabs({ allowed }: { allowed: readonly ("store" | "staff" | "account")[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={admin.settings.title}>
      <ul className="flex flex-wrap gap-2">
        {TABS.filter((tab) => allowed.includes(tab.key)).map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-(--size-tap) items-center rounded-pill border px-5 text-sm",
                  active
                    ? "border-primary-dark bg-primary-dark text-background"
                    : "border-line bg-background text-ink",
                )}
              >
                {admin.settings.tabs[tab.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
