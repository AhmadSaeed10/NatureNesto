import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface EnquiryPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  aside?: ReactNode;
  children: ReactNode;
}

/** Shared layout for the contact and consultation pages: copy on the left, form on the right. */
export function EnquiryPage({ eyebrow, title, intro, aside, children }: EnquiryPageProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[5fr_7fr] lg:gap-20">
      <div>
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <SplitHeading as="h1" text={title} className="mb-6 text-h1" />
        <Reveal as="p" className="mb-10 max-w-md text-lead text-ink">
          {intro}
        </Reveal>
        {aside}
      </div>
      <Reveal>
        <Card grain className="p-6 sm:p-10">
          {children}
        </Card>
      </Reveal>
    </section>
  );
}
