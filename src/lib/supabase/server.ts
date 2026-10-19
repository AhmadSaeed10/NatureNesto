import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { requireSupabasePublicEnv, supabasePublicEnv } from "./env";

/**
 * Cookie-aware client for server components, server actions and route handlers. It acts as
 * the signed-in user, so every query is subject to RLS.
 */
export async function createSupabaseServerClient() {
  // Cookies first: it marks the caller as request time, so a build without Supabase env
  // never tries to prerender (and fail on) a signed in page.
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Anonymous client for public, cacheable reads (`use cache` functions cannot touch cookies).
 * Returns null when Supabase is not configured so callers can fall back to sample content.
 */
export function createSupabasePublicClient() {
  const env = supabasePublicEnv();
  if (!env) return null;
  return createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
