import { ui } from "@/content/ui";
import { Button } from "./Button";
import { Card } from "./Card";
import { Eyebrow } from "./Eyebrow";

interface StubPageProps {
  eyebrow?: string;
  title: string;
  body: string;
}

export function StubPage({ eyebrow = ui.stubEyebrow, title, body }: StubPageProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 md:px-8 lg:py-32">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="max-w-4xl text-h1">{title}</h1>
      <Card grain className="max-w-2xl border border-dashed border-ink/30">
        <p>{body}</p>
      </Card>
      <div>
        <Button href="/" variant="secondary" withArrow>
          {ui.backHome}
        </Button>
      </div>
    </section>
  );
}
