"use server";

import { FIELDS, validateEnquiry, type EnquiryKind, type FieldErrors } from "@/lib/enquiry";

export interface EnquiryState {
  status: "idle" | "invalid" | "not_connected";
  errors: FieldErrors;
  values: Record<string, string>;
}

const isKind = (value: unknown): value is EnquiryKind =>
  value === "contact" || value === "consultation";

/**
 * Validates on the server and reports that delivery is not configured yet. When a
 * delivery method is chosen (email service, form service), send here after validation.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const kind = formData.get("kind");
  if (!isKind(kind)) return { status: "invalid", errors: {}, values: {} };

  const values: Record<string, string> = {};
  for (const field of FIELDS[kind]) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }

  // Honeypot: real visitors never see this field, so a value means a bot. Answer the same
  // way as a real submission so bots learn nothing.
  if (formData.get("company")) return { status: "not_connected", errors: {}, values: {} };

  const errors = validateEnquiry(kind, values);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values };

  return { status: "not_connected", errors: {}, values: {} };
}
