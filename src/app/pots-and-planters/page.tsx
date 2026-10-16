import { notFound } from "next/navigation";
import { CategoryView } from "@/components/shop/CategoryView";
import { findCatalogCategory } from "@/content/catalog";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/seo";

const category = findCatalogCategory("pots-and-planters");

export const metadata = category
  ? pageMetadata({
      title: category.title,
      description: seo.pageDescription(category.title),
      path: category.href,
    })
  : {};

export default function Page() {
  if (!category) notFound();
  return <CategoryView category={category} />;
}
