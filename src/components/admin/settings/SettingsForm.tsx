"use client";

import { useActionState, useId } from "react";
import { type SettingsState, saveSettings } from "@/app/actions/admin-settings";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";

export type SettingsField =
  | {
      kind: "text";
      name: string;
      label: string;
      hint?: string;
      type?: "text" | "email";
      multiline?: boolean;
    }
  | { kind: "checkbox"; name: string; label: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] };

interface SettingsFormProps {
  section: string;
  fields: SettingsField[];
  values: Record<string, string | boolean>;
}

const INITIAL: SettingsState = { status: "idle" };
const copy = admin.form;
const MESSAGES: Record<SettingsState["status"], string> = {
  idle: "",
  saved: copy.saved,
  invalid: copy.invalid,
  forbidden: copy.forbidden,
  failed: copy.failed,
};

const SELECT =
  "block min-h-(--size-tap) w-full rounded-2xl border border-ink-muted bg-background px-4 text-ink";

export function SettingsForm({ section, fields, values }: SettingsFormProps) {
  const [state, action, pending] = useActionState(saveSettings, INITIAL);
  const formId = useId();
  const invalid = new Set(state.fieldErrors ?? []);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="section" value={section} />
      {fields.map((field) => {
        const id = `${formId}-${field.name}`;
        const value = values[field.name];
        if (field.kind === "checkbox") {
          return (
            <div key={field.name} className="flex min-h-(--size-tap) items-center gap-3">
              <input
                id={id}
                name={field.name}
                type="checkbox"
                defaultChecked={value === true}
                className="size-5 accent-primary-dark"
              />
              <label htmlFor={id}>{field.label}</label>
            </div>
          );
        }
        if (field.kind === "select") {
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={id} className="text-sm font-medium">
                {field.label}
              </label>
              <select
                id={id}
                name={field.name}
                defaultValue={String(value ?? "")}
                className={SELECT}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <FloatingField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            control={field.multiline ? "textarea" : "input"}
            hint={field.hint}
            defaultValue={String(value ?? "")}
            error={invalid.has(field.name) ? copy.invalid : undefined}
          />
        );
      })}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? copy.saving : copy.save}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {MESSAGES[state.status]}
        </p>
      </div>
    </form>
  );
}
