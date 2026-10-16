import Image from "next/image";
import logoMark from "@/assets/brand/logo-mark.png";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "light" for dark surfaces such as the footer. */
  tone?: "ink" | "light";
  /** The "Leaves . Delight . Nesto" line under the wordmark. */
  showTagline?: boolean;
  /** Extra classes for the tagline, for example to hide it on small screens. */
  taglineClassName?: string;
  className?: string;
}

const [firstWord = site.name, ...rest] = site.name.split(" ");
const secondWord = rest.join(" ");

/**
 * The client's bamboo mark (artwork kept as supplied) with the wordmark set live in
 * Instrument Serif. The surrounding link carries the accessible name, so the mark is
 * decorative and the text is hidden from assistive tech to avoid a double read.
 */
export function Logo({
  tone = "ink",
  showTagline = false,
  taglineClassName,
  className,
}: LogoProps) {
  const light = tone === "light";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          // The mark's brown frame disappears on ink, so it sits on a paper chip there.
          light && "rounded-xl bg-background p-1.5",
        )}
      >
        <Image
          src={logoMark}
          alt=""
          priority
          sizes="48px"
          className={cn("h-12 w-auto", light && "h-10")}
        />
      </span>
      <span aria-hidden="true" className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[1.5rem] leading-[0.92] tracking-[0.04em] uppercase",
            light ? "text-background" : "text-ink",
          )}
        >
          {firstWord}
          <br />
          {secondWord}
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 font-serif text-[0.8125rem] leading-none whitespace-nowrap",
              light ? "text-surface" : "text-ink-muted",
              taglineClassName,
            )}
          >
            {site.tagline.logo}
          </span>
        ) : null}
      </span>
    </span>
  );
}
