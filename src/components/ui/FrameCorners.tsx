import { cn } from "@/lib/utils";

interface FrameCornersProps {
  className?: string;
}

// The logo's square frame, reduced to corner brackets so it can sit on any surface.
const CORNER = "absolute size-4 border-current";

export function FrameCorners({ className }: FrameCornersProps) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(CORNER, "top-0 left-0 border-t-[1.5px] border-l-[1.5px]")} />
      <span className={cn(CORNER, "top-0 right-0 border-t-[1.5px] border-r-[1.5px]")} />
      <span className={cn(CORNER, "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]")} />
      <span className={cn(CORNER, "right-0 bottom-0 border-r-[1.5px] border-b-[1.5px]")} />
    </span>
  );
}
