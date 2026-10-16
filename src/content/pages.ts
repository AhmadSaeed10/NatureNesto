import { categories } from "./categories";
import { services } from "./services";
import type { StubPageContent } from "./types";

// Inner page content has not been supplied. Titles come from link labels.
const stub = (path: string, title: string): StubPageContent => ({
  path,
  title,
  todo: `TODO: ${title} content to be supplied by the client.`,
});

export const stubPages: StubPageContent[] = [
  stub("/pots-and-planters", "Pots & Planters"),
  ...categories.map(({ href, title }) => stub(href, title)),
  stub("/services", "Services"),
  ...services.map(({ href, title }) => stub(href, title)),
  stub("/consultation", "Book a Consultation"),
  stub("/contact", "Contact"),
  stub("/faq", "FAQ"),
  stub("/shipping", "Shipping & Handling"),
  stub("/about", "About Us"),
  stub("/workplace-policy", "Work Place Policy"),
  stub("/our-story", "Our Story"),
  stub("/careers", "Career"),
  stub("/workshops", "Workshops"),
  stub("/blogs", "Blogs"),
];
