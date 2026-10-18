"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { MEDIA_BUCKET } from "@/lib/media";
import { MEDIA_MAX_BYTES, MEDIA_TEXT_MAX, MEDIA_TYPES } from "@/lib/media-rules";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MediaActionResult =
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "in_use" | "failed" };

const MEDIA_PATH = "/admin/media";

// Alt text is required unless the image is decorative, matching the database constraint.
const details = z
  .object({
    title: z.string().trim().max(MEDIA_TEXT_MAX).optional(),
    alt: z.string().trim().max(MEDIA_TEXT_MAX),
    decorative: z.boolean(),
  })
  .refine((value) => value.decorative || value.alt.length > 0, { path: ["alt"] });

const createSchema = details.and(
  z.object({
    // Objects are written by the uploader under year/month/uuid.ext.
    storagePath: z.string().regex(/^\d{4}\/\d{2}\/[0-9a-f-]{36}\.(avif|webp|png|jpg|gif)$/),
    mimeType: z.enum(MEDIA_TYPES),
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(20000),
    sizeBytes: z.number().int().positive().max(MEDIA_MAX_BYTES),
  }),
);

export type CreateMediaInput = z.input<typeof createSchema>;

/** Records an image the browser has already uploaded to the bucket under the staff session. */
export async function createMediaAsset(input: CreateMediaInput): Promise<MediaActionResult> {
  if (!(await staffWithRole(ACCESS.media))) return { ok: false, error: "forbidden" };
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const value = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_assets").insert({
    storage_path: value.storagePath,
    mime_type: value.mimeType,
    width: value.width,
    height: value.height,
    size_bytes: value.sizeBytes,
    title: value.title || null,
    alt: value.decorative ? "" : value.alt,
    decorative: value.decorative,
  });
  if (error) {
    console.error("[media] insert failed", error.message);
    // Do not leave an orphaned file behind.
    await supabase.storage.from(MEDIA_BUCKET).remove([value.storagePath]);
    return { ok: false, error: "failed" };
  }
  revalidatePath(MEDIA_PATH);
  return { ok: true };
}

const updateSchema = details.and(z.object({ id: z.uuid() }));

export async function updateMediaAsset(
  _previous: MediaActionResult | null,
  formData: FormData,
): Promise<MediaActionResult> {
  if (!(await staffWithRole(ACCESS.media))) return { ok: false, error: "forbidden" };
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title") ?? undefined,
    alt: formData.get("alt") ?? "",
    decorative: formData.get("decorative") === "on",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { id, title, alt, decorative } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ title: title || null, alt: decorative ? "" : alt, decorative })
    .eq("id", id);
  if (error) return { ok: false, error: "failed" };
  revalidatePath(MEDIA_PATH);
  return { ok: true };
}

export async function deleteMediaAsset(id: string): Promise<MediaActionResult> {
  if (!(await staffWithRole(ACCESS.media))) return { ok: false, error: "forbidden" };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = await createSupabaseServerClient();
  const [{ data: usage }, { data: asset }] = await Promise.all([
    supabase.rpc("media_usage", { p_media_ids: [parsed.data] }),
    supabase.from("media_assets").select("storage_path").eq("id", parsed.data).maybeSingle(),
  ]);
  if (!asset) return { ok: false, error: "failed" };
  if (Number(usage?.[0]?.uses ?? 0) > 0) return { ok: false, error: "in_use" };

  const { error } = await supabase.from("media_assets").delete().eq("id", parsed.data);
  // A foreign key still guards against a reference added since the check.
  if (error) return { ok: false, error: error.code === "23503" ? "in_use" : "failed" };
  if (asset.storage_path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
  }
  revalidatePath(MEDIA_PATH);
  return { ok: true };
}
