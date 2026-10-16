"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useRichMotion } from "@/lib/hooks";
import { clipReveal, distance, fade, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** Required: next/image fill mode needs the rendered width hint. */
  sizes: string;
  /** Size the frame here, for example an aspect ratio class. */
  className?: string;
  priority?: boolean;
  /** Scroll linked drift, max 40px. Off on touch and under reduced motion. */
  parallax?: boolean;
}

export function ParallaxImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  parallax = true,
}: ParallaxImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rich = useRichMotion();
  const drift = parallax && rich;
  const max = distance.parallaxMax;

  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-max, max]);

  return (
    // The in-view trigger lives on an unclipped wrapper: a fully clipped element never
    // reports as intersecting, so the reveal would never start.
    <motion.div
      ref={frame}
      className={cn("relative overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <motion.div className="absolute inset-0" variants={reduced ? fade : clipReveal}>
        <motion.div
          className="absolute inset-x-0"
          // Overscan by the drift distance so edges never show while moving.
          style={{ top: drift ? -max : 0, bottom: drift ? -max : 0, y: drift ? y : 0 }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
