import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// Compact labelled controls for dense admin forms. The storefront keeps FloatingField.
export const CONTROL =
  "block min-h-(--size-tap) w-full rounded-xl border border-ink-muted bg-background px-3 text-ink outline-none focus:border-primary-dark focus:shadow-[0_0_0_3px_var(--color-primary-dark)] aria-invalid:border-2 aria-invalid:border-ink disabled:bg-surface disabled:text-ink-muted";

interface WrapProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function Wrap({ id, label, hint, error, className, children }: WrapProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, hint?: string, error?: string): string | undefined =>
  [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

type Common = { id: string; label: string; hint?: string; error?: string; className?: string };

export function TextInput({
  id,
  label,
  hint,
  error,
  className,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={CONTROL}
        {...rest}
      />
    </Wrap>
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  className,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={6}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(CONTROL, "py-2")}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectInput({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <select id={id} aria-describedby={describedBy(id, hint, error)} className={CONTROL} {...rest}>
        {children}
      </select>
    </Wrap>
  );
}

export function Checkbox({
  id,
  label,
  className,
  ...rest
}: { id: string; label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex min-h-(--size-tap) items-center gap-3", className)}>
      <input id={id} type="checkbox" className="size-5 shrink-0 accent-primary-dark" {...rest} />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

export const TEXT_BUTTON =
  "inline-flex min-h-(--size-tap) items-center text-sm text-primary-dark underline-offset-4 hover:underline disabled:opacity-50";
export const OUTLINE_BUTTON =
  "inline-flex min-h-(--size-tap) items-center justify-center rounded-pill border border-ink px-5 text-sm text-ink disabled:opacity-50";
