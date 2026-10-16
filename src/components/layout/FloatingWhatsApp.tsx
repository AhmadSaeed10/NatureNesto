import { Icon } from "@/components/ui/Icon";

interface FloatingWhatsAppProps {
  href: string;
  label: string;
}

// The pulse ring runs three cycles then stops (and never under reduced motion), so the
// button invites without nagging.
export function FloatingWhatsApp({ href, label }: FloatingWhatsAppProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed right-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-pill bg-primary-dark text-background shadow-soft transition-transform duration-(--duration-micro) ease-brand hover:-translate-y-0.5 active:scale-[0.98] md:right-6 md:bottom-6"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-pulse-ring rounded-pill bg-primary"
      />
      <Icon name="whatsapp" size={26} className="relative" />
    </a>
  );
}
