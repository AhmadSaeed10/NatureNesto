"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface HeroVideoProps {
  src: string;
  pauseLabel: string;
  playLabel: string;
}

type NetworkInformation = { saveData?: boolean };

/**
 * The poster image underneath is the LCP element. The video source is only attached when
 * the visitor has neither Data Saver nor reduced motion on, so those visitors download
 * nothing. A pause control satisfies WCAG 2.2.2 for looping background motion.
 */
export function HeroVideo({ src, pauseLabel, playLabel }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (!el || reduced || connection?.saveData) return;
    el.src = src;
    el.play().catch(() => {
      // Autoplay can be refused (power saving, browser policy); the poster stays.
    });
  }, [src, reduced]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => {
          setHasPlayed(true);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          // Source failed (offline, blocked host): fall back to the poster, hide the control.
          setHasPlayed(false);
          setPlaying(false);
        }}
        data-playing={hasPlayed || undefined}
        className="absolute inset-0 -z-20 size-full object-cover opacity-0 transition-opacity duration-(--duration-reveal) ease-brand data-playing:opacity-100"
      />
      {hasPlayed ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? pauseLabel : playLabel}
          className="absolute top-4 right-4 z-10 inline-flex size-(--size-tap) items-center justify-center rounded-pill border border-background/40 text-background backdrop-blur-sm transition-colors duration-(--duration-micro) ease-brand hover:border-background md:top-6 md:right-8"
        >
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
      ) : null}
    </>
  );
}
