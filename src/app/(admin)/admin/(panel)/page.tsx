import { signOut } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { admin } from "@/content/admin";
import { requireStaff } from "@/lib/auth/staff";

export default async function AdminHomePage() {
  const staff = await requireStaff();
  const copy = admin.home;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 md:px-8">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <h1 className="text-h2">{copy.title}</h1>
      <dl className="grid gap-4 rounded-card border border-line bg-background p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-muted">{copy.signedInAs}</dt>
          <dd className="font-medium break-all">{staff.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">{copy.role}</dt>
          <dd className="font-medium">{copy.roles[staff.role]}</dd>
        </div>
      </dl>
      <p className="max-w-prose text-ink-muted">{copy.next}</p>
      <div className="flex flex-wrap gap-3">
        <form action={signOut}>
          <Button type="submit">{copy.signOut}</Button>
        </form>
        <Button href="/" variant="secondary">
          {copy.viewSite}
        </Button>
      </div>
    </main>
  );
}
