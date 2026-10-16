import { Banner } from "@/components/sections/Banner";
import { HERO_NEXT_ID, Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NeedHelp } from "@/components/sections/NeedHelp";
import { PlantsForEveryone } from "@/components/sections/PlantsForEveryone";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TaglineStrip } from "@/components/sections/TaglineStrip";
import { ValueProps } from "@/components/sections/ValueProps";

export default function Home() {
  return (
    <>
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
