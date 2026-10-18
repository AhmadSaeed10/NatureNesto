import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connection } from "next/server";
import type { Enums } from "@/lib/supabase/database.types";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_HOME, ADMIN_LOGIN } from "./paths";

export type StaffRole = Enums<"staff_role">;

export interface StaffMember {
  id: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
}

/** The signed-in staff member, deduplicated per request. */
export const getStaff = cache(async (): Promise<StaffMember | null> => {
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
});

/**
 * Server-side role gate for admin layouts, pages and actions. RLS is still the final guard;
 * this keeps non-staff from seeing the admin at all.
 */
export async function requireStaff(roles?: readonly StaffRole[]): Promise<StaffMember> {
  const staff = await getStaff();
  if (!staff) redirect(`${ADMIN_LOGIN}?error=not-staff`);
  // Staff without access to this area go back to the admin home rather than to login.
  if (roles && !roles.includes(staff.role)) redirect(ADMIN_HOME);
  return staff;
}

/** For server actions: the caller if they hold one of the roles, otherwise null. */
export async function staffWithRole(roles: readonly StaffRole[]): Promise<StaffMember | null> {
  const staff = await getStaff();
  return staff && roles.includes(staff.role) ? staff : null;
}

/** Who may use each admin area. RLS enforces the same split on the data itself. */
export const ACCESS = {
  media: ["owner", "admin", "editor"],
  catalog: ["owner", "admin", "editor"],
  storeSettings: ["owner", "admin"],
  staff: ["owner", "admin"],
} as const satisfies Record<string, readonly StaffRole[]>;

export const canAccess = (role: StaffRole, area: keyof typeof ACCESS): boolean =>
  (ACCESS[area] as readonly StaffRole[]).includes(role);
