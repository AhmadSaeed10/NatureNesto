import { z } from "zod";

/** Cache tag the storefront will read site settings under (Stage D). */
export const SITE_SETTINGS_TAG = "site-settings";

// Shapes of the jsonb columns in site_settings. Parsing is lenient (defaults, unknown keys
// kept) because review flags from the seed live alongside the values.
const text = z.string().default("");

export const phonesSchema = z.looseObject({
  whatsapp: z.looseObject({ display: text, e164: text }).default({ display: "", e164: "" }),
  call: z.looseObject({ display: text, e164: text }).default({ display: "", e164: "" }),
});

export const announcementSchema = z.looseObject({
  message: text,
  enabled: z.boolean().default(true),
});

export const SOCIAL_PLATFORMS = ["facebook", "instagram", "linkedin", "twitter"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const socialsSchema = z
  .array(z.looseObject({ platform: z.string(), label: text, href: text }))
  .default([]);

export const seoSchema = z.looseObject({
  home: z.looseObject({ title: text, description: text }).default({ title: "", description: "" }),
  ogImage: z.looseObject({ alt: text }).default({ alt: "" }),
});

// Form input rules ------------------------------------------------------------------------
const required = (max: number) => z.string().trim().min(1).max(max);
const e164 = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/);
// Social links are full https addresses, or empty to keep the placeholder.
const socialHref = z.union([z.literal(""), z.url({ protocol: /^https$/ }).max(300)]);

export const settingsSections = {
  details: z.object({
    storeName: required(80),
    email: z.email().max(320),
    address: required(300),
    legal: z.string().trim().max(200),
  }),
  contact: z.object({
    whatsappDisplay: required(40),
    whatsappE164: e164,
    callDisplay: required(40),
    callE164: e164,
  }),
  announcement: z.object({
    message: z.string().trim().max(160),
    enabled: z.boolean(),
  }),
  socials: z.object(
    Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [platform, socialHref])) as Record<
      SocialPlatform,
      typeof socialHref
    >,
  ),
  seo: z.object({
    homeTitle: required(70),
    homeDescription: required(170),
    ogAlt: required(200),
  }),
  logo: z.object({ logoMediaId: z.union([z.literal(""), z.uuid()]) }),
} as const;

export type SettingsSection = keyof typeof settingsSections;
export const isSettingsSection = (value: unknown): value is SettingsSection =>
  typeof value === "string" && value in settingsSections;
