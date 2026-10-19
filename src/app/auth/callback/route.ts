import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCOUNT_HOME, ACCOUNT_LOGIN, ADMIN_LOGIN, safeNext } from "@/lib/auth/paths";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const otpType = z.enum(["magiclink", "email", "signup", "invite", "recovery", "email_change"]);

/** Completes a magic link sign in for staff or customers (PKCE code, or token hash). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  // A failed customer link goes back to the customer sign in, not the admin one.
  const login = next.startsWith(ACCOUNT_HOME) ? ACCOUNT_LOGIN : ADMIN_LOGIN;
  const failed = NextResponse.redirect(new URL(`${login}?error=callback`, request.url));
  if (!supabasePublicEnv()) return failed;

  const supabase = await createSupabaseServerClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = otpType.safeParse(searchParams.get("type"));

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type.success
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type.data as EmailOtpType })
      : { error: new Error("missing code") };

  if (error) return failed;
  return NextResponse.redirect(new URL(next, request.url));
}
