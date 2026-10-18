import "server-only";
import { MEDIA_PAGE_SIZE } from "@/lib/media-rules";
import { mediaUrl } from "@/lib/media";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  alt: string;
  decorative: boolean;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  isExternal: boolean;
  uses: number;
}

export interface MediaPage {
  items: MediaItem[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * Search terms keep letters, numbers, spaces and simple punctuation only. That rules out
 * LIKE wildcards and the characters PostgREST filter syntax treats specially.
 */
export const cleanSearch = (value: string): string =>
  value
    .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

export async function listMedia({
  query,
  page,
}: {
  query: string;
  page: number;
}): Promise<MediaPage> {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * MEDIA_PAGE_SIZE;

  let request = supabase
    .from("media_assets")
    .select("id, external_url, storage_path, title, alt, decorative, width, height, mime_type", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + MEDIA_PAGE_SIZE - 1);
  const term = cleanSearch(query);
  if (term) request = request.or(`title.ilike."%${term}%",alt.ilike."%${term}%"`);

  const { data, count, error } = await request;
  if (error) throw new Error(`Could not load media: ${error.message}`);

  const ids = data.map((row) => row.id);
  const { data: usage } = ids.length
    ? await supabase.rpc("media_usage", { p_media_ids: ids })
    : { data: [] };
  const usesById = new Map((usage ?? []).map((row) => [row.media_id, Number(row.uses)]));

  const total = count ?? 0;
  return {
    items: data.map((row) => ({
      id: row.id,
      url: mediaUrl(row),
      title: row.title,
      alt: row.alt,
      decorative: row.decorative,
      width: row.width,
      height: row.height,
      mimeType: row.mime_type,
      isExternal: row.external_url !== null,
      uses: usesById.get(row.id) ?? 0,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE)),
  };
}

/** Lightweight list for pickers (logo, covers): newest first, images with a usable URL. */
export async function listMediaOptions(): Promise<{ id: string; label: string }[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, title, alt, storage_path, external_url")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.title || row.alt || row.storage_path || row.external_url || row.id,
  }));
}
