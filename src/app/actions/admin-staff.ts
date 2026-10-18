"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACCESS, type StaffRole, staffWithRole } from "@/lib/auth/staff";
import { Constants } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface StaffActionState {
  status: "idle" | "done" | "invalid" | "exists" | "forbidden" | "last_owner" | "failed";
}

const STAFF_PATH = "/admin/settings/staff";
const role = z.enum(Constants.public.Enums.staff_role);

/** Admins manage everyone except owners; only owners grant or change the owner role. */
const mayAssign = (actor: StaffRole, target: StaffRole): boolean =>
  actor === "owner" || target !== "owner";

async function ownerCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  return count ?? 0;
}

export async function inviteStaff(
  _previous: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const actor = await staffWithRole(ACCESS.staff);
  if (!actor) return { status: "forbidden" };
  const parsed = z
    .object({
      email: z
        .email()
        .max(320)
        .transform((v) => v.trim().toLowerCase()),
      role,
    })
    .safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { status: "invalid" };
  if (!mayAssign(actor.role, parsed.data.role)) return { status: "forbidden" };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .not("role", "is", null)
    .maybeSingle();
  if (existing) return { status: "exists" };

  const { error } = await supabase.from("staff_invites").insert(parsed.data);
  if (error) return { status: error.code === "23505" ? "exists" : "failed" };
  revalidatePath(STAFF_PATH);
  return { status: "done" };
}

const memberSchema = z.object({
  id: z.uuid(),
  // Empty means "remove access".
  role: z.union([z.literal(""), role]),
});

export async function updateStaffRole(
  _previous: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const actor = await staffWithRole(ACCESS.staff);
  if (!actor) return { status: "forbidden" };
  const parsed = memberSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role") ?? "",
  });
  if (!parsed.success) return { status: "invalid" };
  const nextRole = parsed.data.role || null;

  const supabase = await createSupabaseServerClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!member?.role) return { status: "invalid" };
  if (!mayAssign(actor.role, member.role) || (nextRole && !mayAssign(actor.role, nextRole))) {
    return { status: "forbidden" };
  }
  if (member.role === "owner" && nextRole !== "owner" && (await ownerCount()) <= 1) {
    return { status: "last_owner" };
  }

  // The guard_profile_role trigger re-checks these rules in the database.
  const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", member.id);
  if (error) return { status: error.code === "42501" ? "forbidden" : "failed" };

  if (!nextRole) {
    // Clear the invite too, so signing in again cannot restore the old role.
    await supabase.from("staff_invites").delete().eq("email", member.email.toLowerCase());
  }
  revalidatePath(STAFF_PATH);
  return { status: "done" };
}

export async function revokeInvite(
  _previous: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const actor = await staffWithRole(ACCESS.staff);
  if (!actor) return { status: "forbidden" };
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { data: invite } = await supabase
    .from("staff_invites")
    .select("id, role, accepted_at")
    .eq("id", id.data)
    .maybeSingle();
  if (!invite || invite.accepted_at) return { status: "invalid" };
  if (!mayAssign(actor.role, invite.role)) return { status: "forbidden" };

  const { error } = await supabase.from("staff_invites").delete().eq("id", invite.id);
  if (error) return { status: "failed" };
  revalidatePath(STAFF_PATH);
  return { status: "done" };
}
