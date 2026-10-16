import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  as?: ElementType;
  grain?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ as: Tag = "div", grain = false, className, children }: CardProps) {
  return (
    <Tag className={cn("rounded-card bg-surface p-6 text-ink", grain && "grain", className)}>
      {children}
    </Tag>
  );
}
