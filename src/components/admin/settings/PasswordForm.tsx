"use client";

import { useActionState } from "react";
import { type PasswordState, setPassword } from "@/app/actions/admin-account";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";

const copy = admin.settings.account;
const INITIAL: PasswordState = { status: "idle" };

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(setPassword, INITIAL);
  const message = {
    idle: "",
    done: copy.done,
    short: copy.errors.short,
    mismatch: copy.errors.mismatch,
    forbidden: admin.form.forbidden,
    failed: admin.form.failed,
  }[state.status];

  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      {/* Lets password managers file the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <FloatingField
        name="password"
        type="password"
        label={copy.password}
        hint={copy.passwordHint}
        autoComplete="new-password"
        required
        error={state.status === "short" ? copy.errors.short : undefined}
      />
      <FloatingField
        name="confirm"
        type="password"
        label={copy.confirm}
        autoComplete="new-password"
        required
        error={state.status === "mismatch" ? copy.errors.mismatch : undefined}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? admin.form.saving : copy.submit}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}
