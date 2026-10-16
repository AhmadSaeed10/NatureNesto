import { cn } from "@/lib/utils";

interface StudioDrawingProps {
  className?: string;
}

/**
 * Line drawing of a styled corner: window, dimensions, poster, side table and plants.
 * Illustrates "share your space" through to "we deliver and style it". Decorative.
 */
export function StudioDrawing({ className }: StudioDrawingProps) {
  return (
    <svg
      viewBox="0 0 400 480"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full", className)}
    >
      {/* Dimension line across the top, the space measured */}
      <path d="M40 34h320M40 26v16M360 26v16M52 34l-8-5M52 34l-8 5M348 34l8-5M348 34l8 5" />
      {/* Window */}
      <path d="M210 70h130v170H210zM275 70v170M210 155h130" />
      <path d="M200 240h150" />
      {/* Poster frame with a quote */}
      <path d="M60 80h96v124H60z" />
      <path d="M72 94h72v96H72z" opacity={0.5} />
      <path d="M84 120h48M84 134h40M84 148h44M96 172h24" />
      {/* Floor */}
      <path d="M20 420h360" />
      <path d="M40 432h120M220 432h140" opacity={0.5} />
      {/* Side table */}
      <path d="M70 320h120M84 320l-10 100M176 320l10 100M80 370h100" />
      {/* Small vase on table */}
      <path d="M118 320c-6-8-6-20 2-26h20c8 6 8 18 2 26" />
      <path d="M130 294c-2-14 4-26 14-32M130 294c-6-10-18-14-28-12" />
      {/* Large planter */}
      <path d="M248 340h84l-10 80h-64l-10-80Z" />
      <path d="M244 332h92v8h-92z" />
      {/* Monstera stems and leaves */}
      <path d="M290 332c-2-50-10-90-32-120M290 332c4-60 24-100 54-124M290 332c0-40 2-80 0-110" />
      <path d="M258 212c-30 4-50 24-52 52 26 2 48-14 52-52Z" />
      <path d="M344 208c4 30-10 56-38 64-6-28 10-56 38-64Z" />
      <path d="M290 222c-20-14-22-40-6-58 18 14 20 40 6 58Z" />
      <path
        d="M232 244l16-8M224 256l20-6M318 246l14-10M322 232l12-14M286 200l-6-12M294 196l6-12"
        opacity={0.6}
      />
    </svg>
  );
}
