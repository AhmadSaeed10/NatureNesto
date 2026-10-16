import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StubPage } from "@/components/ui/StubPage";
import { stubPages } from "@/content/pages";

// Inner pages are stubs until content arrives. A dedicated route folder added later
// (for example app/contact) takes priority over this catch-all.
const findPage = (slug: string[]) => stubPages.find((page) => page.path === `/${slug.join("/")}`);

export function generateStaticParams() {
  return stubPages.map((page) => ({ slug: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const page = findPage((await params).slug);
  return page ? { title: page.title } : {};
}

export default async function Page({ params }: PageProps<"/[...slug]">) {
  const page = findPage((await params).slug);
  if (!page) notFound();
  return <StubPage title={page.title} body={page.todo} />;
}
