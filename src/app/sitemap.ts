import type { MetadataRoute } from "next";
import { stubPages } from "@/content/pages";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...stubPages.map((page) => ({
      url: `${base}${page.path}`,
      changeFrequency: "monthly" as const,
      priority: page.path.startsWith("/services") ? 0.8 : 0.6,
    })),
  ];
}
