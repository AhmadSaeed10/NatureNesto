import { supabasePublicEnv } from "@/lib/supabase/env";

export const MEDIA_BUCKET = "media";

export interface MediaSource {
  external_url: string | null;
  storage_path: string | null;
}

/** Public URL for a media asset: a file served by the site, or an object in the bucket. */
export function mediaUrl(media: MediaSource): string {
  if (media.external_url) return media.external_url;
  const env = supabasePublicEnv();
  return env && media.storage_path
    ? `${env.url}/storage/v1/object/public/${MEDIA_BUCKET}/${media.storage_path}`
    : "";
}
