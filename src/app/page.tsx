import { HERO_NEXT_ID, Hero } from "@/components/sections/Hero";
import { TaglineStrip } from "@/components/sections/TaglineStrip";
import { ValueProps } from "@/components/sections/ValueProps";

export default function Home() {
  return (
    <>
      <Hero />
      <TaglineStrip id={HERO_NEXT_ID} />
      <ValueProps />
    </>
  );
}
