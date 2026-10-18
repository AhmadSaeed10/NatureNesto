import { z } from "zod";

// Public values are inlined into the client bundle at build time, so they must be read
// with literal `process.env.NEXT_PUBLIC_*` accesses. The legacy SUPABASE_URL and
// SUPABASE_ANON_KEY names from the catalogue phase are still honoured on the server.
const publicSchema = z.object({
  url: z.url(),
  anonKey: z.string().min(1),
});

export type SupabasePublicEnv = z.infer<typeof publicSchema>;

/**
 * Supabase URL and anon key, or null when the project is not configured. The storefront
 * keeps working without them (sample catalogue), so absence is not an error.
 */
export function supabasePublicEnv(): SupabasePublicEnv | null {
  const parsed = publicSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  });
  return parsed.success ? parsed.data : null;
}

/** Like supabasePublicEnv, but for code paths (admin, auth) that cannot run without it. */
export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = supabasePublicEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return env;
}
