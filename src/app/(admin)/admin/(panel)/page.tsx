import Link from "next/link";
import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { admin } from "@/content/admin";
import { stockSummary } from "@/lib/admin/inventory";
import { canAccess, requireStaff } from "@/lib/auth/staff";

export default async function AdminHomePage() {
  const staff = await requireStaff();
  const copy = admin.home;
  const summary = canAccess(staff.role, "catalog") ? await stockSummary() : null;
  const stats = summary
    ? [
        { label: copy.active, value: summary.active },
        { label: copy.drafts, value: summary.drafts },
        { label: copy.lowStock, value: summary.low },
        { label: copy.outOfStock, value: summary.out },
      ]
    : [];

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

      {summary ? (
        <AdminCard title={copy.catalog}>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-surface p-4">
                <dt className="text-sm text-ink-muted">{stat.label}</dt>
                <dd className="font-serif text-h3">{stat.value}</dd>
              </div>
            ))}
          </dl>
          {summary.low + summary.out > 0 ? (
            <Link
              href="/admin/inventory?filter=low"
              className="text-sm text-primary-dark underline underline-offset-4"
            >
              {copy.viewInventory}
            </Link>
          ) : null}
        </AdminCard>
      ) : null}
    </AdminPage>
  );
}
