import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichText } from "./RichText";

interface CmsArticleProps {
  eyebrow?: string;
  title: string;
  /** Rich text source. */
  body: string;
  /** Shown between the title and the body, for example a date or cover image. */
  meta?: ReactNode;
  children?: ReactNode;
}

/** Editorial layout for CMS pages and posts: one h1, a measured text column. */
export function CmsArticle({ eyebrow, title, body, meta, children }: CmsArticleProps) {
  return (
    <article className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 md:px-8 lg:py-28">
      <Reveal className="flex max-w-4xl flex-col gap-6">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="text-h1">{title}</h1>
        {meta}
      </Reveal>
      <Reveal>
        <RichText source={body} />
      </Reveal>
      {children}
    </article>
  );
}
