"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  discardSectionDraft,
  publishSection,
  saveSectionDraft,
  setSectionVisible,
} from "@/app/actions/admin-content-home";
import { AdminCard } from "@/components/admin/AdminPage";
import { OUTLINE_BUTTON, TEXT_BUTTON } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { MediaPickerOption } from "@/lib/admin/products-shared";
import type { HomeSectionType } from "@/lib/cms/sections";
import { toHandle } from "@/lib/handle";
import { BlockForm } from "./BlockForm";
import { SECTION_SPECS } from "./section-specs";

const copy = admin.content.home;
type Value = Record<string, unknown>;

/** New list items need a key; derive it from the title when left empty. */
function withKeys(type: HomeSectionType, value: Value): Value {
  const listKey = type === "services" ? "services" : type === "plants" ? "categories" : null;
  if (!listKey || !Array.isArray(value[listKey])) return value;
  return {
    ...value,
    [listKey]: (value[listKey] as Value[]).map((item) =>
      typeof item.slug === "string" && item.slug.trim()
        ? item
        : { ...item, slug: toHandle(typeof item.title === "string" ? item.title : "") },
    ),
  };
}

interface SectionEditorProps {
  type: HomeSectionType;
  initial: Value;
  hasDraft: boolean;
  visible: boolean;
  media: MediaPickerOption[];
}

export function SectionEditor({ type, initial, hasDraft, visible, media }: SectionEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState<Value>(initial);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const errorMessage = (error: "invalid" | "forbidden" | "failed") =>
    error === "invalid"
      ? copy.invalid
      : error === "forbidden"
        ? admin.form.forbidden
        : admin.form.failed;

  async function save(): Promise<boolean> {
    const result = await saveSectionDraft(type, withKeys(type, value));
    if (!result.ok) {
      setInvalid(new Set(result.paths ?? []));
      setMessage(errorMessage(result.error));
      return false;
    }
    setInvalid(new Set());
    setDirty(false);
    return true;
  }

  const run = (task: () => Promise<string | null>) =>
    startTransition(async () => {
      const done = await task();
      if (done) {
        setMessage(done);
        router.refresh();
      }
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/content" className={TEXT_BUTTON}>
          {copy.back}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {/* Preview shows saved drafts, so it opens after a save. */}
          <a href="/preview" target="_blank" rel="noopener" className={OUTLINE_BUTTON}>
            {copy.preview}
          </a>
          <button
            type="button"
            className={OUTLINE_BUTTON}
            disabled={pending}
            onClick={() =>
              run(async () => {
                const result = await setSectionVisible(type, !visible);
                return result.ok ? copy.visibilityChanged : errorMessage(result.error);
              })
            }
          >
            {visible ? copy.hide : copy.show}
          </button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(async () => ((await save()) ? copy.saved : null))}
          >
            {copy.saveDraft}
          </Button>
          <Button
            type="button"
            disabled={pending || (!hasDraft && !dirty)}
            onClick={() =>
              run(async () => {
                if (dirty && !(await save())) return null;
                const result = await publishSection(type);
                return result.ok ? copy.published : errorMessage(result.error);
              })
            }
          >
            {copy.publish}
          </Button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
        {message}
      </p>

      <AdminCard title={copy.sections[type]}>
        <BlockForm
          specs={SECTION_SPECS[type]}
          value={value}
          media={media}
          invalid={invalid}
          onChange={(next) => {
            setValue(next);
            setDirty(true);
          }}
        />
      </AdminCard>

      {hasDraft ? (
        <div>
          <button
            type="button"
            className={TEXT_BUTTON}
            disabled={pending}
            onClick={() => {
              if (!window.confirm(copy.discardConfirm)) return;
              run(async () => {
                const result = await discardSectionDraft(type);
                if (!result.ok) return errorMessage(result.error);
                // Reload so the form shows the live version again.
                window.location.reload();
                return copy.discarded;
              });
            }}
          >
            {copy.discard}
          </button>
        </div>
      ) : null}
    </div>
  );
}
