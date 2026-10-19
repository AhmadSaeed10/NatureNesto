"use client";

import { useRouter } from "next/navigation";
import { useActionState, useId, useTransition } from "react";
import { type RedirectState, addRedirect, deleteRedirect } from "@/app/actions/admin-content-site";
import { AdminCard } from "@/components/admin/AdminPage";
import { Checkbox, TEXT_BUTTON, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { RedirectRow } from "@/lib/admin/content";

const copy = admin.content.redirects;
const INITIAL: RedirectState = { status: "idle" };

export function RedirectsManager({ redirects }: { redirects: RedirectRow[] }) {
  const router = useRouter();
  const uid = useId();
  const [state, action, adding] = useActionState(addRedirect, INITIAL);
  const [pending, startTransition] = useTransition();
  const message = {
    idle: "",
    done: admin.form.saved,
    invalid: admin.form.invalid,
    taken: copy.sourceTaken,
    forbidden: admin.form.forbidden,
    failed: admin.form.failed,
  }[state.status];

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-ink-muted">{copy.intro}</p>
      <AdminCard title={copy.add}>
        <form
          action={action}
          className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <TextInput
            id={`${uid}-source`}
            name="source"
            label={copy.source}
            hint={copy.sourceHint}
            placeholder="/old-page"
            required
          />
          <TextInput
            id={`${uid}-destination`}
            name="destination"
            label={copy.destination}
            placeholder="/new-page"
            required
          />
          <Button type="submit" disabled={adding}>
            {copy.add}
          </Button>
          <Checkbox
            id={`${uid}-permanent`}
            name="permanent"
            label={copy.permanent}
            defaultChecked
          />
          <p role="status" aria-live="polite" className="text-sm md:col-span-2">
            {message}
          </p>
        </form>
      </AdminCard>
      {redirects.length === 0 ? (
        <p className="text-ink-muted">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-background text-sm">
          {redirects.map((redirect) => (
            <li key={redirect.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <span className="min-w-0 break-all">
                {redirect.source} → {redirect.destination}
                <span className="text-ink-muted"> · {redirect.permanent ? "301" : "302"}</span>
              </span>
              <button
                type="button"
                className={TEXT_BUTTON}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteRedirect(redirect.id);
                    router.refresh();
                  })
                }
              >
                {copy.delete}
                <span className="sr-only">: {redirect.source}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
