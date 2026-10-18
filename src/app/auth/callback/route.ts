import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_LOGIN, safeAdminNext } from "@/lib/auth/paths";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const otpType = z.enum(["magiclink", "email", "signup", "invite", "recovery", "email_change"]);

/** Completes a magic link sign in (PKCE code, or token hash from a custom email template). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeAdminNext(searchParams.get("next"));
  const failed = NextResponse.redirect(new URL(`${ADMIN_LOGIN}?error=callback`, request.url));
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
