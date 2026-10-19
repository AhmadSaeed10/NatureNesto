import { RedirectsManager } from "@/components/admin/content/RedirectsManager";
import { listRedirects } from "@/lib/admin/content";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function RedirectsPage() {
  await requireStaff(ACCESS.redirects);
  const redirects = await listRedirects();
  return <RedirectsManager redirects={redirects} />;
}
