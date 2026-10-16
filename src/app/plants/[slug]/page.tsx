import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/shop/CategoryView";
import { catalogCategories, findCatalogCategory } from "@/content/catalog";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/seo";

const PREFIX = "/plants/";

export function generateStaticParams() {
  return catalogCategories
    .filter((category) => category.href.startsWith(PREFIX))
    .map((category) => ({ slug: category.slug }));
}

const find = (slug: string) => {
  const category = findCatalogCategory(slug);
  return category?.href.startsWith(PREFIX) ? category : undefined;
};

export async function generateMetadata({ params }: PageProps<"/plants/[slug]">): Promise<Metadata> {
  const category = find((await params).slug);
  return category
    ? pageMetadata({
        title: category.title,
        description: seo.pageDescription(category.title),
        path: category.href,
      })
    : {};
}

export default async function Page({ params }: PageProps<"/plants/[slug]">) {
  const category = find((await params).slug);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
