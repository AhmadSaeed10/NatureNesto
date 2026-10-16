"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { revealTransition } from "@/lib/motion";

// reducedMotion="user" makes Motion skip transform animations while keeping opacity,
// which is the CLAUDE.md fallback. Primitives also pick explicit reduced variants.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={revealTransition}>
      {children}
    </MotionConfig>
  );
}
