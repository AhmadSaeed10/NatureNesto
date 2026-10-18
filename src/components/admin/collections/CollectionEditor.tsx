"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import {
  type ProductHit,
  deleteCollection,
  saveCollection,
  searchProducts,
} from "@/app/actions/admin-collections";
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
import {
  type CollectionKind,
  type CollectionMember,
  type EditorCollection,
  SORT_ORDERS,
  type SortOrder,
} from "@/lib/admin/collections-shared";
import type { CollectionRule, PickerOption } from "@/lib/admin/products-shared";
import { toHandle } from "@/lib/handle";

const copy = admin.collections.editor;
const FIELDS: CollectionRule["field"][] = ["tag", "product_type", "vendor"];

interface CollectionEditorProps {
  collection: EditorCollection | null;
  media: PickerOption[];
  justSaved?: boolean;
}

export function CollectionEditor({ collection, media, justSaved = false }: CollectionEditorProps) {
  const router = useRouter();
  const uid = useId();
  const isNew = collection === null;

  const [title, setTitle] = useState(collection?.title ?? "");
  const [handle, setHandle] = useState(collection?.handle ?? "");
  const [handleTouched, setHandleTouched] = useState(!isNew);
  const [description, setDescription] = useState(collection?.description ?? "");
  const [kind, setKind] = useState<CollectionKind>(collection?.kind ?? "manual");
  const [rules, setRules] = useState<CollectionRule[]>(
    collection?.rules ?? [{ field: "tag", value: "" }],
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(collection?.sortOrder ?? "manual");
  const [published, setPublished] = useState(collection?.published ?? false);
  const [imageId, setImageId] = useState(collection?.imageId ?? "");
  const [seoTitle, setSeoTitle] = useState(collection?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(collection?.seoDescription ?? "");
  const [members, setMembers] = useState<CollectionMember[]>(collection?.members ?? []);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [message, setMessage] = useState(justSaved ? copy.saved : "");
  const [badFields, setBadFields] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function onSearch() {
    startTransition(async () => setHits(await searchProducts(query)));
  }

  function addMember(hit: ProductHit) {
    if (members.some((member) => member.id === hit.id)) return;
    setMembers((list) => [...list, { ...hit, thumbnail: null }]);
  }

  function moveMember(from: number, to: number) {
    if (to < 0 || to >= members.length) return;
    setMembers((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBadFields(new Set());
    startTransition(async () => {
      const result = await saveCollection({
        id: collection?.id ?? null,
        title,
        handle,
        description,
        kind,
        rules: rules.filter((rule) => rule.value.trim()),
        sortOrder,
        published,
        imageId,
        seoTitle,
        seoDescription,
        productIds: members.map((member) => member.id),
      });
      if (!result.ok) {
        setBadFields(new Set(result.fields ?? []));
        setMessage(
          result.error === "handleTaken"
            ? copy.errors.handleTaken
            : result.error === "rules"
              ? copy.errors.rules
              : result.error === "forbidden"
                ? admin.form.forbidden
                : copy.errors.invalid,
        );
        return;
      }
      router.replace(`/admin/collections/${result.id}?saved=1`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!collection || !window.confirm(copy.deleteConfirm)) return;
    const id = collection.id;
    startTransition(async () => {
      const result = await deleteCollection(id);
      if (result.ok) router.push("/admin/collections");
      else setMessage(admin.form.failed);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/collections" className={TEXT_BUTTON}>
          {copy.back}
        </Link>
        <div className="flex flex-wrap gap-3">
          {!isNew ? (
            <button type="button" onClick={onDelete} disabled={pending} className={OUTLINE_BUTTON}>
              {copy.delete}
            </button>
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
              error={badFields.has("title") ? copy.errors.invalid : undefined}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!handleTouched) setHandle(toHandle(event.target.value));
              }}
            />
            <TextInput
              id={`${uid}-handle`}
              label={copy.handle}
              value={handle}
              required
              error={badFields.has("handle") ? admin.productEditor.errors.handle : undefined}
              onChange={(event) => {
                setHandleTouched(true);
                setHandle(event.target.value);
              }}
              onBlur={() => setHandle((value) => toHandle(value))}
            />
            <TextArea
              id={`${uid}-description`}
              label={copy.description}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </AdminCard>

          <AdminCard title={copy.kind}>
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">{copy.kind}</legend>
              {(["manual", "automatic"] as const).map((value) => (
                <div key={value} className="flex min-h-(--size-tap) items-start gap-3">
                  <input
                    id={`${uid}-kind-${value}`}
                    type="radio"
                    name="kind"
                    value={value}
                    checked={kind === value}
                    onChange={() => setKind(value)}
                    className="mt-1 size-5 accent-primary-dark"
                  />
                  <label htmlFor={`${uid}-kind-${value}`} className="flex flex-col text-sm">
                    <span className="font-medium">{admin.collections.kinds[value]}</span>
                    <span className="text-ink-muted">
                      {value === "manual" ? copy.manualHint : copy.automaticHint}
                    </span>
                  </label>
                </div>
              ))}
            </fieldset>

            {kind === "automatic" ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">{copy.rules}</p>
                <p className="text-xs text-ink-muted">{copy.rulesHint}</p>
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 items-end gap-3 md:grid-cols-[10rem_minmax(0,1fr)_auto]"
                  >
                    <SelectInput
                      id={`${uid}-rule-${index}-field`}
                      label={copy.field}
                      value={rule.field}
                      onChange={(event) =>
                        setRules((list) =>
                          list.map((r, i) =>
                            i === index
                              ? { ...r, field: event.target.value as CollectionRule["field"] }
                              : r,
                          ),
                        )
                      }
                    >
                      {FIELDS.map((field) => (
                        <option key={field} value={field}>
                          {copy.fields[field]}
                        </option>
                      ))}
                    </SelectInput>
                    <TextInput
                      id={`${uid}-rule-${index}-value`}
                      label={copy.value}
                      value={rule.value}
                      onChange={(event) =>
                        setRules((list) =>
                          list.map((r, i) =>
                            i === index ? { ...r, value: event.target.value } : r,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      onClick={() => setRules((list) => list.filter((_, i) => i !== index))}
                    >
                      {copy.removeRule}
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className={OUTLINE_BUTTON}
                    onClick={() => setRules((list) => [...list, { field: "tag", value: "" }])}
                  >
                    {copy.addRule}
                  </button>
                </div>
                {collection ? (
                  <p className="text-sm text-ink-muted">{copy.matching(collection.matchCount)}</p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">{copy.products}</p>
                {members.length === 0 ? (
                  <p className="text-sm text-ink-muted">{copy.noProducts}</p>
                ) : (
                  <ol className="flex flex-col gap-2">
                    {members.map((member, index) => (
                      <li
                        key={member.id}
                        className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-2"
                      >
                        <div className="relative size-10 overflow-hidden rounded-lg bg-surface">
                          {member.thumbnail ? (
                            <Image
                              src={member.thumbnail}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm">{member.title}</span>
                        <button
                          type="button"
                          className={TEXT_BUTTON}
                          disabled={index === 0}
                          onClick={() => moveMember(index, index - 1)}
                        >
                          {admin.productEditor.media.moveUp}
                          <span className="sr-only">: {member.title}</span>
                        </button>
                        <button
                          type="button"
                          className={TEXT_BUTTON}
                          disabled={index === members.length - 1}
                          onClick={() => moveMember(index, index + 1)}
                        >
                          {admin.productEditor.media.moveDown}
                          <span className="sr-only">: {member.title}</span>
                        </button>
                        <button
                          type="button"
                          className={TEXT_BUTTON}
                          onClick={() =>
                            setMembers((list) => list.filter((m) => m.id !== member.id))
                          }
                        >
                          {copy.removeProduct}
                          <span className="sr-only">: {member.title}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <TextInput
                    id={`${uid}-search`}
                    label={copy.searchProducts}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onSearch();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={OUTLINE_BUTTON}
                    onClick={onSearch}
                    disabled={pending}
                  >
                    {admin.shell.searchSubmit}
                  </button>
                </div>
                {hits.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {hits.map((hit) => {
                      const added = members.some((member) => member.id === hit.id);
                      return (
                        <li
                          key={hit.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="truncate">{hit.title}</span>
                          <button
                            type="button"
                            className={TEXT_BUTTON}
                            disabled={added}
                            onClick={() => addMember(hit)}
                          >
                            {copy.addProduct}
                            <span className="sr-only">: {hit.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            )}
          </AdminCard>

          <AdminCard title={admin.productEditor.sections.seo}>
            <TextInput
              id={`${uid}-seo-title`}
              label={copy.seoTitle}
              value={seoTitle}
              maxLength={70}
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
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <Checkbox
              id={`${uid}-published`}
              label={copy.status}
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            <SelectInput
              id={`${uid}-sort`}
              label={copy.sort}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              {SORT_ORDERS.map((order) => (
                <option key={order} value={order}>
                  {copy.sorts[order]}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              id={`${uid}-image`}
              label={copy.image}
              value={imageId}
              onChange={(event) => setImageId(event.target.value)}
            >
              <option value="">{copy.noImage}</option>
              {media.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
