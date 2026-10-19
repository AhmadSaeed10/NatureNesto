"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import {
  type DocKind,
  type DocResult,
  deleteDoc,
  savePage,
  savePost,
  saveWorkshop,
} from "@/app/actions/admin-content-docs";
import { AdminCard } from "@/components/admin/AdminPage";
import {
  Checkbox,
  OUTLINE_BUTTON,
  SelectInput,
  TEXT_BUTTON,
  TextArea,
  TextInput,
} from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { PickerOption } from "@/lib/admin/products-shared";
import { toHandle } from "@/lib/handle";
import { paisaToRupees } from "@/lib/money";
import { RichTextEditor } from "./RichTextEditor";

const copy = admin.content.docs;

// Pakistan Standard Time is UTC+5 all year, so local input converts without a library.
const PKT_OFFSET = "+05:00";
const PKT_MS = 5 * 60 * 60 * 1000;
export const isoToPkt = (iso: string): string =>
  iso ? new Date(new Date(iso).getTime() + PKT_MS).toISOString().slice(0, 16) : "";
const pktToIso = (local: string): string =>
  local ? new Date(`${local}:00${PKT_OFFSET}`).toISOString() : "";

export type DocEditorKind = Exclude<DocKind, "faq">;

export interface DocDraft {
  id: string;
  title: string;
  handle: string;
  body: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  excerpt?: string;
  coverId?: string;
  tags?: string[];
  publishedAt?: string;
  summary?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  capacity?: string;
  price?: number | null;
}

interface DocEditorProps {
  kind: DocEditorKind;
  doc: DocDraft | null;
  media: PickerOption[];
  justSaved?: boolean;
}

const PUBLIC_PATH: Record<DocEditorKind, (handle: string) => string> = {
  pages: (handle) => `/${handle}`,
  blog: (handle) => `/blogs/${handle}`,
  workshops: () => "/workshops",
};

