"use server";

import { z } from "zod";
import { getStaff } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PasswordState {
  status: "idle" | "done" | "short" | "mismatch" | "forbidden" | "failed";
}

// Supabase Auth hashes with bcrypt, which reads at most 72 bytes.
const PASSWORD = z.string().min(10).max(72);

export async function setPassword(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  if (!(await getStaff())) return { status: "forbidden" };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!PASSWORD.safeParse(password).success) return { status: "short" };
  if (password !== confirm) return { status: "mismatch" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[account] password update failed", error.message);
    return { status: "failed" };
  }
  return { status: "done" };
}
