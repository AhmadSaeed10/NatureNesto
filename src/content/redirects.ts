import { services } from "./services";
import type { Redirect } from "./types";

// Old live site URLs mapped to clean slugs, for SEO continuity once this build serves
// naturenesto.com. Imported by next.config.ts, so keep relative imports only.
const permanent = (source: string, destination: string): Redirect => ({
  source,
  destination,
  permanent: true,
});

export const redirects: Redirect[] = [
  ...services.map(({ legacyPath, href }) => permanent(legacyPath, href)),
  permanent("/premium-plants-pots-and-planters", "/pots-and-planters"),
  permanent("/premium-plants-indoor-plants", "/indoor-plants"),
  permanent("/premium-plants-outdoor-plants", "/outdoor-plants"),
  permanent("/premium-plants-contact", "/contact"),
  permanent("/plant-styling-faq-faq", "/faq"),
  permanent("/plants-about-us", "/about"),
  permanent("/plants-work-place-policy", "/workplace-policy"),
];
