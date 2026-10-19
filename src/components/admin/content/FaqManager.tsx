"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import { deleteDoc, saveFaq } from "@/app/actions/admin-content-docs";
import { Checkbox, OUTLINE_BUTTON, TEXT_BUTTON, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import type { FaqForEditor } from "@/lib/admin/content";
import { RichTextEditor } from "./RichTextEditor";

const copy = admin.content;

function FaqForm({
  item,
  nextPosition,
  onDone,
}: {
  item: FaqForEditor | null;
  nextPosition: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const uid = useId();
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [position, setPosition] = useState(String(item?.position ?? nextPosition));
  const [published, setPublished] = useState(item?.published ?? true);
  const [message, setMessage] = useState("");
  const [bad, setBad] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveFaq({
        id: item?.id ?? "",
        question,
        answer,
        category,
        position,
        published,
      });
      if (!result.ok) {
        setBad(new Set(result.fields ?? []));
        setMessage(result.error === "forbidden" ? admin.form.forbidden : copy.docs.invalid);
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-line p-4"
    >
      <TextInput
        id={`${uid}-q`}
        label={copy.faq.question}
        value={question}
        required
        error={bad.has("question") ? copy.docs.invalid : undefined}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <RichTextEditor
        label={copy.faq.answer}
        value={answer}
        onChange={setAnswer}
        rows={6}
        invalid={bad.has("answer")}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
        <TextInput
          id={`${uid}-cat`}
          label={copy.faq.category}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <TextInput
          id={`${uid}-pos`}
          label={admin.content.fields.number}
          inputMode="numeric"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
        />
      </div>
      <Checkbox
        id={`${uid}-pub`}
        label={copy.docs.published}
        checked={published}
        onChange={(event) => setPublished(event.target.checked)}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? admin.form.saving : copy.docs.save}
        </Button>
        <button type="button" className={TEXT_BUTTON} onClick={onDone}>
          {admin.form.cancel}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}

export function FaqManager({ items }: { items: FaqForEditor[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nextPosition = items.reduce((max, item) => Math.max(max, item.position + 1), 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-2xl text-ink-muted">{copy.faq.intro}</p>
      {editing === "new" ? (
        <FaqForm item={null} nextPosition={nextPosition} onDone={() => setEditing(null)} />
      ) : (
        <div>
          <button type="button" className={OUTLINE_BUTTON} onClick={() => setEditing("new")}>
            {copy.faq.add}
          </button>
        </div>
      )}
      {items.length === 0 ? <p className="text-ink-muted">{copy.docs.empty}</p> : null}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            {editing === item.id ? (
              <FaqForm item={item} nextPosition={nextPosition} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-background p-4">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{item.question}</span>
                  <span className="text-sm text-ink-muted">
                    {[
                      String(item.position),
                      item.category,
                      item.published ? copy.status.published : copy.status.draft,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button type="button" className={TEXT_BUTTON} onClick={() => setEditing(item.id)}>
                    {admin.media.item.edit}
                    <span className="sr-only">: {item.question}</span>
                  </button>
                  <button
                    type="button"
                    className={TEXT_BUTTON}
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(copy.docs.deleteConfirm)) return;
                      startTransition(async () => {
                        await deleteDoc("faq", item.id);
                        router.refresh();
                      });
                    }}
                  >
                    {copy.docs.delete}
                    <span className="sr-only">: {item.question}</span>
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
