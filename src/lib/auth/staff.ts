import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Enums } from "@/lib/supabase/database.types";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_LOGIN } from "./paths";

export type StaffRole = Enums<"staff_role">;

export interface StaffMember {
  id: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
}

/** The signed-in staff member, or null for visitors and signed-in non-staff accounts. */
export async function getStaff(): Promise<StaffMember | null> {
  // Always per request: without this, a build with no Supabase env would prerender the
  // signed-out redirect into a static page.
  await connection();
  if (!supabasePublicEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.role) return null;

  return { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role };
}

/**
 * Server-side role gate for admin layouts, pages and actions. RLS is still the final guard;
 * this keeps non-staff from seeing the admin at all.
 */
export async function requireStaff(roles?: readonly StaffRole[]): Promise<StaffMember> {
  const staff = await getStaff();
  if (!staff) redirect(`${ADMIN_LOGIN}?error=not-staff`);
  if (roles && !roles.includes(staff.role)) redirect(`${ADMIN_LOGIN}?error=not-staff`);
  return staff;
}
