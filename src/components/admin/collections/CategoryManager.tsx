"use client";

import { useRouter } from "next/navigation";
import { useActionState, useId, useState, useTransition } from "react";
import { type CategoryState, deleteCategory, saveCategory } from "@/app/actions/admin-collections";
import { OUTLINE_BUTTON, SelectInput, TEXT_BUTTON, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { CategoryNode } from "@/lib/admin/collections-shared";
import { toHandle } from "@/lib/handle";

const copy = admin.collections.categories;
const INITIAL: CategoryState = { status: "idle" };

const message = (state: CategoryState): string =>
  ({
    idle: "",
    saved: admin.form.saved,
    invalid: admin.form.invalid,
    handleTaken: copy.handleTaken,
    cycle: copy.cycle,
    forbidden: admin.form.forbidden,
    failed: admin.form.failed,
  })[state.status];

interface CategoryFormProps {
  category?: CategoryNode;
  all: CategoryNode[];
}

function CategoryForm({ category, all }: CategoryFormProps) {
  const uid = useId();
  const [state, action, pending] = useActionState(saveCategory, INITIAL);
  const [name, setName] = useState(category?.name ?? "");
  const [handle, setHandle] = useState(category?.handle ?? "");
  const [touched, setTouched] = useState(Boolean(category));
  // A category cannot be moved under itself; deeper loops are rejected on the server.
  const parents = all.filter((node) => node.id !== category?.id);

  return (
    <form
      action={action}
      className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <TextInput
        id={`${uid}-name`}
        name="name"
        label={copy.name}
        value={name}
        required
        onChange={(event) => {
          setName(event.target.value);
          if (!touched) setHandle(toHandle(event.target.value));
        }}
      />
      <TextInput
        id={`${uid}-handle`}
        name="handle"
        label={copy.handle}
        value={handle}
        required
        onChange={(event) => {
          setTouched(true);
          setHandle(event.target.value);
        }}
        onBlur={() => setHandle((value) => toHandle(value))}
      />
      <SelectInput
        id={`${uid}-parent`}
        name="parentId"
        label={copy.parent}
        defaultValue={category?.parentId ?? ""}
      >
        <option value="">{copy.noParent}</option>
        {parents.map((node) => (
          <option key={node.id} value={node.id}>
            {`${"· ".repeat(node.depth)}${node.name}`}
          </option>
        ))}
      </SelectInput>
      <Button type="submit" disabled={pending}>
        {category ? copy.save : copy.add}
      </Button>
      <p role="status" aria-live="polite" className="text-sm md:col-span-4">
        {message(state)}
      </p>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: CategoryNode[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(node: CategoryNode) {
    if (!window.confirm(copy.deleteConfirm)) return;
    startTransition(async () => {
      await deleteCategory(node.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryForm all={categories} />
      {categories.length === 0 ? (
        <p className="text-ink-muted">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col">
          {categories.map((node) => (
            <li key={node.id} className="border-b border-line py-3 last:border-b-0">
              {editing === node.id ? (
                <CategoryForm key={node.id} category={node} all={categories} />
              ) : (
                <div
                  className="flex flex-wrap items-center gap-3"
                  style={{ paddingInlineStart: `${node.depth * 1.5}rem` }}
                >
                  <span className="flex-1 font-medium">
                    {node.name} <span className="font-normal text-ink-muted">{node.handle}</span>
                  </span>
                  <button type="button" className={TEXT_BUTTON} onClick={() => setEditing(node.id)}>
                    {admin.media.item.edit}
                    <span className="sr-only">: {node.name}</span>
                  </button>
                  <button
                    type="button"
                    className={OUTLINE_BUTTON}
                    disabled={pending}
                    onClick={() => onDelete(node)}
                  >
                    {copy.delete}
                    <span className="sr-only">: {node.name}</span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
