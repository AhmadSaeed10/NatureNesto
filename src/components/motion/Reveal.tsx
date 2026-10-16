"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fade, fadeUp, viewportOnce } from "@/lib/motion";
import { MOTION_TAGS, type MotionTag } from "./tags";

interface RevealProps {
  as?: MotionTag;
  /** Seconds. Use sparingly; prefer Stagger for groups. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Fade and rise 24px once, when 15 percent is in view. Opacity only under reduced motion. */
export function Reveal({ as = "div", delay = 0, className, children }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = MOTION_TAGS[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? fade : fadeUp}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}
