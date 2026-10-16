import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { taglineStrip } from "@/content/home";

interface TaglineStripProps {
  id: string;
}

// Typographic treatment only: the lead word stays upright, the rest sets in italic.
// The copy itself is untouched.
const splitLead = (text: string): [string, string] => {
  const [lead = "", ...rest] = text.split(" ");
  return [lead, rest.join(" ")];
};

export function TaglineStrip({ id }: TaglineStripProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <Stagger as="ul" className="grid gap-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
          {taglineStrip.map((item) => {
            const [lead, rest] = splitLead(item.text);
            return (
              <StaggerItem
                as="li"
                key={item.text}
                className="flex flex-col items-center gap-5 text-center md:px-8"
              >
                <BrandIcon name={item.icon} size={56} className="text-primary-dark" />
                <p className="font-serif text-h3 text-ink">
                  {lead} <em>{rest}</em>
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
