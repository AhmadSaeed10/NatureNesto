import type { ReactNode } from "react";
import type { IconName } from "@/content/types";

// Line illustrations drawn on a 48 grid to sit with Instrument Serif at display sizes.
const PATHS: Record<IconName, ReactNode> = {
  plant: (
    <>
      <path d="M16 30h16l-2.5 12h-11L16 30Z" />
      <path d="M24 30V16" />
      <path d="M24 22c-6 0-9.5-3.5-10-9 5.5 0 9.5 3 10 9Z" />
      <path d="M24 18c.5-6 4.5-9.5 10.5-9.5-.5 6-4.5 9.5-10.5 9.5Z" />
    </>
  ),
  vase: (
    <>
      <path d="M19 6h10M20 6v5c-5 3-8 8-8 14 0 8 5 15 12 15s12-7 12-15c0-6-3-11-8-14V6" />
      <path d="M14.5 26h19" />
      <path d="M18 42h12" />
    </>
  ),
  table: (
    <>
      <path d="M8 26h32" />
      <path d="M12 26 9 42M36 26l3 16M14 34h20" />
      <path d="M21 26v-6h6v6M24 20v-6M24 16c-3 0-5-2-5-5 3 0 5 2 5 5ZM24 14c0-3 2-5 5-5 0 3-2 5-5 5Z" />
    </>
  ),
  guidance: (
    <>
      <circle cx="24" cy="24" r="16" />
      <path d="m30 18-4 8-8 4 4-8 8-4Z" />
      <path d="M24 8v3M24 37v3M8 24h3M37 24h3" />
    </>
  ),
  community: (
    <>
      <circle cx="17" cy="17" r="5" />
      <circle cx="31" cy="17" r="5" />
      <path d="M8 36c0-5 4-9 9-9 3 0 5.5 1.3 7 3.5 1.5-2.2 4-3.5 7-3.5 5 0 9 4 9 9" />
      <path d="M24 30.5V40" />
    </>
  ),
  support: (
    <>
      <path d="M10 22c0-7.5 6-13 14-13s14 5.5 14 13" />
      <rect x="7" y="22" width="7" height="11" rx="3" />
      <rect x="34" y="22" width="7" height="11" rx="3" />
      <path d="M37.5 33c0 4-3.5 6.5-8.5 6.5H26" />
    </>
  ),
};

interface BrandIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function BrandIcon({ name, size = 48, className }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
