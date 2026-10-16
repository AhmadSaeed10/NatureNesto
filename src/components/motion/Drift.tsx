"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useRichMotion } from "@/lib/hooks";
import { distance } from "@/lib/motion";

interface DriftProps {
  /** Px of travel across the element's pass through the viewport. Capped at 40. */
  amount?: number;
  className?: string;
  children: ReactNode;
}

/** Scroll linked vertical drift for illustrations. Still on touch and reduced motion. */
export function Drift({ amount = distance.parallaxMax, className, children }: DriftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();
  const max = Math.min(amount, distance.parallaxMax);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [max, -max]);

  return (
    <motion.div ref={ref} className={className} style={{ y: rich ? y : 0 }}>
      {children}
    </motion.div>
  );
}
