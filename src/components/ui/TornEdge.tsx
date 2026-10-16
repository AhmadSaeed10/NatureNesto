import { cn } from "@/lib/utils";

interface TornEdgeProps {
  className?: string;
}

/**
 * Torn paper edge in the page background colour. Used once, at the hero's lower edge,
 * as the section's special moment. Static SVG, so it costs nothing on mobile. A minimum
 * width crops the tear on narrow screens instead of squeezing it into spikes.
 */
export function TornEdge({ className }: TornEdgeProps) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none block h-8 w-[max(100%,64rem)] max-w-none text-background md:h-12",
        className,
      )}
    >
      <path
        fill="currentColor"
        d="M0 36L19 35L46 42L69 37L89 37L119 27L149 38L170 22L184 33L211 24L229 29L250 44L265 35L292 41L320 23L344 39L373 44L390 42L415 22L433 24L450 22L478 27L502 34L531 26L550 43L565 37L586 24L606 28L622 25L651 39L677 28L701 26L728 31L753 36L783 34L807 37L833 30L847 24L866 44L895 22L924 24L954 29L978 39L995 27L1014 42L1039 32L1064 41L1087 29L1104 27L1120 27L1147 33L1166 43L1181 43L1211 43L1232 35L1251 40L1265 33L1294 38L1320 43L1341 29L1360 39L1376 36L1403 37L1418 31L1433 30L1440 23L1440 64L0 64Z"
      />
    </svg>
  );
}
