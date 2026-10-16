import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StubPage } from "@/components/ui/StubPage";
import { stubPages } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/seo";

// Inner pages are stubs until content arrives. A dedicated route folder added later
// (for example app/contact) takes priority over this catch-all.
const findPage = (slug: string[]) => stubPages.find((page) => page.path === `/${slug.join("/")}`);

// These paths have dedicated route folders with real content.
const DEDICATED = new Set(["/contact", "/consultation"]);

export function generateStaticParams() {
  return stubPages
    .filter((page) => !DEDICATED.has(page.path))
    .map((page) => ({ slug: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const page = findPage((await params).slug);
  return page
    ? pageMetadata({
        title: page.title,
        description: seo.pageDescription(page.title),
        path: page.path,
      })
    : {};
}

export default async function Page({ params }: PageProps<"/[...slug]">) {
  const page = findPage((await params).slug);
  if (!page) notFound();
  return <StubPage title={page.title} body={page.todo} />;
}
