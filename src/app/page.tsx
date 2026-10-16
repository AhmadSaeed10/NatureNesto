import { hero } from "@/content/home";

// Placeholder until the homepage sections land in Phase 4.
export default function Home() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl content-center gap-6 px-4 py-24">
      <p className="eyebrow text-ink-muted">{hero.subline}</p>
      <h1 className="text-display">{hero.headline}</h1>
      <p className="text-lead text-ink-muted">{hero.secondary}</p>
    </main>
  );
}
