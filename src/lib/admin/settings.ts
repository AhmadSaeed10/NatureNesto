import "server-only";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  SOCIAL_PLATFORMS,
  type SettingsSection,
  announcementSchema,
  phonesSchema,
  seoSchema,
  socialsSchema,
} from "./settings-schema";

export type SettingsRow = Tables<"site_settings">;

export async function loadSettingsRow(): Promise<SettingsRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  return data;
}

/** Current values per form section, flattened to the form field names. */
export function settingsFormValues(
  row: SettingsRow | null,
): Record<SettingsSection, Record<string, string | boolean>> {
  const phones = phonesSchema.parse(row?.phones ?? {});
  const announcement = announcementSchema.parse(row?.announcement ?? {});
  const socials = socialsSchema.parse(row?.socials ?? []);
  const seo = seoSchema.parse(row?.seo ?? {});
  const hrefFor = (platform: string): string => {
    const href = socials.find((social) => social.platform === platform)?.href ?? "";
    return href === "#" ? "" : href;
  };

  return {
    details: {
      storeName: row?.store_name ?? "",
      email: row?.email ?? "",
      address: row?.address ?? "",
      legal: row?.legal ?? "",
    },
    contact: {
      whatsappDisplay: phones.whatsapp.display,
      whatsappE164: phones.whatsapp.e164,
      callDisplay: phones.call.display,
      callE164: phones.call.e164,
    },
    announcement: { message: announcement.message, enabled: announcement.enabled },
    socials: Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [platform, hrefFor(platform)])),
    seo: {
      homeTitle: seo.home.title,
      homeDescription: seo.home.description,
      ogAlt: seo.ogImage.alt,
    },
    logo: { logoMediaId: row?.logo_media_id ?? "" },
  };
}
