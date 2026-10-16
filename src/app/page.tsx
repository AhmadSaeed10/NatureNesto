import { hero } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Placeholder until the homepage sections land in Phase 4.
export default function Home() {
  return (
    <section className="mx-auto grid min-h-[70dvh] max-w-7xl content-center gap-6 px-4 py-24 md:px-8">
      <Eyebrow>{hero.subline}</Eyebrow>
      <h1 className="text-display">{hero.headline}</h1>
      <p className="text-lead text-ink-muted">{hero.secondary}</p>
      <div>
        <Button href={hero.cta.href} withArrow>
          {hero.cta.label}
        </Button>
      </div>
    </section>
  );
}
