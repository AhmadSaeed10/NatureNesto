"use client";

import { useId } from "react";
import {
  Checkbox,
  OUTLINE_BUTTON,
  SelectInput,
  TEXT_BUTTON,
  TextArea,
  TextInput,
} from "@/components/admin/fields";
import { admin } from "@/content/admin";
import type { MediaPickerOption } from "@/lib/admin/products-shared";

const copy = admin.content.home;

export type FieldSpec =
  | { kind: "text"; key: string; label: string; hint?: string; multiline?: boolean }
  | {
      kind: "select";
      key: string;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  | { kind: "checkbox"; key: string; label: string }
  | { kind: "image"; key: string; label: string; alt: boolean }
  | { kind: "group"; key: string; label: string; fields: FieldSpec[] }
  | {
      kind: "list";
      key: string;
      label: string;
      item: FieldSpec[];
      max: number;
      blank: () => Record<string, unknown>;
      /** Short title for each item's fieldset legend. */
      title?: (item: Record<string, unknown>) => string;
    };

type Value = Record<string, unknown>;

const asObject = (value: unknown): Value =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Value) : {};
const asString = (value: unknown): string => (typeof value === "string" ? value : "");

interface FieldsProps {
  specs: FieldSpec[];
  value: Value;
  onChange: (next: Value) => void;
  media: MediaPickerOption[];
  /** Dotted paths of invalid fields from the server, e.g. "items.0.title". */
  invalid: Set<string>;
  path: string;
}

function Fields({ specs, value, onChange, media, invalid, path }: FieldsProps) {
  const uid = useId();
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  const at = (key: string) => (path ? `${path}.${key}` : key);
  const isInvalid = (key: string) =>
    [...invalid].some((p) => p === at(key) || p.startsWith(`${at(key)}.`));

  return specs.map((spec) => {
    const id = `${uid}-${spec.key}`;
    switch (spec.kind) {
      case "text": {
        const shared = {
          id,
          label: spec.label,
          hint: spec.hint,
          value: asString(value[spec.key]),
          error: isInvalid(spec.key) ? copy.invalid : undefined,
        };
        return spec.multiline ? (
          <TextArea
            key={spec.key}
            {...shared}
            rows={4}
            onChange={(event) => set(spec.key, event.target.value)}
          />
        ) : (
          <TextInput
            key={spec.key}
            {...shared}
            onChange={(event) => set(spec.key, event.target.value)}
          />
        );
      }
      case "select":
        return (
          <SelectInput
            key={spec.key}
            id={id}
            label={spec.label}
            value={asString(value[spec.key])}
            onChange={(event) => set(spec.key, event.target.value)}
          >
            {spec.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        );
      case "checkbox":
        return (
          <Checkbox
            key={spec.key}
            id={id}
            label={spec.label}
            checked={value[spec.key] === true}
            onChange={(event) => set(spec.key, event.target.checked)}
          />
        );
      case "image": {
        const image = asObject(value[spec.key]);
        const update = (patch: Value) => set(spec.key, { ...image, ...patch });
        return (
          <fieldset
            key={spec.key}
            className="flex flex-col gap-3 rounded-2xl border border-line p-4"
          >
            <legend className="px-1 text-sm font-medium">{spec.label}</legend>
            <TextInput
              id={`${id}-src`}
              label={admin.content.fields.imageSrc}
              value={asString(image.src)}
              error={isInvalid(spec.key) ? copy.invalid : undefined}
              onChange={(event) => update({ src: event.target.value })}
            />
            <SelectInput
              id={`${id}-pick`}
              label={copy.chooseImage}
              value=""
              onChange={(event) => {
                const picked = media.find((option) => option.id === event.target.value);
                if (picked) update({ src: picked.url });
              }}
            >
              <option value="">{copy.noImage}</option>
              {media.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
            {spec.alt ? (
              <TextInput
                id={`${id}-alt`}
                label={admin.content.fields.alt}
                hint={admin.content.fields.altHint}
                value={asString(image.alt)}
                onChange={(event) => update({ alt: event.target.value })}
              />
            ) : null}
          </fieldset>
        );
      }
      case "group":
        return (
          <fieldset
            key={spec.key}
            className="flex flex-col gap-3 rounded-2xl border border-line p-4"
          >
            <legend className="px-1 text-sm font-medium">{spec.label}</legend>
            <Fields
              specs={spec.fields}
              value={asObject(value[spec.key])}
              onChange={(next) => set(spec.key, next)}
              media={media}
              invalid={invalid}
              path={at(spec.key)}
            />
          </fieldset>
        );
      case "list": {
        const items = Array.isArray(value[spec.key])
          ? (value[spec.key] as unknown[]).map(asObject)
          : [];
        const update = (next: Value[]) => set(spec.key, next);
        const move = (from: number, to: number) => {
          if (to < 0 || to >= items.length) return;
          const next = [...items];
          const [item] = next.splice(from, 1);
          if (item) next.splice(to, 0, item);
          update(next);
        };
        return (
          <div key={spec.key} className="flex flex-col gap-3">
            <p className="text-sm font-medium">{spec.label}</p>
            {items.map((item, index) => {
              const title = spec.title?.(item) || copy.item(index + 1);
              return (
                <fieldset
                  key={index}
                  className="flex flex-col gap-3 rounded-2xl border border-line p-4"
                >
                  <legend className="px-1 text-sm font-medium">{title}</legend>
                  <Fields
                    specs={spec.item}
                    value={item}
                    onChange={(next) => update(items.map((it, i) => (i === index ? next : it)))}
                    media={media}
                    invalid={invalid}
                    path={`${at(spec.key)}.${index}`}
                  />
                  <div className="flex flex-wrap gap-x-4">
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      {copy.moveUp}
                      <span className="sr-only">: {title}</span>
                    </button>
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      {copy.moveDown}
                      <span className="sr-only">: {title}</span>
                    </button>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        className={TEXT_BUTTON}
                        onClick={() => update(items.filter((_, i) => i !== index))}
                      >
                        {copy.removeItem}
                        <span className="sr-only">: {title}</span>
                      </button>
                    ) : null}
                  </div>
                </fieldset>
              );
            })}
            {items.length < spec.max ? (
              <div>
                <button
                  type="button"
                  className={OUTLINE_BUTTON}
                  onClick={() => update([...items, spec.blank()])}
                >
                  {copy.addItem}
                </button>
              </div>
            ) : null}
          </div>
        );
      }
    }
  });
}

interface BlockFormProps {
  specs: FieldSpec[];
  value: Value;
  onChange: (next: Value) => void;
  media: MediaPickerOption[];
  invalid: Set<string>;
}

export function BlockForm(props: BlockFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Fields {...props} path="" />
    </div>
  );
}
