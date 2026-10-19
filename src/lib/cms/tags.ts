import { SITE_SETTINGS_TAG } from "@/lib/admin/settings-schema";

/** Cache tags for storefront CMS reads; admin saves revalidate the matching tag. */
export const CMS_TAGS = {
  settings: SITE_SETTINGS_TAG,
  navigation: "navigation",
  home: "page:home",
  pages: "pages",
  posts: "posts",
  workshops: "workshops",
  faq: "faq",
  redirects: "redirects",
} as const;