export function DocEditor({ kind, doc, media, justSaved = false }: DocEditorProps) {
  const router = useRouter();
  const uid = useId();
  const isNew = doc === null;

  const [title, setTitle] = useState(doc?.title ?? "");
  const [handle, setHandle] = useState(doc?.handle ?? "");
  const [handleTouched, setHandleTouched] = useState(!isNew);
  const [body, setBody] = useState(doc?.body ?? "");
  const [published, setPublished] = useState(doc?.published ?? false);
  const [seoTitle, setSeoTitle] = useState(doc?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(doc?.seoDescription ?? "");
  const [excerpt, setExcerpt] = useState(doc?.excerpt ?? "");
  const [coverId, setCoverId] = useState(doc?.coverId ?? "");
  const [tags, setTags] = useState((doc?.tags ?? []).join(", "));
  const [publishedAt, setPublishedAt] = useState(isoToPkt(doc?.publishedAt ?? ""));
  const [summary, setSummary] = useState(doc?.summary ?? "");
  const [startsAt, setStartsAt] = useState(isoToPkt(doc?.startsAt ?? ""));
  const [endsAt, setEndsAt] = useState(isoToPkt(doc?.endsAt ?? ""));
  const [location, setLocation] = useState(doc?.location ?? "");
  const [capacity, setCapacity] = useState(doc?.capacity ?? "");
  const [price, setPrice] = useState(paisaToRupees(doc?.price ?? null));

  const [message, setMessage] = useState(justSaved ? copy.saved : "");
  const [bad, setBad] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function report(result: Exclude<DocResult, { ok: true }>) {
    setBad(new Set(result.fields ?? (result.error.startsWith("handle") ? ["handle"] : [])));
    setMessage(
      result.error === "handleTaken"
        ? copy.handleTaken
        : result.error === "handleReserved"
          ? copy.handleReserved
          : result.error === "forbidden"
            ? admin.form.forbidden
            : result.error === "invalid"
              ? copy.invalid
              : admin.form.failed,
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBad(new Set());
    startTransition(async () => {
      const base = { id: doc?.id ?? "", title, handle, body, published };
      const result =
        kind === "pages"
          ? await savePage({ ...base, seoTitle, seoDescription })
          : kind === "blog"
            ? await savePost({
                ...base,
                excerpt,
                coverId,
                tags: tags.split(","),
                publishedAt: pktToIso(publishedAt),
                seoTitle,
                seoDescription,
              })
            : await saveWorkshop({
                ...base,
                summary,
                coverId,
                startsAt: pktToIso(startsAt),
                endsAt: pktToIso(endsAt),
                location,
                capacity,
                price,
              });
      if (!result.ok) return report(result);
      router.replace(`/admin/content/${kind}/${result.id}?saved=1`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!doc || !window.confirm(copy.deleteConfirm)) return;
    const id = doc.id;
    startTransition(async () => {
      const result = await deleteDoc(kind, id);
      if (result.ok) router.push(`/admin/content/${kind}`);
      else setMessage(admin.form.failed);
    });
  }

  const err = (field: string) => (bad.has(field) ? copy.invalid : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/content/${kind}`} className={TEXT_BUTTON}>
          {copy.back}
        </Link>
        <div className="flex flex-wrap gap-3">
          {!isNew ? (
            <>
              <a
                href={`/preview?kind=${kind}&id=${doc.id}`}
                target="_blank"
                rel="noopener"
                className={OUTLINE_BUTTON}
              >
                {copy.preview}
              </a>
              {doc.published ? (
                <a
                  href={PUBLIC_PATH[kind](doc.handle)}
                  target="_blank"
                  rel="noopener"
                  className={OUTLINE_BUTTON}
                >
                  {copy.view}
                </a>
              ) : null}
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className={OUTLINE_BUTTON}
              >
                {copy.delete}
              </button>
            </>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? admin.form.saving : copy.save}
          </Button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
        {message}
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <TextInput
              id={`${uid}-title`}
              label={copy.title}
              value={title}
              required
              error={err("title")}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!handleTouched) setHandle(toHandle(event.target.value));
              }}
            />
            <TextInput
              id={`${uid}-handle`}
              label={copy.handle}
              hint={copy.handleHint}
              value={handle}
              required
              error={
                bad.has("handle") ? (message === copy.invalid ? copy.invalid : message) : undefined
              }
              onChange={(event) => {
                setHandleTouched(true);
                setHandle(event.target.value);
              }}
              onBlur={() => setHandle((value) => toHandle(value))}
            />
            {kind === "blog" ? (
              <TextArea
                id={`${uid}-excerpt`}
                label={copy.excerpt}
                hint={copy.excerptHint}
                rows={3}
                maxLength={300}
                value={excerpt}
                error={err("excerpt")}
                onChange={(event) => setExcerpt(event.target.value)}
              />
            ) : null}
            {kind === "workshops" ? (
              <TextArea
                id={`${uid}-summary`}
                label={copy.summary}
                rows={3}
                maxLength={300}
                value={summary}
                error={err("summary")}
                onChange={(event) => setSummary(event.target.value)}
              />
            ) : null}
            <RichTextEditor
              label={copy.body}
              value={body}
              onChange={setBody}
              invalid={bad.has("body")}
            />
          </AdminCard>

          {kind !== "workshops" ? (
            <AdminCard title={admin.productEditor.sections.seo}>
              <TextInput
                id={`${uid}-seo-title`}
                label={copy.seoTitle}
                maxLength={70}
                value={seoTitle}
                placeholder={title}
                onChange={(event) => setSeoTitle(event.target.value)}
              />
              <TextArea
                id={`${uid}-seo-description`}
                label={copy.seoDescription}
                rows={3}
                maxLength={170}
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
              />
            </AdminCard>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <Checkbox
              id={`${uid}-published`}
              label={copy.published}
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            {kind === "blog" ? (
              <TextInput
                id={`${uid}-published-at`}
                type="datetime-local"
                label={copy.publishedAt}
                hint={copy.publishedAtHint}
                value={publishedAt}
                error={err("publishedAt")}
                onChange={(event) => setPublishedAt(event.target.value)}
              />
            ) : null}
            {kind !== "pages" ? (
              <SelectInput
                id={`${uid}-cover`}
                label={copy.cover}
                value={coverId}
                onChange={(event) => setCoverId(event.target.value)}
              >
                <option value="">{copy.noCover}</option>
                {media.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            ) : null}
            {kind === "blog" ? (
              <TextInput
                id={`${uid}-tags`}
                label={copy.tags}
                value={tags}
                onChange={(event) => setTags(event.target.value)}
              />
            ) : null}
            {kind === "workshops" ? (
              <>
                <TextInput
                  id={`${uid}-starts`}
                  type="datetime-local"
                  label={copy.startsAt}
                  value={startsAt}
                  error={err("startsAt")}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
                <TextInput
                  id={`${uid}-ends`}
                  type="datetime-local"
                  label={copy.endsAt}
                  value={endsAt}
                  error={err("endsAt")}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
                <TextInput
                  id={`${uid}-location`}
                  label={copy.location}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
                <TextInput
                  id={`${uid}-capacity`}
                  label={copy.capacity}
                  inputMode="numeric"
                  value={capacity}
                  error={err("capacity")}
                  onChange={(event) => setCapacity(event.target.value)}
                />
                <TextInput
                  id={`${uid}-price`}
                  label={copy.price}
                  hint={copy.priceHint}
                  inputMode="decimal"
                  value={price}
                  error={err("price")}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </>
            ) : null}
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
