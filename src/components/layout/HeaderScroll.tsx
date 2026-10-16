"use client";

import { useEffect } from "react";

// Ignore tiny scroll jitter (trackpads, momentum) before toggling visibility.
const SCROLL_DELTA = 8;

interface HeaderScrollProps {
  targetId: string;
}

/** Sets data-scrolled and data-hidden on the header. All visual changes live in CSS. */
export function HeaderScroll({ targetId }: HeaderScrollProps) {
  useEffect(() => {
    const header = document.getElementById(targetId);
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.dataset.scrolled = String(y > SCROLL_DELTA);
      const delta = y - lastY;
      if (Math.abs(delta) >= SCROLL_DELTA) {
        header.dataset.hidden = String(delta > 0 && y > header.offsetHeight);
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [targetId]);

  return null;
}
