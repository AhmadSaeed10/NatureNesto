import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountLoginForm } from "@/components/account/AccountLoginForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { commerce } from "@/content/commerce";

const copy = commerce.account;

export const metadata: Metadata = { title: copy.signIn, robots: { index: false, follow: false } };

async function LoginPanel({ searchParams }: PageProps<"/account/login">) {
  const { error } = await searchParams;
  return <AccountLoginForm callbackFailed={error === "callback"} />;
}

export default function AccountLoginPage(props: PageProps<"/account/login">) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-4">
        <Eyebrow>{copy.title}</Eyebrow>
        <h1 className="text-h1">{copy.signIn}</h1>
        <p className="text-lead text-ink-muted">{copy.intro}</p>
      </div>
      <Suspense>
        <LoginPanel {...props} />
      </Suspense>
    </section>
  );
}
