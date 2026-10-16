import type { SocialLink } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface SocialLinksProps {
  links: readonly SocialLink[];
  className?: string;
  iconSize?: number;
}

export function SocialLinks({ links, className, iconSize = 18 }: SocialLinksProps) {
  return (
    <ul aria-label={ui.socialNav} className={cn("flex items-center", className)}>
      {links.map(({ platform, label, href }) => (
        <li key={platform}>
          <a
            href={href}
            aria-label={label}
            className="inline-flex size-(--size-tap) items-center justify-center rounded-pill opacity-80 transition-opacity duration-(--duration-micro) ease-brand hover:opacity-100"
          >
            <Icon name={platform} size={iconSize} />
          </a>
        </li>
      ))}
    </ul>
  );
}
