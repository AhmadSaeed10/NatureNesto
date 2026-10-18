import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { admin } from "@/content/admin";
import { requireStaff } from "@/lib/auth/staff";

export default async function AdminHomePage() {
  const staff = await requireStaff();
  const copy = admin.home;

  return (
    <AdminPage title={copy.title}>
      <AdminCard>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-muted">{copy.signedInAs}</dt>
            <dd className="font-medium break-all">{staff.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">{copy.role}</dt>
            <dd className="font-medium">{admin.roles[staff.role]}</dd>
          </div>
        </dl>
        <p className="max-w-prose text-ink-muted">{copy.next}</p>
      </AdminCard>
    </AdminPage>
  );
}
