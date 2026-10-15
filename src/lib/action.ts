import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { AppError, ValidationError } from "@/lib/errors";
import { zodFieldErrors } from "@/lib/utils";

export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

// Validasi input dengan Zod; kalau gagal melempar ValidationError
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown
): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(zodFieldErrors(result.error));
  return result.data;
}

export async function handleAction<T>(
  fn: () => Promise<T>,
  successMessage?: string
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: successMessage };
  } catch (e) {
    unstable_rethrow(e); // biarkan redirect()/notFound() lewat

    if (e instanceof ValidationError) {
      return { ok: false, message: e.message, fieldErrors: e.fieldErrors };
    }
    if (e instanceof AppError) {
      return {
        ok: false,
        message: e.message,
        fieldErrors: e.field ? { [e.field]: e.message } : undefined,
      };
    }
    console.error("[action]", e);
    return { ok: false, message: "Terjadi kesalahan pada server" };
  }
}
