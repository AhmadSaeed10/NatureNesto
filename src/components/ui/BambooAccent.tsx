import { cn } from "@/lib/utils";

interface BambooAccentProps {
  className?: string;
}

/**
 * Decorative bamboo stalks echoing the logo. Sways three times from its base, then rests,
 * so it never competes with content (and stays still under reduced motion).
 */
export function BambooAccent({ className }: BambooAccentProps) {
  return (
    <svg
      viewBox="0 0 120 420"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
    >
      <g className="origin-bottom animate-sway [transform-box:fill-box]">
        <path d="M44 420V40" />
        <path d="M38 340h12M38 250h12M38 160h12M38 80h12" />
        <path d="M44 160c18-14 38-18 58-14-16 12-36 18-58 14ZM44 80c-14-14-30-20-44-18 10 14 26 20 44 18Z" />
      </g>
      <g className="origin-bottom animate-sway-late [transform-box:fill-box]">
        <path d="M80 420V130" />
        <path d="M74 350h12M74 270h12M74 190h12" />
        <path d="M80 190c16-10 30-12 40-8-10 10-26 12-40 8Z" />
      </g>
    </svg>
  );
}
