"use client";

import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { quote } from "@/content/quote";
import {
  QUOTE_FIELDS,
  quoteWhatsAppUrl,
  validateQuote,
  validateQuoteField,
  type QuoteErrors,
  type QuoteField,
  type QuoteValues,
} from "@/lib/quote";
import { FloatingField } from "./FloatingField";

interface QuoteFormProps {
  /** wa.me base link, without a query string. */
  whatsappHref: string;
  /** Preselects a service, for example on that service's own page. */
  defaultService?: string;
}

type FieldEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type BlurEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const isQuoteField = (name: string): name is QuoteField =>
  (QUOTE_FIELDS as readonly string[]).includes(name);

const readValues = (form: HTMLFormElement): QuoteValues => {
  const data = new FormData(form);
  const get = (key: QuoteField) => {
    const value = data.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    service: get("service"),
    name: get("name"),
    area: get("area"),
    phone: get("phone"),
    message: get("message"),
  };
};

/**
 * Request a quote over WhatsApp. Nothing is stored: the visitor's details become a
 * prefilled WhatsApp message they send themselves, so there is no backend to configure.
 */
export function QuoteForm({ whatsappHref, defaultService }: QuoteFormProps) {
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<QuoteValues | null>(null);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = readValues(event.currentTarget);
    const found = validateQuote(current);
    setValues(current);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = QUOTE_FIELDS.find((field) => found[field]);
      if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const url = quoteWhatsAppUrl(whatsappHref, current);
    // Opened inside the submit gesture so popup blockers allow it.
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
    requestAnimationFrame(() => status.current?.focus());
  };

  // While a field shows an error, re-check it as the visitor types, so it clears before
  // they reach the button and the layout never shifts under their pointer.
  const onChange = ({ target }: FieldEvent) => {
    if (!isQuoteField(target.name) || !errors[target.name]) return;
    setErrors((current) => ({
      ...current,
      [target.name]: validateQuoteField(target.name as QuoteField, target.value),
    }));
  };

  const onBlur = (event: BlurEvent) => {
    const { name, value } = event.target;
    if (!isQuoteField(name) || name === "message") return;
    if (event.relatedTarget instanceof HTMLButtonElement && event.relatedTarget.type === "submit") {
      return;
    }
    if (!value && !errors[name]) return;
    setErrors((current) => ({ ...current, [name]: validateQuoteField(name, value) }));
  };

  if (sentUrl) {
    return (
      <div ref={status} tabIndex={-1} role="status" className="outline-none">
        <p className="mb-3 font-serif text-h3 text-ink">{quote.sent.title}</p>
        <p className="mb-6 max-w-prose text-ink">{quote.sent.body}</p>
        <div className="flex flex-wrap gap-3">
          <Button href={sentUrl} target="_blank" rel="noopener noreferrer" withArrow>
            {quote.sent.again}
          </Button>
          <Button variant="secondary" onClick={() => setSentUrl(null)}>
            {quote.sent.edit}
          </Button>
        </div>
      </div>
    );
  }

  const f = quote.fields;
  const field = (name: QuoteField) => ({
    name,
    error: errors[name],
    defaultValue: values?.[name],
    onBlur,
    onChange,
  });
  const hasErrors = submitted && Object.values(errors).some(Boolean);

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="grid gap-5">
      {hasErrors ? (
        <p role="alert" className="text-small font-medium text-ink">
          {quote.errors.summary}
        </p>
      ) : null}
      <FloatingField
        {...field("service")}
        defaultValue={values?.service ?? defaultService}
        label={f.service.label}
        control="select"
        options={f.service.options}
        placeholderOption={quote.selectPlaceholder}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingField {...field("name")} label={f.name.label} autoComplete="name" required />
        <FloatingField
          {...field("phone")}
          label={f.phone.label}
          type="tel"
          autoComplete="tel"
          required
        />
      </div>
      <FloatingField
        {...field("area")}
        label={f.area.label}
        hint={f.area.hint}
        autoComplete="address-level2"
        required
      />
      <FloatingField {...field("message")} label={f.message.label} control="textarea" />
      <div>
        <Button type="submit" withArrow>
          {quote.submit}
        </Button>
      </div>
    </form>
  );
}
