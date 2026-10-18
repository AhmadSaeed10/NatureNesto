"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { deleteMediaAsset, updateMediaAsset } from "@/app/actions/admin-media";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { MediaItem } from "@/lib/admin/media";

const copy = admin.media.item;
const form = admin.form;

const ERRORS = {
  invalid: form.invalid,
  forbidden: form.forbidden,
  in_use: copy.deleteBlocked,
  failed: form.failed,
} as const;

export function MediaCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const decorativeId = useId();
  const [decorative, setDecorative] = useState(item.decorative);
  const [copied, setCopied] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, startDelete] = useTransition();
  const [state, save, saving] = useActionState(updateMediaAsset, null);

  useEffect(() => {
    if (state?.ok) dialogRef.current?.close();
  }, [state]);

  const label = item.title || item.alt || copy.external;

  function onDelete() {
    if (!window.confirm(copy.deleteConfirm)) return;
    startDelete(async () => {
      const result = await deleteMediaAsset(item.id);
      if (result.ok) {
        dialogRef.current?.close();
        router.refresh();
      } else {
        setDeleteError(ERRORS[result.error]);
      }
    });
  }

  async function onCopy() {
    const absolute = new URL(item.url, window.location.origin).toString();
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
  }

  const saveMessage = state ? (state.ok ? form.saved : ERRORS[state.error]) : "";

  return (
    <li className="flex flex-col overflow-hidden rounded-card border border-line bg-background">
      <div className="relative aspect-square bg-surface">
        {item.url ? (
          <Image
            src={item.url}
            alt={item.decorative ? "" : item.alt}
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 768px) 30vw, 45vw"
            className="object-contain p-2"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 text-sm">
        <p className="truncate font-medium" title={label}>
          {label}
        </p>
        <p className="text-ink-muted">
          {item.width && item.height ? `${copy.dimensions(item.width, item.height)} · ` : ""}
          {item.uses > 0 ? copy.uses(item.uses) : copy.unused}
        </p>
        <div className="mt-auto flex flex-wrap gap-x-3">
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              dialogRef.current?.showModal();
            }}
            className="inline-flex min-h-(--size-tap) items-center text-primary-dark underline-offset-4 hover:underline"
          >
            {copy.edit}
            <span className="sr-only">: {label}</span>
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-(--size-tap) items-center text-primary-dark underline-offset-4 hover:underline"
          >
            {copy.copyUrl}
            <span className="sr-only">: {label}</span>
          </button>
        </div>
        <p role="status" aria-live="polite" className="text-ink-muted empty:hidden">
          {copied ? copy.copied : ""}
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-background p-6 text-ink backdrop:bg-ink/40"
      >
        <form action={save} className="flex flex-col gap-4">
          <h2 id={titleId} className="text-h4">
            {copy.editTitle}
          </h2>
          <input type="hidden" name="id" value={item.id} />
          <FloatingField name="title" label={copy.name} defaultValue={item.title ?? ""} />
          <FloatingField
            name="alt"
            label={copy.alt}
            defaultValue={item.alt}
            required={!decorative}
            error={
              state && !state.ok && state.error === "invalid"
                ? admin.media.upload.errors.alt
                : undefined
            }
          />
          <div className="flex min-h-(--size-tap) items-center gap-3">
            <input
              id={decorativeId}
              name="decorative"
              type="checkbox"
              checked={decorative}
              onChange={(event) => setDecorative(event.target.checked)}
              className="size-5 accent-primary-dark"
            />
            <label htmlFor={decorativeId}>{copy.decorative}</label>
          </div>
          <p role="status" aria-live="polite" className="min-h-5 text-sm">
            {deleteError || saveMessage}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex min-h-(--size-tap) items-center text-ink underline underline-offset-4"
            >
              {copy.delete}
            </button>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
                {form.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? form.saving : form.save}
              </Button>
            </div>
          </div>
        </form>
      </dialog>
    </li>
  );
}
