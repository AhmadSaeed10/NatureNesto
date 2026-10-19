import { Banner } from "@/components/sections/Banner";
import { HERO_NEXT_ID, Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NeedHelp } from "@/components/sections/NeedHelp";
import { PlantsForEveryone } from "@/components/sections/PlantsForEveryone";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TaglineStrip } from "@/components/sections/TaglineStrip";
import { ValueProps } from "@/components/sections/ValueProps";
import type { HomeSections as HomeSectionsData } from "@/lib/cms/sections";

/** Homepage sections in their fixed order; a hidden section (null) is skipped. */
export function HomeSections({ sections }: { sections: HomeSectionsData }) {
  return (
    <>
      {sections.hero ? <Hero data={sections.hero} /> : null}
      {sections.tagline ? <TaglineStrip id={HERO_NEXT_ID} data={sections.tagline} /> : null}
      {sections.value_props ? <ValueProps data={sections.value_props} /> : null}
      {sections.how_it_works ? <HowItWorks data={sections.how_it_works} /> : null}
      {sections.services ? <ServicesGrid data={sections.services} /> : null}
      {sections.banner ? <Banner data={sections.banner} /> : null}
      {sections.plants ? <PlantsForEveryone data={sections.plants} /> : null}
      {sections.need_help ? <NeedHelp data={sections.need_help} /> : null}
    </>
  );
}
