import { categories } from "./categories";
import type { CatalogSlug } from "./types";

export interface CatalogCategory {
  slug: CatalogSlug;
  title: string;
  href: string;
}

// Shop pages from the header plus the Plants For Everyone collections, in nav order.
// Titles reuse the existing link labels.
export const catalogCategories: CatalogCategory[] = [
  { slug: "pots-and-planters", title: "Pots & Planters", href: "/pots-and-planters" },
  ...categories.map(({ slug, title, href }) => ({ slug: slug as CatalogSlug, title, href })),
];

export const findCatalogCategory = (slug: string): CatalogCategory | undefined =>
  catalogCategories.find((category) => category.slug === slug);
