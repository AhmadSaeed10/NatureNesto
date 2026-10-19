"use client";

import { useActionState } from "react";
import { type LinkState, requestAccountLink } from "@/app/actions/account";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { commerce } from "@/content/commerce";

const copy = commerce.account;
const INITIAL: LinkState = { status: "idle" };

interface AccountLoginFormProps {
  callbackFailed: boolean;
}

export function AccountLoginForm({ callbackFailed }: AccountLoginFormProps) {
  const [state, action, pending] = useActionState(requestAccountLink, INITIAL);
  const message =
    state.status === "sent"
      ? copy.sent
      : state.status === "rateLimited"
        ? copy.errors.rateLimited
        : state.status === "notConfigured"
          ? copy.errors.notConfigured
          : state.status === "idle" && callbackFailed
            ? copy.errors.callback
            : "";

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <FloatingField
        name="email"
        type="email"
        label={copy.email}
        autoComplete="email"
        required
        error={state.status === "email" ? copy.errors.email : undefined}
      />
      <p role="status" aria-live="polite" className="min-h-6 text-small font-medium">
        {message}
      </p>
      <Button type="submit" disabled={pending} withArrow className="self-start">
        {pending ? copy.sending : copy.send}
      </Button>
    </form>
  );
}
