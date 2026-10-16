"use client";

import { useState } from "react";
import type { SocialLink } from "@/content/types";
import { ui } from "@/content/ui";
import { Icon } from "@/components/ui/Icon";
import { SocialLinks } from "@/components/ui/SocialLinks";

export const ANNOUNCEMENT_STORAGE_KEY = "nn-announcement-dismissed";

interface AnnouncementBarProps {
  message: string;
  socials: readonly SocialLink[];
  /** Element that receives focus after dismissal, so keyboard users are not dropped to body. */
  focusTargetId: string;
}

export function AnnouncementBar({ message, socials, focusTargetId }: AnnouncementBarProps) {
  const [closing, setClosing] = useState(false);

  const dismiss = () => {
    try {
      sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "1");
    } catch {
      // Storage can be blocked; the bar still closes for this page view.
    }
    setClosing(true);
    document.getElementById(focusTargetId)?.focus();
  };

  return (
    <div
      data-announcement-bar
      data-closing={closing || undefined}
      inert={closing}
      className="group/bar grid grid-rows-[1fr] bg-surface text-ink transition-[grid-template-rows] duration-(--duration-micro) ease-brand data-closing:grid-rows-[0fr]"
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 px-4 transition-opacity duration-(--duration-micro) ease-brand group-data-closing/bar:opacity-0 md:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <span aria-hidden="true" className="hidden lg:block" />
          <p className="py-2 text-small lg:text-center">{message}</p>
          <div className="flex items-center justify-end">
            <SocialLinks links={socials} className="hidden lg:flex" iconSize={16} />
            <button
              type="button"
              onClick={dismiss}
              aria-label={ui.announcementDismiss}
              className="inline-flex size-(--size-tap) items-center justify-center rounded-pill transition-transform duration-(--duration-micro) ease-brand hover:rotate-90"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
