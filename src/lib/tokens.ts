/**
 * Brand tokens: the single source of truth for colour, radius, type and motion values.
 *
 * UNCONFIRMED: colour values are estimates read from the logo. Confirm with an eyedropper
 * on the original SVG, then update this file and CLAUDE.md together.
 *
 * After editing, run `npm run tokens` (also runs automatically before dev and build) to
 * regenerate src/styles/tokens.css, and `npm run contrast` to re-check WCAG ratios.
 */
export const TOKENS = {
  color: {
    primary: "#2E9B3A", // leaf green, from logo. Fills, icons, large text, decoration only.
    primaryDark: "#1F6F2B", // text safe green for links and small green text.
    accent: "#2E9B3A", // CTAs. Confirm if a separate accent exists.
    background: "#FBF9F6",
    surface: "#F1EDE7",
    ink: "#5A4A4A", // wordmark brown
    inkMuted: "#7D6E6E", // tagline taupe
    line: "#D9D2CA",
  },
  radius: {
    card: "20px",
    pill: "999px",
  },
  // Fluid scale tuned for 375px to 1536px viewports.
  text: {
    display: { size: "clamp(3rem, 1.9rem + 4.7vw, 6.5rem)", leading: "0.95", tracking: "-0.02em" },
    h1: { size: "clamp(2.5rem, 1.75rem + 3.2vw, 4.75rem)", leading: "0.98", tracking: "-0.02em" },
    h2: { size: "clamp(2rem, 1.45rem + 2.3vw, 3.5rem)", leading: "1", tracking: "-0.015em" },
    h3: { size: "clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)", leading: "1.05", tracking: "-0.01em" },
    h4: { size: "clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)", leading: "1.15", tracking: "-0.005em" },
    lead: { size: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)", leading: "1.5", tracking: "0em" },
    body: { size: "1rem", leading: "1.6", tracking: "0em" },
    small: { size: "0.875rem", leading: "1.5", tracking: "0em" },
    eyebrow: { size: "0.75rem", leading: "1.2", tracking: "0.18em" },
  },
  motion: {
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    durationMicro: "200ms",
    durationReveal: "750ms",
  },
  size: {
    tapTarget: "44px",
  },
  texture: {
    grainOpacity: "0.04",
  },
} as const;

export type ColorToken = keyof typeof TOKENS.color;
export type TextToken = keyof typeof TOKENS.text;
