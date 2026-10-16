import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Eyebrow({ as: Tag = "p", className, children }: EyebrowProps) {
  return <Tag className={cn("eyebrow text-ink-muted", className)}>{children}</Tag>;
}
