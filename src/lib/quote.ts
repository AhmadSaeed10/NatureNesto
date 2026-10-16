import { quote } from "@/content/quote";
import { validateField } from "./enquiry";

export const QUOTE_FIELDS = ["service", "name", "area", "phone", "message"] as const;
export type QuoteField = (typeof QUOTE_FIELDS)[number];
export type QuoteValues = Record<QuoteField, string>;
export type QuoteErrors = Partial<Record<QuoteField, string>>;

export function validateQuoteField(field: QuoteField, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case "service":
      return quote.fields.service.options.includes(value) ? undefined : quote.errors.service;
    case "name":
      return validateField("name", value) ? quote.errors.name : undefined;
    case "area":
      return value.length >= 2 ? undefined : quote.errors.area;
    case "phone":
      // Required here: WhatsApp needs a number to reply to.
      return value && !validateField("phone", value) ? undefined : quote.errors.phone;
    case "message":
      return undefined;
  }
}

export function validateQuote(values: QuoteValues): QuoteErrors {
  const errors: QuoteErrors = {};
  for (const field of QUOTE_FIELDS) {
    const error = validateQuoteField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

/** wa.me link with the request as a prefilled message. Empty lines are left out. */
export function quoteWhatsAppUrl(base: string, values: QuoteValues): string {
  const m = quote.message;
  const lines = [
    m.greeting,
    "",
    `${m.service}: ${values.service}`,
    `${m.name}: ${values.name.trim()}`,
    `${m.area}: ${values.area.trim()}`,
    `${m.phone}: ${values.phone.trim()}`,
    values.message.trim() ? `${m.details}: ${values.message.trim()}` : "",
  ].filter((line, index) => line !== "" || index === 1);
  return `${base}?text=${encodeURIComponent(lines.join("\n"))}`;
}
