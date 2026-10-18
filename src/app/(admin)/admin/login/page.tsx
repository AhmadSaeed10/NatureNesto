import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { admin } from "@/content/admin";
import { safeAdminNext } from "@/lib/auth/paths";

const ERRORS = { callback: admin.login.errors.callback, "not-staff": admin.login.errors.notStaff };

async function LoginPanel({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = safeAdminNext(typeof params.next === "string" ? params.next : undefined);
  const errorKey = typeof params.error === "string" ? params.error : undefined;
  const notice =
    errorKey && errorKey in ERRORS ? ERRORS[errorKey as keyof typeof ERRORS] : undefined;
  return <LoginForm next={next} notice={notice} />;
}

export default function AdminLoginPage(props: PageProps<"/admin/login">) {
  const copy = admin.login;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-card border border-line bg-background p-6 sm:p-8">
        <Logo />
        <div className="flex flex-col gap-3">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="text-h3">{copy.title}</h1>
          <p className="text-ink-muted">{copy.intro}</p>
        </div>
        <Suspense>
          <LoginPanel {...props} />
        </Suspense>
      </div>
    </main>
  );
}
