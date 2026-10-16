import { Drift } from "@/components/motion/Drift";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { StudioDrawing } from "@/components/ui/StudioDrawing";
import { howItWorks, steps } from "@/content/steps";
import { StepsTracker } from "./StepsTracker";

const TITLE_ID = "how-it-works-title";

export function HowItWorks() {
  return (
    <section aria-labelledby={TITLE_ID} className="relative">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 md:py-32 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <p className="mb-5 eyebrow text-ink-muted">{howItWorks.eyebrow}</p>
          </Reveal>
          <SplitHeading
            id={TITLE_ID}
            text={howItWorks.title}
            emphasis={["Works"]}
            className="mb-10 text-h1"
          />
          {/* The section's one perforated stamp: the drawing is presented like a postage stamp */}
          <Reveal className="mx-auto max-w-sm lg:mx-0">
            <div className="bg-surface stamp">
              <div className="grain bg-surface p-6 text-ink md:p-8">
                <Drift amount={24}>
                  <StudioDrawing />
                </Drift>
              </div>
            </div>
          </Reveal>
        </div>

        <StepsTracker steps={steps} />
      </div>
    </section>
  );
}
