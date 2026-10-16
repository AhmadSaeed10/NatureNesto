"use client";

import { motion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Step } from "@/content/types";
import { cn } from "@/lib/utils";

interface StepsTrackerProps {
  steps: readonly Step[];
}

// A step becomes active while it crosses the middle band of the viewport.
const ACTIVE_BAND = "-45% 0px -45% 0px";

export function StepsTracker({ steps }: StepsTrackerProps) {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start center", "end center"] });

  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!items) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: ACTIVE_BAND },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={list} className="relative flex flex-col gap-16 lg:gap-40 lg:py-[12vh] lg:pl-12">
      {/* Progress rail: scroll linked, desktop only */}
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 hidden w-px bg-line lg:block"
      >
        <motion.span
          className="absolute inset-0 origin-top bg-primary-dark"
          style={{ scaleY: scrollYProgress }}
        />
      </span>
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li
            key={step.number}
            data-step={index}
            aria-current={isActive ? "step" : undefined}
            className="group/step"
          >
            <p
              aria-hidden="true"
              className={cn(
                "mb-4 font-serif text-display leading-none transition-colors duration-(--duration-reveal) ease-brand",
                "text-primary-dark lg:text-line lg:group-aria-[current=step]/step:text-primary",
              )}
            >
              {step.number}
            </p>
            <h3 className="mb-4 text-h3 text-ink">
              <span className="sr-only">{step.number}. </span>
              {step.title}
            </h3>
            <p
              className={cn(
                "max-w-xl text-lead transition-colors duration-(--duration-reveal) ease-brand",
                "text-ink lg:text-ink-muted lg:group-aria-[current=step]/step:text-ink",
              )}
            >
              {step.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
