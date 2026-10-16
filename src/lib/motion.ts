import type { Transition, Variants } from "motion/react";
import { TOKENS } from "./tokens";

const M = TOKENS.motion;
const seconds = (ms: string): number => Number.parseFloat(ms) / 1000;

export const ease = M.easeCurve as unknown as [number, number, number, number];

export const duration = {
  micro: seconds(M.durationMicro),
  reveal: seconds(M.durationReveal),
  reducedFade: M.reducedFade,
} as const;

export const stagger = {
  headline: M.headlineStagger,
  item: M.itemStagger,
} as const;

export const distance = {
  revealOffset: M.revealOffset,
  parallaxMax: M.parallaxMax,
  magneticMax: M.magneticMax,
} as const;

export const imageScaleFrom = M.imageScaleFrom;

export const revealTransition: Transition = { duration: duration.reveal, ease };

/** In view once, triggered when 15 percent of the element is visible. */
export const viewportOnce = { once: true, amount: M.viewportAmount } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.revealOffset },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.reducedFade, ease } },
};

export const lineMask: Variants = {
  hidden: { y: "110%" },
  visible: (line: number) => ({
    y: "0%",
    transition: { ...revealTransition, delay: line * stagger.headline },
  }),
};

export const clipReveal: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: imageScaleFrom },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: duration.reveal * 1.2, ease },
  },
};

export const staggerContainer = (each: number = stagger.item): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: each } },
});

// Spring feel for pointer driven effects: quick to follow, settles without wobble.
export const springs = {
  magnetic: { stiffness: 220, damping: 18, mass: 0.4 },
  cursor: { stiffness: 500, damping: 40, mass: 0.5 },
} as const;
