// src/lib/utils.ts
import type { ZodError } from "zod";

// Ubah error Zod menjadi { namaField: "pesan pertama" }
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
