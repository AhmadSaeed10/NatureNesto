import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { mediaUrl } from "@/lib/media";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { richTextSource } from "./rich-text";
import { CMS_TAGS } from "./tags";

// Published CMS content for the storefront. RLS returns only published rows to the anon
// key, so drafts never leak; results are cached per tag and revalidated by admin saves.

export interface CmsPage {
  handle: string;
  title: string;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export async function getPublishedPage(handle: string): Promise<CmsPage | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CMS_TAGS.pages, `${CMS_TAGS.pages}:${handle}`);
  const supabase = createSupabasePublicClient();
  if (!supabase || handle === "home") return null;
  const { data } = await supabase
    .from("pages")
    .select("handle, title, body, seo_title, seo_description")
    .eq("handle", handle)
    .maybeSingle();
  return data
    ? {
        handle: data.handle,
        title: data.title,
        body: richTextSource(data.body),
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
      }
    : null;
}

export interface PostSummary {
  handle: string;
  title: string;
  excerpt: string | null;
  cover: { src: string; alt: string } | null;
  publishedAt: string | null;
  tags: string[];
}

export interface Post extends PostSummary {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

type CoverRow = {
  external_url: string | null;
  storage_path: string | null;
  alt: string;
  decorative: boolean;
} | null;
const cover = (media: CoverRow) =>
  media ? { src: mediaUrl(media), alt: media.decorative ? "" : media.alt } : null;

export async function listPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CMS_TAGS.posts);
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "handle, title, excerpt, tags, published_at, media_assets (external_url, storage_path, alt, decorative)",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);
  return (data ?? []).map((row) => ({
    handle: row.handle,
    title: row.title,
    excerpt: row.excerpt,
    cover: cover(row.media_assets),
    publishedAt: row.published_at,
    tags: row.tags,
  }));
}

export async function getPost(handle: string): Promise<Post | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CMS_TAGS.posts, `${CMS_TAGS.posts}:${handle}`);
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "handle, title, excerpt, body, tags, published_at, seo_title, seo_description, media_assets (external_url, storage_path, alt, decorative)",
    )
    .eq("handle", handle)
    .maybeSingle();
  return data
    ? {
        handle: data.handle,
        title: data.title,
        excerpt: data.excerpt,
        body: richTextSource(data.body),
        cover: cover(data.media_assets),
        publishedAt: data.published_at,
        tags: data.tags,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
      }
    : null;
}

export interface Workshop {
  handle: string;
  title: string;
  summary: string | null;
  body: string;
  cover: { src: string; alt: string } | null;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  capacity: number | null;
  price: number | null;
}

export async function listWorkshops(): Promise<Workshop[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CMS_TAGS.workshops);
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("workshops")
    .select(
      "handle, title, summary, body, starts_at, ends_at, location, capacity, price, media_assets (external_url, storage_path, alt, decorative)",
    )
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(100);
  return (data ?? []).map((row) => ({
    handle: row.handle,
    title: row.title,
    summary: row.summary,
    body: richTextSource(row.body),
    cover: cover(row.media_assets),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    capacity: row.capacity,
    price: row.price,
  }));
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export async function listFaq(): Promise<FaqItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CMS_TAGS.faq);
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("faq_items")
    .select("id, question, answer, category, position")
    .order("position")
    .limit(200);
  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: richTextSource(row.answer),
    category: row.category,
  }));
}

export interface StoredRedirect {
  destination: string;
  permanent: boolean;
}

/** Redirects added in the admin. Build time ones from src/content still run first. */
export async function getRedirect(path: string): Promise<StoredRedirect | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CMS_TAGS.redirects);
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("redirects")
    .select("destination, permanent")
    .eq("source", path)
    .maybeSingle();
  return data;
}

/** Upcoming and past workshops, split when the cache fills (hourly and on every save). */
export async function getWorkshopGroups(): Promise<{ upcoming: Workshop[]; past: Workshop[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CMS_TAGS.workshops);
  const workshops = await listWorkshops();
  const now = Date.now();
  const isUpcoming = (w: Workshop) =>
    !w.startsAt || new Date(w.endsAt ?? w.startsAt).getTime() >= now;
  return {
    upcoming: workshops.filter(isUpcoming),
    past: workshops.filter((w) => !isUpcoming(w)).reverse(),
  };
}
