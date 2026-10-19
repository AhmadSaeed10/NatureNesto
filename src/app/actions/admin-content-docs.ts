"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { RESERVED_HANDLES } from "@/lib/cms/reserved";
import { RICH_TEXT_MAX, toRichText } from "@/lib/cms/rich-text";
import { CMS_TAGS } from "@/lib/cms/tags";
import { HANDLE_PATTERN, toTag } from "@/lib/handle";
import { rupeesToPaisa } from "@/lib/money";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DocResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "invalid" | "handleTaken" | "handleReserved" | "forbidden" | "failed";
      fields?: string[];
    };

const handle = z.string().trim().max(100).regex(HANDLE_PATTERN);
// The editor converts datetime-local input (the browser's time zone) to ISO with Z.
const optionalDate = z.union([z.literal(""), z.iso.datetime({ offset: true })]);
const optionalUuid = z.union([z.literal(""), z.uuid()]);
const body = z.string().max(RICH_TEXT_MAX);
const seo = { seoTitle: z.string().trim().max(70), seoDescription: z.string().trim().max(170) };

const fields = (error: z.ZodError) => [
  ...new Set(error.issues.map((issue) => String(issue.path[0]))),
];
const toTimestamp = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function dbError(error: { code?: string; message: string }): DocResult {
  if (error.code === "23505") return { ok: false, error: "handleTaken" };
  if (error.code === "42501") return { ok: false, error: "forbidden" };
  console.error("[content] save failed", error.message);
  return { ok: false, error: "failed" };
}

// Pages -----------------------------------------------------------------------------------

const pageSchema = z.object({
  id: optionalUuid,
  title: z.string().trim().min(1).max(160),
  handle,
  body,
  published: z.boolean(),
  ...seo,
});
export type PageInput = z.input<typeof pageSchema>;

export async function savePage(input: PageInput): Promise<DocResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", fields: fields(parsed.error) };
  const value = parsed.data;
  // Pages render at /<handle>; a handle owned by a real route would never be reachable.
  if (RESERVED_HANDLES.has(value.handle)) return { ok: false, error: "handleReserved" };

  const row = {
    title: value.title,
    handle: value.handle,
    body: toRichText(value.body) as unknown as Json,
    status: value.published ? ("published" as const) : ("draft" as const),
    published_at: value.published ? new Date().toISOString() : null,
    seo_title: value.seoTitle || null,
    seo_description: value.seoDescription || null,
  };
  const supabase = await createSupabaseServerClient();
  const { data, error } = value.id
    ? await supabase
        .from("pages")
        .update(row)
        .eq("id", value.id)
        .neq("handle", "home")
        .select("id")
        .single()
    : await supabase.from("pages").insert(row).select("id").single();
  if (error) return dbError(error);
  revalidateTag(CMS_TAGS.pages, "max");
  revalidatePath("/admin/content/pages");
  return { ok: true, id: data.id };
}

// Blog posts -----------------------------------------------------------------------------

const postSchema = z.object({
  id: optionalUuid,
  title: z.string().trim().min(1).max(160),
  handle,
  excerpt: z.string().trim().max(300),
  coverId: optionalUuid,
  tags: z.array(z.string()).max(20),
  body,
  published: z.boolean(),
  publishedAt: optionalDate,
  ...seo,
});
export type PostInput = z.input<typeof postSchema>;

export async function savePost(input: PostInput): Promise<DocResult> {
  const staff = await staffWithRole(ACCESS.content);
  if (!staff) return { ok: false, error: "forbidden" };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", fields: fields(parsed.error) };
  const value = parsed.data;

  const row = {
    title: value.title,
    handle: value.handle,
    excerpt: value.excerpt || null,
    cover_media_id: value.coverId || null,
    tags: [...new Set(value.tags.map(toTag).filter(Boolean))],
    body: toRichText(value.body) as unknown as Json,
    status: value.published ? ("published" as const) : ("draft" as const),
    // A future date schedules the post: RLS hides it until then.
    published_at: value.published
      ? (toTimestamp(value.publishedAt) ?? new Date().toISOString())
      : toTimestamp(value.publishedAt),
    seo_title: value.seoTitle || null,
    seo_description: value.seoDescription || null,
  };
  const supabase = await createSupabaseServerClient();
  const { data, error } = value.id
    ? await supabase.from("blog_posts").update(row).eq("id", value.id).select("id").single()
    : await supabase
        .from("blog_posts")
        .insert({ ...row, author_id: staff.id })
        .select("id")
        .single();
  if (error) return dbError(error);
  revalidateTag(CMS_TAGS.posts, "max");
  revalidatePath("/admin/content/blog");
  return { ok: true, id: data.id };
}

