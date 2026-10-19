import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BambooAccent } from "@/components/ui/BambooAccent";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { DitherArt } from "@/components/ui/DitherArt";
import { FrameCorners } from "@/components/ui/FrameCorners";
import { type SectionData, sectionFallbacks } from "@/lib/cms/sections";

interface ValuePropsProps {
  data?: SectionData<"value_props">;
}

export function ValueProps({ data = sectionFallbacks.value_props }: ValuePropsProps) {
  const valueProps = data.items;
  return (
    <section className="grain relative overflow-hidden bg-surface">
      <DitherArt className="absolute -right-16 bottom-0 h-full w-[60%] text-primary-dark opacity-[0.1] md:w-[38%]" />
      <BambooAccent className="absolute bottom-0 left-0 hidden h-80 text-ink/30 lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
        <Stagger as="ul" className="grid gap-6 md:grid-cols-3">
          {valueProps.map((prop) => (
            <StaggerItem as="li" key={prop.title} className="h-full">
              <article className="flex h-full flex-col rounded-card bg-background p-8 text-ink md:p-10">
                <div className="relative mb-10 inline-flex size-20 items-center justify-center self-start">
                  <FrameCorners className="text-ink/60" />
                  <BrandIcon name={prop.icon} size={40} className="text-primary-dark" />
                </div>
                <h2 className="mb-4 text-h3">{prop.title}</h2>
                <p className="text-ink-muted">{prop.body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
