import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BotanicalFrame } from "@/components/ui/BotanicalFrame";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Icon } from "@/components/ui/Icon";
import { services, servicesEyebrow } from "@/content/services";
import { cn } from "@/lib/utils";

const TITLE_ID = "services-title";

export function ServicesGrid() {
  return (
    <section aria-labelledby={TITLE_ID} className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8 md:pb-32">
        <h2
          id={TITLE_ID}
          className="mb-10 border-t border-line pt-10 eyebrow font-sans text-ink-muted"
        >
          {servicesEyebrow}
        </h2>
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((service) => (
            <StaggerItem as="li" key={service.slug} className="h-full">
              <Link
                href={service.href}
                className={cn(
                  "group relative flex h-full min-h-52 flex-col justify-between rounded-card bg-surface p-7 text-ink sm:min-h-64 sm:p-8",
                  "transition-[translate,box-shadow] duration-(--duration-micro) ease-brand",
                  "hover:-translate-y-1 hover:shadow-soft focus-visible:-translate-y-1 focus-visible:shadow-soft",
                  service.featured && "grain p-10 sm:p-12",
                )}
              >
                {service.featured ? <BotanicalFrame className="text-ink" /> : null}
                <BrandIcon
                  name={service.icon}
                  size={44}
                  className="origin-bottom text-primary-dark group-hover:animate-leaf group-focus-visible:animate-leaf"
                />
                <span className="mt-10 flex items-end justify-between gap-6">
                  <span className="font-serif text-h3">{service.title}</span>
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-ink/25 transition-colors duration-(--duration-micro) ease-brand group-hover:border-ink group-hover:bg-ink group-hover:text-background">
                    <Icon
                      name="arrow-right"
                      size={18}
                      className="transition-transform duration-(--duration-micro) ease-brand group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
