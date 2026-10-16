import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Card } from "@/components/ui/Card";
import { DitherArt } from "@/components/ui/DitherArt";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { needHelp } from "@/content/home";
import { quote } from "@/content/quote";
import { QuoteForm } from "./QuoteForm";

export const QUOTE_ID = "quote";
const TITLE_ID = "quote-title";

interface QuoteSectionProps {
  defaultService?: string;
}

const whatsappHref = needHelp.channels.find((channel) => channel.kind === "whatsapp")?.href ?? "";

export function QuoteSection({ defaultService }: QuoteSectionProps) {
  return (
    <section
      id={QUOTE_ID}
      aria-labelledby={TITLE_ID}
      className="grain relative scroll-mt-24 overflow-hidden bg-surface"
    >
      <DitherArt className="absolute -right-16 bottom-0 h-full w-[55%] text-primary-dark opacity-[0.08] md:w-[34%]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <Eyebrow className="mb-5">{quote.eyebrow}</Eyebrow>
          <SplitHeading
            id={TITLE_ID}
            text={quote.title}
            emphasis={["need"]}
            className="mb-6 text-h1"
          />
          <Reveal as="p" className="max-w-md text-lead text-ink">
            {quote.intro}
          </Reveal>
        </div>
        <Reveal>
          <Card className="bg-background p-6 shadow-soft sm:p-10">
            <QuoteForm whatsappHref={whatsappHref} defaultService={defaultService} />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
