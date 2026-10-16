import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { categories } from "@/content/categories";
import { devMotion } from "@/content/dev";
import { banner, hero } from "@/content/home";

export const metadata: Metadata = {
  title: devMotion.title,
  robots: { index: false, follow: false },
};

const SECTION = "mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 md:px-8";

export default function MotionDemo() {
  const [green, ink] = devMotion.images;
  return (
    <>
      <section className={SECTION}>
        <Eyebrow>{devMotion.labels.splitHeading}</Eyebrow>
        <SplitHeading as="h1" text={hero.headline} emphasis={["Life"]} className="text-display" />
        <Reveal as="p" className="max-w-xl text-lead text-ink-muted">
          {devMotion.intro}
        </Reveal>
      </section>

      <section className={SECTION}>
        <Eyebrow>{devMotion.labels.magnetic}</Eyebrow>
        <div>
          <Magnetic>
            <Button href={hero.cta.href} withArrow>
              {hero.cta.label}
            </Button>
          </Magnetic>
        </div>
      </section>

      <section className={SECTION}>
        <Eyebrow>{devMotion.labels.stagger}</Eyebrow>
        <Stagger as="ul" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <StaggerItem as="li" key={category.slug}>
              <Link
                href={category.href}
                data-cursor="view"
                className="grain flex aspect-[3/4] items-end rounded-card bg-surface p-5 font-serif text-h4 text-ink transition-transform duration-(--duration-micro) ease-brand hover:-translate-y-1"
              >
                {category.title}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {green && ink ? (
        <section className={SECTION}>
          <Eyebrow>{devMotion.labels.parallax}</Eyebrow>
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <ParallaxImage
              src={green.src}
              alt={green.alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5] rounded-card"
            />
            <ParallaxImage
              src={ink.src}
              alt={ink.alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5] rounded-card md:mt-32"
            />
          </div>
        </section>
      ) : null}

      <section className={SECTION}>
        <Reveal>
          <Eyebrow>{devMotion.labels.reveal}</Eyebrow>
        </Reveal>
        <SplitHeading text={banner.headline} emphasis={["future"]} className="max-w-4xl text-h1" />
      </section>
    </>
  );
}
