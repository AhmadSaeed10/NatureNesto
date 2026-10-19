"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { href } from "@/lib/cms/sections";
import { CMS_TAGS } from "@/lib/cms/tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Navigation ------------------------------------------------------------------------------

const menuSchema = z.object({
  menuId: z.uuid(),
  items: z.array(z.object({ label: z.string().trim().min(1).max(60), href })).max(30),
});
export type MenuInput = z.input<typeof menuSchema>;

export type MenuResult =
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "failed"; index?: number };

/** Replaces a menu's links with the given ordered list. */
export async function saveMenu(input: MenuInput): Promise<MenuResult> {
  if (!(await staffWithRole(ACCESS.content))) return { ok: false, error: "forbidden" };
  const parsed = menuSchema.safeParse(input);
  if (!parsed.success) {
    const index = parsed.error.issues.find((issue) => issue.path[0] === "items")?.path[1];
    return { ok: false, error: "invalid", index: typeof index === "number" ? index : undefined };
  }
  const { menuId, items } = parsed.data;

  const supabase = await createSupabaseServerClient();
  // Insert the new list first, then remove the old rows, so a failure never empties a menu.
  const { data: previous, error: readError } = await supabase
    .from("navigation_items")
    .select("id")
    .eq("menu_id", menuId);
  if (readError) return { ok: false, error: "failed" };
  if (items.length) {
    const { error } = await supabase.from("navigation_items").insert(
      items.map((item, position) => ({
        menu_id: menuId,
        label: item.label,
        href: item.href,
        position,
      })),
    );
    if (error) return { ok: false, error: error.code === "42501" ? "forbidden" : "failed" };
  }
  const oldIds = (previous ?? []).map((row) => row.id);
  if (oldIds.length) {
    const { error } = await supabase.from("navigation_items").delete().in("id", oldIds);
    if (error) return { ok: false, error: "failed" };
  }
  revalidateTag(CMS_TAGS.navigation, "max");
  revalidatePath("/admin/content/navigation");
  return { ok: true };
}

// Redirects (owners and admins) -----------------------------------------------------------

export interface RedirectState {
  status: "idle" | "done" | "invalid" | "taken" | "forbidden" | "failed";
}

const redirectSchema = z.object({
  source: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/[^\s?#]*$/)
    .refine((value) => !value.startsWith("/admin") && !value.startsWith("/auth")),
  destination: z
    .string()
    .trim()
    .max(500)
    .regex(/^(\/(?!\/)|https:\/\/)/),
  permanent: z.boolean(),
});

export async function addRedirect(
  _previous: RedirectState,
  formData: FormData,
): Promise<RedirectState> {
  if (!(await staffWithRole(ACCESS.redirects))) return { status: "forbidden" };
  const parsed = redirectSchema.safeParse({
    source: formData.get("source"),
    destination: formData.get("destination"),
    permanent: formData.get("permanent") === "on",
  });
  if (!parsed.success || parsed.data.source === parsed.data.destination)
    return { status: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("redirects").insert(parsed.data);
  if (error)
    return {
      status: error.code === "23505" ? "taken" : error.code === "42501" ? "forbidden" : "failed",
    };
  revalidateTag(CMS_TAGS.redirects, "max");
  revalidatePath("/admin/content/redirects");
  return { status: "done" };
}

export async function deleteRedirect(id: string): Promise<{ ok: boolean }> {
  if (!(await staffWithRole(ACCESS.redirects))) return { ok: false };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("redirects").delete().eq("id", parsed.data);
  if (error) return { ok: false };
  revalidateTag(CMS_TAGS.redirects, "max");
  revalidatePath("/admin/content/redirects");
  return { ok: true };
}
