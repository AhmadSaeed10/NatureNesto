import { cn } from "@/lib/utils";

interface DitherArtProps {
  className?: string;
}

/**
 * Stippled botanical texture. The PNG is only an alpha mask; colour comes from the
 * current text colour, so it always renders in brand tokens (use primaryDark or ink).
 */
export function DitherArt({ className }: DitherArtProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none bg-current [mask-image:url(/textures/dither-botanical.png)] [mask-size:contain] [mask-position:bottom] [mask-repeat:no-repeat]",
        className,
      )}
    />
  );
}
