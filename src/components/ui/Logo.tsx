import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Path to the supplied logo SVG in /public. Until it arrives, a framed wordmark stands in. */
  src?: string;
  /** "light" for dark surfaces such as the footer. */
  tone?: "ink" | "light";
  className?: string;
}

// flag: placeholder wordmark until the client logo file is supplied (public/brand/logo.svg).
export function Logo({ src, tone = "ink", className }: LogoProps) {
  if (src) {
    return (
      <Image src={src} alt={site.name} width={160} height={48} className={className} priority />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center border-[1.5px] px-2.5 pt-1 pb-0.5 font-serif text-h4 leading-none",
        tone === "ink" ? "border-ink text-ink" : "border-background text-background",
        className,
      )}
    >
      {site.name}
    </span>
  );
}
