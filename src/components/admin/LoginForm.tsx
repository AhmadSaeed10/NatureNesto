"use client";

import { useActionState } from "react";
import { type LoginState, signIn } from "@/app/actions/admin-auth";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";

interface LoginFormProps {
  next: string;
  /** Message carried in the URL, for example after an expired link. */
  notice?: string;
}

const INITIAL: LoginState = { status: "idle" };

export function LoginForm({ next, notice }: LoginFormProps) {
  const [state, action, pending] = useActionState(signIn, INITIAL);
  const copy = admin.login;
  const message =
    state.status === "link_sent"
      ? copy.linkSent
      : state.status === "error" && state.error
        ? copy.errors[state.error]
        : notice;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FloatingField
        name="email"
        type="email"
        label={copy.email}
        autoComplete="username"
        required
        defaultValue={state.email}
        error={state.status === "error" && state.error === "email" ? copy.errors.email : undefined}
      />
      <FloatingField
        name="password"
        type="password"
        label={copy.password}
        autoComplete="current-password"
        hint={copy.passwordHint}
      />
      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {message}
      </p>
      <Button type="submit" disabled={pending} withArrow>
        {pending ? copy.pending : copy.submitPassword}
      </Button>
    </form>
  );
}
