/**
 * Shared content types. Any field named `flag` marks an open item that needs client
 * confirmation before launch. List them with: grep -rn "flag:" src/content
 */

export interface NavLink {
  label: string;
  href: string;
  flag?: string;
}

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "twitter";

export interface SocialLink extends NavLink {
  platform: SocialPlatform;
}

export type Cta = NavLink;

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export interface Service {
  slug: string;
  title: string;
  href: string;
  /** Path on the current live site, kept for 308 redirects. */
  legacyPath: string;
  icon: IconName;
  /** Styling only: receives the section's one botanical frame. */
  featured?: boolean;
}

export interface ImageAsset {
  src: string;
  /** Empty when the image is decorative (for example, a linked tile already named by its label). */
  alt: string;
  flag?: string;
}

export interface Category {
  slug: string;
  title: string;
  href: string;
  image: ImageAsset;
}

export interface Step {
  number: string;
  title: string;
  body: string;
  flag?: string;
}

export type IconName =
  | "plant"
  | "vase"
  | "table"
  | "guidance"
  | "community"
  | "support"
  | "floorplan"
  | "leaf"
  | "poster"
  | "gift"
  | "pot"
  | "building";

export interface IconItem {
  text: string;
  icon: IconName;
}

export interface ValueProp {
  title: string;
  body: string;
  icon: IconName;
}

export type ContactKind = "whatsapp" | "call" | "email";

export interface ContactChannel {
  kind: ContactKind;
  label: string;
  prompt: string;
  display: string;
  href: string;
  flag?: string;
}

export interface Redirect {
  source: string;
  destination: string;
  permanent: true;
}

export interface StubPageContent {
  path: string;
  title: string;
  todo: string;
}
