"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}

export function NavLink({ href, className, onNavigate, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-(--size-tap) items-center text-ink",
        "after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-micro) after:ease-brand after:content-['']",
        "hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-[current=page]:text-primary-dark aria-[current=page]:after:scale-x-100",
        className,
      )}
    >
      {children}
    </Link>
  );
}
