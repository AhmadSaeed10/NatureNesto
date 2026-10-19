import { catalogCategories } from "@/content/catalog";

/** First path segments owned by real routes; a CMS page with one of these could never show. */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  "home",
  "admin",
  "auth",
  "preview",
  "dev",
  "plants",
  "services",
  "contact",
  "consultation",
  "blogs",
  "workshops",
  "faq",
  "products",
  "cart",
  "checkout",
  "account",
  "orders",
  ...catalogCategories.map((category) => category.href.split("/")[1] ?? "").filter(Boolean),
]);
