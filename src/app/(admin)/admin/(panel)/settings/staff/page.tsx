import { AdminCard } from "@/components/admin/AdminPage";
import { InviteForm, InviteRow, MemberRow } from "@/components/admin/settings/StaffForms";
import { admin } from "@/content/admin";
import { ACCESS, type StaffRole, requireStaff } from "@/lib/auth/staff";
import { Constants } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const copy = admin.settings.staff;

export default async function StaffSettingsPage() {
  const staff = await requireStaff(ACCESS.staff);
  const supabase = await createSupabaseServerClient();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase.from("profiles").select("id, email, role").not("role", "is", null).order("email"),
    supabase.from("staff_invites").select("id, email, role").is("accepted_at", null).order("email"),
  ]);

  // Admins cannot grant or touch the owner role; owners can do everything.
  const assignable: readonly StaffRole[] =
    staff.role === "owner"
      ? Constants.public.Enums.staff_role
      : Constants.public.Enums.staff_role.filter((role) => role !== "owner");
  const mayEdit = (role: StaffRole): boolean => staff.role === "owner" || role !== "owner";

  return (
    <div className="flex flex-col gap-6">
      <AdminCard title={copy.invite.title} description={copy.intro}>
        <InviteForm roles={assignable} />
      </AdminCard>
      <AdminCard title={copy.title}>
        <ul>
          {(members ?? []).flatMap((member) =>
            member.role
              ? [
                  <MemberRow
                    key={member.id}
                    id={member.id}
                    email={member.email}
                    role={member.role}
                    isSelf={member.id === staff.id}
                    editable={mayEdit(member.role)}
                    roles={assignable}
                  />,
                ]
              : [],
          )}
          {(invites ?? []).map((invite) => (
            <InviteRow
              key={invite.id}
              id={invite.id}
              email={invite.email}
              role={invite.role}
              editable={mayEdit(invite.role)}
            />
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}
