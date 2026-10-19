import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DitherArt } from "@/components/ui/DitherArt";
import { Icon, type UiIconName } from "@/components/ui/Icon";
import type { ContactKind } from "@/content/types";
import { type SectionData, sectionFallbacks } from "@/lib/cms/sections";

const TITLE_ID = "need-help-title";

const ICONS: Record<ContactKind, UiIconName> = {
  whatsapp: "whatsapp",
  call: "phone",
  email: "mail",
};

interface NeedHelpProps {
  data?: SectionData<"need_help">;
}

export function NeedHelp({ data: needHelp = sectionFallbacks.need_help }: NeedHelpProps) {
  return (
    <section aria-labelledby={TITLE_ID} className="grain relative overflow-hidden bg-surface">
      <DitherArt className="absolute -bottom-10 -left-20 h-[90%] w-[55%] -scale-x-100 text-ink opacity-[0.07] md:w-[32%]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 md:py-32 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <SplitHeading
            id={TITLE_ID}
            text={needHelp.title}
            emphasis={["Help?"]}
            className="mb-6 text-h1"
          />
          <Reveal as="p" className="max-w-md text-lead text-ink">
            {needHelp.body}
          </Reveal>
        </div>

        <div>
          <Stagger as="ul" className="grid gap-4">
            {needHelp.channels.map((channel) => (
              <StaggerItem as="li" key={channel.kind} className="h-full">
                <a
                  href={channel.href}
                  {...(channel.kind === "whatsapp"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex h-full items-center gap-5 rounded-card bg-background p-5 text-ink transition-[translate,box-shadow] duration-(--duration-micro) ease-brand hover:-translate-y-1 hover:shadow-soft focus-visible:-translate-y-1 focus-visible:shadow-soft sm:gap-6 sm:p-6"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-surface text-primary-dark transition-colors duration-(--duration-micro) ease-brand group-hover:bg-primary-dark group-hover:text-background">
                    <Icon name={ICONS[channel.kind]} size={22} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="eyebrow text-ink-muted">{channel.label}</span>
                    <span className="text-small text-ink-muted">{channel.prompt}</span>
                    <span className="font-serif text-h4 break-all sm:break-normal">
                      {channel.display}
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal as="p" className="mt-10 eyebrow text-primary-dark">
            {needHelp.signOff}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
