import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "./database.types";
import { requireSupabasePublicEnv } from "./env";

/**
 * Service role client. Bypasses RLS, so it is only for server actions and route handlers
 * that have already validated input and checked the caller (rate limits, lead capture,
 * checkout, webhooks). Never import this from a component.
 */
export function createSupabaseAdminClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = z.string().min(1).safeParse(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!serviceRoleKey.success) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createClient<Database>(url, serviceRoleKey.data, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
