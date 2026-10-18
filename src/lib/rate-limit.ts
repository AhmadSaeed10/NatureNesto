import "server-only";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RateLimitRule {
  /** Short name of the action, for example "login". */
  scope: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  login: { scope: "login", limit: 10, windowSeconds: 15 * 60 },
  loginEmail: { scope: "login-email", limit: 5, windowSeconds: 15 * 60 },
} as const satisfies Record<string, RateLimitRule>;

/** Best effort client address. Vercel sets x-forwarded-for; the first entry is the client. */
export async function clientIp(): Promise<string> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

/**
 * Counts one hit and reports whether the caller is still within the limit. Fails closed:
 * if the database cannot be reached the action is refused rather than left unprotected.
 */
export async function withinRateLimit(rule: RateLimitRule, subject: string): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("hit_rate_limit", {
      p_key: `${rule.scope}:${subject}`,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] check failed", error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("[rate-limit] not configured", error instanceof Error ? error.message : error);
    return false;
  }
}
