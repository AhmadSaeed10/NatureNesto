"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Cta, NavLink as NavLinkData, SocialLink } from "@/content/types";
import { ui } from "@/content/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";
import { SocialLinks } from "@/components/ui/SocialLinks";

interface MobileMenuProps {
  links: readonly NavLinkData[];
  cta: Cta;
  socials: readonly SocialLink[];
}

// Native <dialog> with showModal() provides the focus trap, Escape handling, inert
// background and focus return to the trigger.
export function MobileMenu({ links, cta, socials }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const hide = () => dialogRef.current?.close();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={ui.menuOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex size-(--size-tap) items-center justify-center rounded-pill border border-ink/30 text-ink transition-colors duration-(--duration-micro) ease-brand hover:border-ink lg:hidden"
      >
        <Icon name="menu" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={ui.menuTitle}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) hide();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none translate-y-3 bg-background p-0 text-ink opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-(--duration-reveal) ease-brand backdrop:bg-ink/40 open:translate-y-0 open:opacity-100 starting:open:translate-y-3 starting:open:opacity-0 lg:hidden"
      >
        <div className="grain mx-auto flex min-h-full max-w-7xl flex-col px-4 pb-8 md:px-8">
          <div className="flex h-18 items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={hide}
              aria-label={ui.menuClose}
              className="inline-flex size-(--size-tap) items-center justify-center rounded-pill border border-ink/30 transition-colors duration-(--duration-micro) ease-brand hover:border-ink"
            >
              <Icon name="close" />
            </button>
          </div>

          <nav aria-label={ui.primaryNav} className="mt-10">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} onNavigate={hide} className="font-serif text-h3">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-6 pt-10">
            <Button href={cta.href} withArrow className="w-full" onClick={hide}>
              {cta.label}
            </Button>
            <SocialLinks links={socials} className="-ml-3" />
          </div>
        </div>
      </dialog>
    </>
  );
}
