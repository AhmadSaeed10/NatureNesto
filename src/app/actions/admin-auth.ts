"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_LOGIN, AUTH_CALLBACK, safeAdminNext } from "@/lib/auth/paths";
import { getStaff } from "@/lib/auth/staff";
import { RATE_LIMITS, clientIp, withinRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginError = "email" | "credentials" | "rateLimited" | "notConfigured" | "notStaff";

export interface LoginState {
  status: "idle" | "error" | "link_sent";
  error?: LoginError;
  email?: string;
}

const loginSchema = z.object({
  email: z
    .email()
    .max(320)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().max(200).optional(),
  next: z.string().max(500).optional(),
});

async function siteOrigin(): Promise<string> {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  const proto = list.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
}

/**
 * Staff-only access: an email can sign in only if it has a pending invite or a profile with
 * a role. The account is created here with the service role on first sign in, so public
 * sign ups can stay disabled in Supabase Auth.
 */
async function ensureStaffAccount(email: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  // Case-insensitive exact match: escape the LIKE wildcards that are legal in emails.
  const pattern = email.replace(/[\\%_]/g, "\\$&");
  const [{ data: invite }, { data: profile }] = await Promise.all([
    supabase.from("staff_invites").select("id, role").ilike("email", pattern).maybeSingle(),
    supabase.from("profiles").select("id, role").ilike("email", pattern).maybeSingle(),
  ]);
  if (profile?.role) return true;
  if (!invite) return false;

  if (profile) {
    // An existing non-staff account (for example a customer) that was invited later: the
    // invite trigger only runs when an account is created, so the role is applied here.
    const { error } = await supabase
      .from("profiles")
      .update({ role: invite.role })
      .eq("id", profile.id);
    if (error) {
      console.error("[admin-auth] could not apply invite", error.message);
      return false;
    }
    await supabase
      .from("staff_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    return true;
  }

  const { error } = await supabase.auth.admin.createUser({ email, email_confirm: true });
  if (error) {
    console.error("[admin-auth] could not create staff user", error.message);
    return false;
  }
  return true;
}

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabasePublicEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { status: "error", error: "notConfigured" };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { status: "error", error: "email" };
  const { email, password, next } = parsed.data;

  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    withinRateLimit(RATE_LIMITS.login, ip),
    withinRateLimit(RATE_LIMITS.loginEmail, email),
  ]);
  if (!ipOk || !emailOk) return { status: "error", error: "rateLimited", email };

  const supabase = await createSupabaseServerClient();

  if (password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { status: "error", error: "credentials", email };
    if (!(await getStaff())) {
      await supabase.auth.signOut();
      return { status: "error", error: "notStaff", email };
    }
    redirect(safeAdminNext(next));
  }

  // Same answer whether or not the email has access, so the form cannot be used to find
  // out who the staff are.
  if (await ensureStaffAccount(email)) {
    const callback = new URL(AUTH_CALLBACK, await siteOrigin());
    callback.searchParams.set("next", safeAdminNext(next));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
    });
    if (error) console.error("[admin-auth] magic link failed", error.message);
  }
  return { status: "link_sent", email };
}

export async function signOut(): Promise<void> {
  if (supabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect(ADMIN_LOGIN);
}
