"use client";

import Image from "next/image";
import { type DragEvent, useId, useState } from "react";
import { OUTLINE_BUTTON, SelectInput, TEXT_BUTTON, TextInput } from "@/components/admin/fields";
import { admin } from "@/content/admin";
import type { EditorImage, MediaPickerOption } from "@/lib/admin/products";
import { cn } from "@/lib/utils";

const copy = admin.productEditor.media;

interface ImageListProps {
  images: EditorImage[];
  onChange: (images: EditorImage[]) => void;
  media: MediaPickerOption[];
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

/**
 * Ordered product images. Pointer users drag to reorder; keyboard and screen reader users
 * get explicit move buttons, so drag and drop is never the only way.
 */
export function ImageList({ images, onChange, media }: ImageListProps) {
  const uid = useId();
  const [dragging, setDragging] = useState<number | null>(null);
  const [choice, setChoice] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const available = media.filter((option) => !images.some((image) => image.media_id === option.id));

  const reorder = (from: number, to: number) => {
    const next = move(images, from, to);
    if (next === images) return;
    onChange(next);
    setAnnouncement(copy.position(to + 1, images.length));
  };

  function onDrop(event: DragEvent<HTMLLIElement>, to: number) {
    event.preventDefault();
    if (dragging !== null) reorder(dragging, to);
    setDragging(null);
  }

  function add() {
    const option = media.find((item) => item.id === choice);
    if (!option) return;
    onChange([...images, { media_id: option.id, alt: "", url: option.url, label: option.label }]);
    setChoice("");
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length === 0 ? (
        <p className="text-sm text-ink-muted">{copy.empty}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li
              key={image.media_id}
              draggable
              onDragStart={() => setDragging(index)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, index)}
              className={cn(
                "grid cursor-grab grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-line p-3 md:grid-cols-[4.5rem_minmax(0,1fr)_auto]",
                dragging === index && "opacity-50",
              )}
            >
              <div className="relative size-18 overflow-hidden rounded-xl bg-surface">
                {image.url ? (
                  <Image src={image.url} alt="" fill sizes="72px" className="object-cover" />
                ) : null}
              </div>
              <TextInput
                id={`${uid}-alt-${image.media_id}`}
                label={`${copy.position(index + 1, images.length)}: ${image.label}`}
                value={image.alt}
                placeholder={admin.media.item.alt}
                onChange={(event) =>
                  onChange(
                    images.map((item, i) =>
                      i === index ? { ...item, alt: event.target.value } : item,
                    ),
                  )
                }
              />
              <div className="col-span-2 flex flex-wrap items-center gap-x-4 md:col-span-1">
                <button
                  type="button"
                  className={TEXT_BUTTON}
                  disabled={index === 0}
                  onClick={() => reorder(index, index - 1)}
                >
                  {copy.moveUp}
                </button>
                <button
                  type="button"
                  className={TEXT_BUTTON}
                  disabled={index === images.length - 1}
                  onClick={() => reorder(index, index + 1)}
                >
                  {copy.moveDown}
                </button>
                <button
                  type="button"
                  className={TEXT_BUTTON}
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                >
                  {copy.remove}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <SelectInput
          id={`${uid}-add`}
          label={copy.choose}
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
        >
          <option value="">{copy.none}</option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <button type="button" className={OUTLINE_BUTTON} disabled={!choice} onClick={add}>
          {copy.add}
        </button>
      </div>
    </div>
  );
}
