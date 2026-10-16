"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fade, fadeUp, stagger, staggerContainer, viewportOnce } from "@/lib/motion";
import { MOTION_TAGS, type MotionTag } from "./tags";

interface StaggerProps {
  as?: MotionTag;
  /** Seconds between children. CLAUDE.md range is 0.06 to 0.1. */
  each?: number;
  className?: string;
  children: ReactNode;
}

export function Stagger({ as = "div", each = stagger.item, className, children }: StaggerProps) {
  const Tag = MOTION_TAGS[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(each)}
    >
      {children}
    </Tag>
  );
}

interface StaggerItemProps {
  as?: MotionTag;
  className?: string;
  children: ReactNode;
}

/** Child of Stagger. Inherits the hidden/visible state from the container. */
export function StaggerItem({ as = "div", className, children }: StaggerItemProps) {
  const reduced = useReducedMotion();
  const Tag = MOTION_TAGS[as];
  return (
    <Tag className={className} variants={reduced ? fade : fadeUp}>
      {children}
    </Tag>
  );
}
