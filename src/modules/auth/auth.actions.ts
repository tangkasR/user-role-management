// src/modules/auth/auth.actions.ts
"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema, type AuthFormState } from "./auth.schema";
import { authenticate, registerUser } from "./auth.service";
import { createSession, deleteSession } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { zodFieldErrors } from "@/lib/utils";
import { headers } from "next/headers";
// IP hanya bisa dipercaya bila aplikasi berada di belakang proxy yang mengisi header ini
async function clientIp() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return ip.slice(0, 64); // sesuai panjang kolom
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: str(formData.get("email")),
    password: str(formData.get("password")),
  };
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success)
    return { fieldErrors: zodFieldErrors(parsed.error), values };

  let userId: string | null;
  try {
    userId = await authenticate(parsed.data, await clientIp());
  } catch (e) {
    if (e instanceof AppError) return { error: e.message, values };
    console.error("[login]", e);
    return { error: "Terjadi kesalahan pada server", values };
  }

  // pesan generik: jangan membocorkan email mana yang terdaftar
  if (!userId) return { error: "Email atau password salah", values };

  await createSession(userId);
  redirect("/dashboard");
}

export async function register(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    password: str(formData.get("password")),
    confirmPassword: str(formData.get("confirmPassword")),
  };
  const values = { name: raw.name, email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success)
    return { fieldErrors: zodFieldErrors(parsed.error), values };

  let userId: string;
  try {
    userId = await registerUser(parsed.data);
  } catch (e) {
    if (e instanceof AppError) {
      return e.field
        ? { fieldErrors: { [e.field]: e.message }, values }
        : { error: e.message, values };
    }
    console.error("[register]", e);
    return { error: "Terjadi kesalahan pada server", values };
  }

  await createSession(userId);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
