"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { requireSupabasePublicEnv } from "./env";

/** Browser client for client components. Runs as the signed-in user, so RLS applies. */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
