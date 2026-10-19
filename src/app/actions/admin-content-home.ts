"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import {
  HOME_SECTION_ORDER,
  type HomeSectionType,
  isHomeSectionType,
  sectionSchemas,
} from "@/lib/cms/sections";
import { CMS_TAGS } from "@/lib/cms/tags";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SectionResult =
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "failed"; paths?: string[] };

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function homePageId(supabase: ServerClient): Promise<string | null> {
  const { data } = await supabase.from("pages").select("id").eq("handle", "home").maybeSingle();
  return data?.id ?? null;
}

async function sectionRow(supabase: ServerClient, type: HomeSectionType) {
  const pageId = await homePageId(supabase);
  if (!pageId) return null;
  const { data } = await supabase
    .from("page_sections")
    .select("id, status, page_section_drafts (data)")
    .eq("page_id", pageId)
    .eq("type", type)
    .maybeSingle();
  return {
    pageId,
    row: data
      ? { id: data.id, status: data.status, draft: data.page_section_drafts?.data ?? null }
      : null,
  };
}

function refresh(type: HomeSectionType) {
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/home/${type}`);
}

/** Saves edits as a draft; the live homepage keeps showing the published data. */
export async function saveSectionDraft(type: string, data: unknown): Promise<SectionResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  if (!isHomeSectionType(type)) return { ok: false, error: "invalid" };
  const parsed = sectionSchemas[type].safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      paths: parsed.error.issues.map((issue) => issue.path.join(".")),
    };
  }

  const supabase = await createSupabaseServerClient();
  const found = await sectionRow(supabase, type);
  if (!found) return { ok: false, error: "failed" };
  const draft = parsed.data as unknown as Json;
  let sectionId = found.row?.id;
  if (!sectionId) {
    // A section missing from the seed starts hidden, with the draft as its data.
    const created = await supabase
      .from("page_sections")
      .insert({
        page_id: found.pageId,
        type,
        position: HOME_SECTION_ORDER.indexOf(type),
        data: draft,
        status: "draft",
      })
      .select("id")
      .single();
    if (created.error)
      return { ok: false, error: created.error.code === "42501" ? "forbidden" : "failed" };
    sectionId = created.data.id;
  }
  const { error } = await supabase
    .from("page_section_drafts")
    .upsert({ section_id: sectionId, data: draft }, { onConflict: "section_id" });
  if (error) {
    console.error("[content] draft save failed", error.message);
    return { ok: false, error: error.code === "42501" ? "forbidden" : "failed" };
  }
  refresh(type);
  return { ok: true };
}

const typeSchema = z.string().refine(isHomeSectionType);

export async function publishSection(type: string): Promise<SectionResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  if (!typeSchema.safeParse(type).success || !isHomeSectionType(type))
    return { ok: false, error: "invalid" };
  const supabase = await createSupabaseServerClient();
  const found = await sectionRow(supabase, type);
  if (!found?.row?.draft) return { ok: false, error: "invalid" };
  // Re-validate on publish: the schema may have tightened since the draft was saved.
  if (!sectionSchemas[type].safeParse(found.row.draft).success)
    return { ok: false, error: "invalid" };

  const { error } = await supabase
    .from("page_sections")
    .update({ data: found.row.draft })
    .eq("id", found.row.id);
  if (error) return { ok: false, error: "failed" };
  // Clearing the draft is cosmetic once data holds it; a failure leaves a harmless copy.
  await supabase.from("page_section_drafts").delete().eq("section_id", found.row.id);
  revalidateTag(CMS_TAGS.home, "max");
  refresh(type);
  return { ok: true };
}

export async function discardSectionDraft(type: string): Promise<SectionResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  if (!isHomeSectionType(type)) return { ok: false, error: "invalid" };
  const supabase = await createSupabaseServerClient();
  const found = await sectionRow(supabase, type);
  if (!found?.row) return { ok: false, error: "invalid" };
  const { error } = await supabase
    .from("page_section_drafts")
    .delete()
    .eq("section_id", found.row.id);
  if (error) return { ok: false, error: "failed" };
  refresh(type);
  return { ok: true };
}

/** Hidden sections keep status draft, which the public cannot read. */
export async function setSectionVisible(type: string, visible: boolean): Promise<SectionResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  if (!isHomeSectionType(type)) return { ok: false, error: "invalid" };
  const supabase = await createSupabaseServerClient();
  const found = await sectionRow(supabase, type);
  if (!found?.row) return { ok: false, error: "invalid" };
  const { error } = await supabase
    .from("page_sections")
    .update({ status: visible ? "published" : "draft" })
    .eq("id", found.row.id);
  if (error) return { ok: false, error: "failed" };
  revalidateTag(CMS_TAGS.home, "max");
  refresh(type);
  return { ok: true };
}
