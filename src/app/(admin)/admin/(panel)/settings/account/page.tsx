import { AdminCard } from "@/components/admin/AdminPage";
import { PasswordForm } from "@/components/admin/settings/PasswordForm";
import { admin } from "@/content/admin";
import { requireStaff } from "@/lib/auth/staff";

export default async function AccountSettingsPage() {
  const staff = await requireStaff();
  return (
    <AdminCard title={admin.settings.account.title} description={staff.email}>
      <PasswordForm email={staff.email} />
    </AdminCard>
  );
}
