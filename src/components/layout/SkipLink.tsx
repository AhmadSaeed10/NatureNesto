import { ui } from "@/content/ui";
import { MAIN_CONTENT_ID } from "@/lib/constants";

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="fixed top-3 left-3 z-50 -translate-y-20 rounded-pill bg-primary-dark px-5 py-3 text-background transition-transform duration-(--duration-micro) ease-brand focus-visible:translate-y-0"
    >
      {ui.skipLink}
    </a>
  );
}
