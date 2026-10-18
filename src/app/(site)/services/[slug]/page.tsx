import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { QUOTE_ID, QuoteSection } from "@/components/forms/QuoteSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { stubPages } from "@/content/pages";
import { quote } from "@/content/quote";
import { seo } from "@/content/seo";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const SERVICES_TITLE = "Services";

const find = (slug: string) => services.find((service) => service.slug === slug);

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = find((await params).slug);
  return service
    ? pageMetadata({
        title: service.title,
        description: seo.pageDescription(service.title),
        path: service.href,
      })
    : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = find((await params).slug);
  if (!service) notFound();
  // Service descriptions have not been supplied yet; the stub TODO stays visible.
  const todo = stubPages.find((page) => page.path === service.href)?.todo;

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-16 md:px-8 md:pt-24 lg:grid-cols-[7fr_5fr] lg:items-end">
        <div>
          <Eyebrow className="mb-5">{SERVICES_TITLE}</Eyebrow>
          <SplitHeading as="h1" text={service.title} className="mb-8 text-h1" />
          <Button href={`#${QUOTE_ID}`} withArrow>
            {quote.eyebrow}
          </Button>
        </div>
        <Card grain className="flex items-start gap-5 border border-dashed border-ink/30">
          <BrandIcon name={service.icon} size={44} className="shrink-0 text-primary-dark" />
          <p className="text-ink">{todo}</p>
        </Card>
      </section>
      <QuoteSection defaultService={service.title} />
      <div className="pt-20 md:pt-28">
        <ServicesGrid />
      </div>
    </>
  );
}
