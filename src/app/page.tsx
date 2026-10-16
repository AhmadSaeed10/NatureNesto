import { seo } from "@/content/seo";
import { localBusinessJsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import { Banner } from "@/components/sections/Banner";
import { HERO_NEXT_ID, Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NeedHelp } from "@/components/sections/NeedHelp";
import { PlantsForEveryone } from "@/components/sections/PlantsForEveryone";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TaglineStrip } from "@/components/sections/TaglineStrip";
import { ValueProps } from "@/components/sections/ValueProps";

export const metadata = pageMetadata({
  title: seo.home.title,
  description: seo.home.description,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be inline; the content is built from typed site data, not user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd(siteUrl())).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <TaglineStrip id={HERO_NEXT_ID} />
      <ValueProps />
      <HowItWorks />
      <ServicesGrid />
      <Banner />
      <PlantsForEveryone />
      <NeedHelp />
    </>
  );
}
