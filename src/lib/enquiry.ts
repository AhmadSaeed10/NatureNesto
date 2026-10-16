import { forms } from "@/content/forms";

export type EnquiryKind = "contact" | "consultation";

export const FIELDS = {
  contact: ["name", "email", "phone", "message"],
  consultation: ["name", "email", "phone", "spaceType", "service", "details"],
} as const;

export type FieldName = (typeof FIELDS)[EnquiryKind][number];
export type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with optional +, spaces, dashes or brackets; 7 to 15 digits overall.
const PHONE = /^\+?[\d\s()-]{7,20}$/;
const MIN_MESSAGE = 10;

/** Shared by the client (inline, on blur) and the server action (authoritative). */
export function validateField(field: FieldName, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case "name":
      return value.length >= 2 ? undefined : forms.errors.name;
    case "email":
      return EMAIL.test(value) ? undefined : forms.errors.email;
    case "phone": {
      if (!value) return undefined;
      const digits = value.replace(/\D/g, "").length;
      return PHONE.test(value) && digits >= 7 && digits <= 15 ? undefined : forms.errors.phone;
    }
    case "message":
      return value.length >= MIN_MESSAGE ? undefined : forms.errors.message;
    case "details":
      return value.length >= MIN_MESSAGE ? undefined : forms.errors.details;
    case "spaceType":
      return (forms.fields.spaceType.options as readonly string[]).includes(value)
        ? undefined
        : forms.errors.spaceType;
    case "service":
      return forms.fields.service.options.includes(value) ? undefined : forms.errors.service;
  }
}

export function validateEnquiry(kind: EnquiryKind, values: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELDS[kind]) {
    const error = validateField(field, values[field] ?? "");
    if (error) errors[field] = error;
  }
  return errors;
}
