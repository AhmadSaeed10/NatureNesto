import { cn } from "@/lib/utils";

interface BotanicalFrameProps {
  className?: string;
}

// One vine flourish, mirrored into each corner. Used once in the services grid.
const FLOURISH = (
  <g>
    <path d="M2 46C2 22 18 4 46 2" />
    <path d="M10 30c-6-4-8-10-6-16 6 2 9 8 6 16ZM20 16c-2-6 0-12 6-15 2 6-1 12-6 15ZM34 8c4-4 10-5 15-2-4 4-10 5-15 2Z" />
    <circle cx="4" cy="52" r="1.5" />
    <circle cx="52" cy="4" r="1.5" />
  </g>
);

export function BotanicalFrame({ className }: BotanicalFrameProps) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-3", className)}>
      <span className="absolute inset-0 rounded-[14px] border border-current opacity-40" />
      {(
        [
          "top-0 left-0",
          "top-0 right-0 -scale-x-100",
          "bottom-0 left-0 -scale-y-100",
          "right-0 bottom-0 -scale-100",
        ] as const
      ).map((position) => (
        <svg
          key={position}
          viewBox="0 0 56 56"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          className={cn("absolute size-12 -translate-px", position)}
        >
          {FLOURISH}
        </svg>
      ))}
    </span>
  );
}
