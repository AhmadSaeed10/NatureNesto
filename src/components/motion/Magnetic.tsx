"use client";

import { motion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useRichMotion } from "@/lib/hooks";
import { distance, springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MagneticProps {
  /** Max pull in px. CLAUDE.md caps this at 8. */
  strength?: number;
  className?: string;
  children: ReactNode;
}

const clamp = (v: number): number => Math.max(-1, Math.min(1, v));

/** Pulls its child toward the pointer. Desktop only; inert on touch and reduced motion. */
export function Magnetic({ strength = distance.magneticMax, className, children }: MagneticProps) {
  const rich = useRichMotion();
  const x = useSpring(0, springs.magnetic);
  const y = useSpring(0, springs.magnetic);

  if (!rich) return <span className={cn("inline-flex", className)}>{children}</span>;

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * strength);
    y.set(clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
