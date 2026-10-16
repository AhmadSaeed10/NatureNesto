import { Magnetic } from "@/components/motion/Magnetic";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { FrameCorners } from "@/components/ui/FrameCorners";
import { banner } from "@/content/home";

const TITLE_ID = "banner-title";

export function Banner() {
  return (
    <section
      aria-labelledby={TITLE_ID}
      // Light focus ring: primaryDark on ink is below 3:1.
      className="grain bg-ink text-background [--focus-ring:var(--color-background)]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
        <ParallaxImage
          src={banner.image.src}
          alt={banner.image.alt}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/3] rounded-card"
        />
        <div className="relative p-5 md:p-8">
          <FrameCorners className="text-background/40" />
          <SplitHeading
            id={TITLE_ID}
            text={banner.headline}
            emphasis={["future"]}
            className="text-h1"
          />
          <Reveal delay={0.25} className="mt-6 flex flex-col items-start gap-8">
            <p className="text-lead text-surface">{banner.secondary}</p>
            <Magnetic>
              <Button href={banner.cta.href} withArrow>
                {banner.cta.label}
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
