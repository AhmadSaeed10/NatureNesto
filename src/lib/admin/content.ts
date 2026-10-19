import "server-only";
import { richTextSource } from "@/lib/cms/rich-text";
import {
  HOME_SECTION_ORDER,
  type HomeSectionType,
  isHomeSectionType,
  parseSection,
  sectionFallbacks,
} from "@/lib/cms/sections";
import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ContentStatus = Enums<"content_status">;

export interface SectionSummary {
  type: HomeSectionType;
  visible: boolean;
  hasDraft: boolean;
  exists: boolean;
}

async function homeRows() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("page_sections")
    .select("type, data, status, page_section_drafts (data), pages!inner (handle)")
    .eq("pages.handle", "home");
  return (data ?? []).map((row) => ({
    type: row.type,
    data: row.data,
    status: row.status,
    draft: row.page_section_drafts?.data ?? null,
  }));
}

export async function listHomeSections(): Promise<SectionSummary[]> {
  const rows = await homeRows();
  return HOME_SECTION_ORDER.map((type) => {
    const row = rows.find((r) => r.type === type);
    return {
      type,
      visible: row?.status === "published",
      hasDraft: Boolean(row?.draft),
      exists: Boolean(row),
    };
  });
}

export interface SectionForEditor {
  type: HomeSectionType;
  /** What the form starts from: the draft if there is one, else the live data. */
  value: unknown;
  hasDraft: boolean;
  visible: boolean;
}

export async function getSectionForEditor(type: string): Promise<SectionForEditor | null> {
  if (!isHomeSectionType(type)) return null;
  const row = (await homeRows()).find((r) => r.type === type);
  const start = row?.draft ?? row?.data;
  return {
    type,
    // Anything unreadable starts from the shipped copy rather than an empty form.
    value: parseSection(type, start) ?? sectionFallbacks[type],
    hasDraft: Boolean(row?.draft),
    visible: row?.status === "published",
  };
}

/** Sections with drafts applied, for the staff only preview. */
export async function previewHomeRows(): Promise<{ type: string; data: unknown }[]> {
  const rows = await homeRows();
  return rows
    .filter((row) => row.status === "published")
    .map((row) => ({ type: row.type, data: row.draft ?? row.data }));
}

export interface DocSummary {
  id: string;
  title: string;
  handle: string;
  status: ContentStatus;
  date: string | null;
}

export async function listDocs(kind: "pages" | "blog" | "workshops"): Promise<DocSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (kind === "pages") {
    const { data } = await supabase
      .from("pages")
      .select("id, title, handle, status, updated_at")
      .neq("handle", "home")
      .order("title");
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      handle: row.handle,
      status: row.status,
      date: row.updated_at,
    }));
  }
  if (kind === "blog") {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, handle, status, published_at, updated_at")
      .order("updated_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      handle: row.handle,
      status: row.status,
      date: row.published_at ?? row.updated_at,
    }));
  }
  const { data } = await supabase
    .from("workshops")
    .select("id, title, handle, status, starts_at")
    .order("starts_at", { ascending: false, nullsFirst: true });
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    handle: row.handle,
    status: row.status,
    date: row.starts_at,
  }));
}

export interface PageForEditor {
  id: string;
  title: string;
  handle: string;
  body: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  version: string;
}

export async function getPageForEditor(id: string): Promise<PageForEditor | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .neq("handle", "home")
    .maybeSingle();
  return data
    ? {
        id: data.id,
        title: data.title,
        handle: data.handle,
        body: richTextSource(data.body),
        published: data.status === "published",
        seoTitle: data.seo_title ?? "",
        seoDescription: data.seo_description ?? "",
        version: data.updated_at,
      }
    : null;
}

export interface PostForEditor {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  coverId: string;
  tags: string[];
  body: string;
  published: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  version: string;
}

export async function getPostForEditor(id: string): Promise<PostForEditor | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return data
    ? {
        id: data.id,
        title: data.title,
        handle: data.handle,
        excerpt: data.excerpt ?? "",
        coverId: data.cover_media_id ?? "",
        tags: data.tags,
        body: richTextSource(data.body),
        published: data.status === "published",
        publishedAt: data.published_at ?? "",
        seoTitle: data.seo_title ?? "",
        seoDescription: data.seo_description ?? "",
        version: data.updated_at,
      }
    : null;
}

export interface WorkshopForEditor {
  id: string;
  title: string;
  handle: string;
  summary: string;
  coverId: string;
  body: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: string;
  price: number | null;
  published: boolean;
  version: string;
}

export async function getWorkshopForEditor(id: string): Promise<WorkshopForEditor | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("workshops").select("*").eq("id", id).maybeSingle();
  return data
    ? {
        id: data.id,
        title: data.title,
        handle: data.handle,
        summary: data.summary ?? "",
        coverId: data.cover_media_id ?? "",
        body: richTextSource(data.body),
        startsAt: data.starts_at ?? "",
        endsAt: data.ends_at ?? "",
        location: data.location ?? "",
        capacity: data.capacity === null ? "" : String(data.capacity),
        price: data.price,
        published: data.status === "published",
        version: data.updated_at,
      }
    : null;
}

export interface FaqForEditor {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  published: boolean;
}

export async function listFaqForEditor(): Promise<FaqForEditor[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .order("position")
    .order("created_at");
  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: richTextSource(row.answer),
    category: row.category ?? "",
    position: row.position,
    published: row.status === "published",
  }));
}

export interface MenuForEditor {
  id: string;
  handle: string;
  title: string;
  items: { label: string; href: string }[];
}

export async function listMenus(): Promise<MenuForEditor[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("navigation_menus")
    .select("id, handle, title, navigation_items (label, href, position)")
    .order("handle");
  // Header menus first, then the footer columns in their storefront order.
  const order = [
    "header",
    "header-cta",
    "footer-services",
    "footer-customer-services",
    "footer-explore",
  ];
  const rank = (handle: string) => (order.includes(handle) ? order.indexOf(handle) : order.length);
  return (data ?? [])
    .map((menu) => ({
      id: menu.id,
      handle: menu.handle,
      title: menu.title,
      items: [...menu.navigation_items]
        .sort((a, b) => a.position - b.position)
        .map(({ label, href }) => ({ label, href })),
    }))
    .sort((a, b) => rank(a.handle) - rank(b.handle));
}

export interface RedirectRow {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
}

export async function listRedirects(): Promise<RedirectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("redirects")
    .select("id, source, destination, permanent")
    .order("source");
  return data ?? [];
}