// Workshops ------------------------------------------------------------------------------

const workshopSchema = z
  .object({
    id: optionalUuid,
    title: z.string().trim().min(1).max(160),
    handle,
    summary: z.string().trim().max(300),
    coverId: optionalUuid,
    body,
    startsAt: optionalDate,
    endsAt: optionalDate,
    location: z.string().trim().max(200),
    capacity: z.union([z.literal(""), z.coerce.number().int().min(1).max(10_000)]),
    price: z.string().trim().max(20),
    published: z.boolean(),
  })
  .refine((v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) >= new Date(v.startsAt), {
    path: ["endsAt"],
  })
  .refine((v) => v.price === "" || rupeesToPaisa(v.price) !== null, { path: ["price"] });
export type WorkshopInput = z.input<typeof workshopSchema>;

export async function saveWorkshop(input: WorkshopInput): Promise<DocResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  const parsed = workshopSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", fields: fields(parsed.error) };
  const value = parsed.data;

  const row = {
    title: value.title,
    handle: value.handle,
    summary: value.summary || null,
    cover_media_id: value.coverId || null,
    body: toRichText(value.body) as unknown as Json,
    starts_at: toTimestamp(value.startsAt),
    ends_at: toTimestamp(value.endsAt),
    location: value.location || null,
    capacity: value.capacity === "" ? null : value.capacity,
    price: value.price === "" ? null : rupeesToPaisa(value.price),
    status: value.published ? ("published" as const) : ("draft" as const),
    published_at: value.published ? new Date().toISOString() : null,
  };
  const supabase = await createSupabaseServerClient();
  const { data, error } = value.id
    ? await supabase.from("workshops").update(row).eq("id", value.id).select("id").single()
    : await supabase.from("workshops").insert(row).select("id").single();
  if (error) return dbError(error);
  revalidateTag(CMS_TAGS.workshops, "max");
  revalidatePath("/admin/content/workshops");
  return { ok: true, id: data.id };
}

// FAQ ------------------------------------------------------------------------------------

const faqSchema = z.object({
  id: optionalUuid,
  question: z.string().trim().min(1).max(300),
  answer: body.refine((value) => value.trim().length > 0),
  category: z.string().trim().max(80),
  position: z.coerce.number().int().min(0).max(10_000),
  published: z.boolean(),
});
export type FaqInput = z.input<typeof faqSchema>;

export async function saveFaq(input: FaqInput): Promise<DocResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", fields: fields(parsed.error) };
  const value = parsed.data;
  const row = {
    question: value.question,
    answer: toRichText(value.answer) as unknown as Json,
    category: value.category || null,
    position: value.position,
    status: value.published ? ("published" as const) : ("draft" as const),
  };
  const supabase = await createSupabaseServerClient();
  const { data, error } = value.id
    ? await supabase.from("faq_items").update(row).eq("id", value.id).select("id").single()
    : await supabase.from("faq_items").insert(row).select("id").single();
  if (error) return dbError(error);
  revalidateTag(CMS_TAGS.faq, "max");
  revalidatePath("/admin/content/faq");
  return { ok: true, id: data.id };
}

// Delete ---------------------------------------------------------------------------------

const TABLES = {
  pages: { table: "pages", tag: CMS_TAGS.pages },
  blog: { table: "blog_posts", tag: CMS_TAGS.posts },
  workshops: { table: "workshops", tag: CMS_TAGS.workshops },
  faq: { table: "faq_items", tag: CMS_TAGS.faq },
} as const;
export type DocKind = keyof typeof TABLES;

export async function deleteDoc(kind: DocKind, id: string): Promise<{ ok: boolean }> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false };
  const target = TABLES[kind];
  const parsed = z.uuid().safeParse(id);
  if (!target || !parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  // The homepage record holds the section blocks and is never deleted from here.
  const { error } =
    kind === "pages"
      ? await supabase.from("pages").delete().eq("id", parsed.data).neq("handle", "home")
      : await supabase.from(target.table).delete().eq("id", parsed.data);
  if (error) return { ok: false };
  revalidateTag(target.tag, "max");
  revalidatePath(`/admin/content/${kind}`);
  return { ok: true };
}
