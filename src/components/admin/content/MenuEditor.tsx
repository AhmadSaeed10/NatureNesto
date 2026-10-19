"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { saveMenu } from "@/app/actions/admin-content-site";
import { AdminCard } from "@/components/admin/AdminPage";
import { OUTLINE_BUTTON, TEXT_BUTTON, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { MenuForEditor } from "@/lib/admin/content";

const copy = admin.content.navigation;

export function MenuEditor({ menu }: { menu: MenuForEditor }) {
  const router = useRouter();
  const uid = useId();
  const [items, setItems] = useState(menu.items);
  const [message, setMessage] = useState("");
  const [badIndex, setBadIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  // The header button is a single link; other menus are lists.
  const single = menu.handle === "header-cta";

  const update = (index: number, patch: Partial<{ label: string; href: string }>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (from: number, to: number) =>
    setItems((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });

  function save() {
    setMessage("");
    setBadIndex(null);
    startTransition(async () => {
      const result = await saveMenu({ menuId: menu.id, items });
      if (result.ok) {
        setMessage(admin.form.saved);
        router.refresh();
      } else {
        setBadIndex(result.index ?? null);
        setMessage(result.error === "forbidden" ? admin.form.forbidden : admin.form.invalid);
      }
    });
  }

  return (
    <AdminCard title={menu.title}>
      {items.length === 0 ? <p className="text-sm text-ink-muted">{copy.empty}</p> : null}
      <ol className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-line p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <TextInput
              id={`${uid}-${index}-label`}
              label={copy.label}
              value={item.label}
              error={badIndex === index ? admin.form.invalid : undefined}
              onChange={(event) => update(index, { label: event.target.value })}
            />
            <TextInput
              id={`${uid}-${index}-href`}
              label={copy.href}
              value={item.href}
              onChange={(event) => update(index, { href: event.target.value })}
            />
            <div className="flex flex-wrap gap-x-3">
              {!single ? (
                <>
                  <button
                    type="button"
                    className={TEXT_BUTTON}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    {admin.content.home.moveUp}
                    <span className="sr-only">: {item.label}</span>
                  </button>
                  <button
                    type="button"
                    className={TEXT_BUTTON}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    {admin.content.home.moveDown}
                    <span className="sr-only">: {item.label}</span>
                  </button>
                  <button
                    type="button"
                    className={TEXT_BUTTON}
                    onClick={() => setItems((list) => list.filter((_, i) => i !== index))}
                  >
                    {admin.content.home.removeItem}
                    <span className="sr-only">: {item.label}</span>
                  </button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        {!single || items.length === 0 ? (
          <button
            type="button"
            className={OUTLINE_BUTTON}
            onClick={() => setItems((list) => [...list, { label: "", href: "/" }])}
          >
            {copy.add}
          </button>
        ) : null}
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? admin.form.saving : copy.save}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
      </div>
    </AdminCard>
  );
}
