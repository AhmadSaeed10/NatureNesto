"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useRichMotion } from "@/lib/hooks";
import { duration, ease, springs } from "@/lib/motion";

/** Any element with this attribute shows the follower while hovered. */
export const CURSOR_ATTRIBUTE = "data-cursor";
const SELECTOR = `[${CURSOR_ATTRIBUTE}="view"]`;

interface CursorFollowerProps {
  label: string;
}

// Decorative only: targets remain normal links with their own focus styles, so keyboard
// and touch users lose nothing when this is not rendered.
export function CursorFollower({ label }: CursorFollowerProps) {
  const rich = useRichMotion();
  const [active, setActive] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springs.cursor);
  const y = useSpring(rawY, springs.cursor);

  useEffect(() => {
    if (!rich) return;
    const onMove = (event: globalThis.PointerEvent) => {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
      const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
      setActive(target !== null);
    };
    const onLeave = () => setActive(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [rich, rawX, rawY]);

  if (!rich) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 -mt-10 -ml-10 flex size-20 items-center justify-center rounded-pill bg-ink eyebrow text-background"
      style={{ x, y }}
      initial={false}
      animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ duration: duration.micro, ease }}
    >
      {label}
    </motion.div>
  );
}
