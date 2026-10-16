// WCAG 2.2 contrast report for token pairs. Fails (exit 1) only when a pair approved for
// text use drops below its threshold, so palette edits cannot silently break AA.
import { TOKENS, type ColorToken } from "../src/lib/tokens.ts";

type Usage = "body" | "large" | "avoid";

interface Pair {
  fg: ColorToken;
  bg: ColorToken;
  usage: Usage;
  note: string;
}

const THRESHOLD: Record<Usage, number> = { body: 4.5, large: 3, avoid: 0 };

const PAIRS: Pair[] = [
  { fg: "ink", bg: "background", usage: "body", note: "Default text" },
  { fg: "ink", bg: "surface", usage: "body", note: "Text on cards" },
  { fg: "inkMuted", bg: "background", usage: "body", note: "Secondary text" },
  { fg: "inkMuted", bg: "surface", usage: "avoid", note: "Fails body AA. Use ink on surface" },
  { fg: "primaryDark", bg: "background", usage: "body", note: "Links, green text" },
  { fg: "primaryDark", bg: "surface", usage: "body", note: "Links on cards" },
  { fg: "primary", bg: "background", usage: "large", note: "Large text, icons only" },
  { fg: "primary", bg: "surface", usage: "large", note: "Large text, icons only" },
  { fg: "background", bg: "primaryDark", usage: "body", note: "CTA label on primaryDark fill" },
  {
    fg: "background",
    bg: "accent",
    usage: "avoid",
    note: "CTA label on accent fill fails body AA",
  },
  { fg: "line", bg: "background", usage: "avoid", note: "Decorative dividers only" },
  // Header and announcement bar
  { fg: "ink", bg: "surface", usage: "body", note: "Announcement bar text" },
  {
    fg: "primaryDark",
    bg: "background",
    usage: "large",
    note: "Focus ring and nav active (3:1 UI)",
  },
  {
    fg: "primaryDark",
    bg: "surface",
    usage: "large",
    note: "Focus ring on announcement bar (3:1 UI)",
  },
  // Footer (ink surface)
  { fg: "background", bg: "ink", usage: "body", note: "Footer links" },
  { fg: "surface", bg: "ink", usage: "body", note: "Footer headings, address, legal" },
  { fg: "background", bg: "ink", usage: "large", note: "Footer focus ring (3:1 UI)" },
  { fg: "primaryDark", bg: "ink", usage: "avoid", note: "Never use as focus ring on ink" },
];

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
};

const ratio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

let failed = false;
const rows = PAIRS.map(({ fg, bg, usage, note }) => {
  const r = ratio(TOKENS.color[fg], TOKENS.color[bg]);
  const pass = r >= THRESHOLD[usage];
  if (!pass) failed = true;
  const status = usage === "avoid" ? "AVOID" : pass ? "PASS" : "FAIL";
  return { pair: `${fg} on ${bg}`, ratio: r.toFixed(2), usage, status, note };
});

console.table(rows);
if (failed) {
  console.error("contrast: a pair approved for text use is below its WCAG threshold");
  process.exit(1);
}
