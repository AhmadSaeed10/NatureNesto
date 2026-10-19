import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { ACCOUNT_HOME, ACCOUNT_LOGIN, ADMIN_HOME, ADMIN_LOGIN } from "@/lib/auth/paths";
import type { Database } from "@/lib/supabase/database.types";
import { supabasePublicEnv } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase session cookie on admin and auth routes, and sends signed-out
 * visitors to the login page. This is only the first gate: the admin layout checks the
 * staff role on the server and RLS guards every query.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = supabasePublicEnv();
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === ADMIN_LOGIN || pathname === ACCOUNT_LOGIN;
  const isAdmin = pathname === ADMIN_HOME || pathname.startsWith(`${ADMIN_HOME}/`);
  const isAccount = pathname === ACCOUNT_HOME || pathname.startsWith(`${ACCOUNT_HOME}/`);
  const loginFor = isAccount ? ACCOUNT_LOGIN : ADMIN_LOGIN;

  if (!env) {
    if ((isAdmin || isAccount) && !isLogin)
      return NextResponse.redirect(new URL(loginFor, request.url));
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getClaims verifies the JWT, unlike getSession which trusts the cookie as is.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims.sub);

  if ((isAdmin || isAccount) && !isLogin && !signedIn) {
    const login = new URL(loginFor, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*", "/auth/:path*"],
};
