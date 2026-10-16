// Dev only: labels for the /dev/motion demo route. Removed with the route in Phase 8.
export const devMotion = {
  title: "Motion primitives",
  intro:
    "Internal demo of the motion system. Scroll to trigger each reveal. Try with reduced motion on, and on a touch device.",
  labels: {
    splitHeading: "SplitHeading",
    reveal: "Reveal",
    magnetic: "Magnetic (desktop only)",
    stagger: "Stagger with View cursor (desktop only)",
    parallax: "ParallaxImage",
  },
  images: [
    {
      src: "/dev/dither-fern-green.webp",
      alt: "Dithered green illustration of leafy stems rising from the bottom of the frame",
    },
    {
      src: "/dev/dither-fern-ink.webp",
      alt: "Dithered brown ink illustration of leafy stems, printed in a riso style",
    },
  ],
} as const;
