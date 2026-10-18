// Shared by proxy.ts, the auth callback and admin pages so the routes stay in one place.
export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/login";
export const AUTH_CALLBACK = "/auth/callback";

/** Only same-origin admin paths are accepted as a post-login destination. */
export function safeAdminNext(value: string | null | undefined): string {
  if (!value || !value.startsWith(ADMIN_HOME) || value.startsWith("//")) return ADMIN_HOME;
  return value;
}
