// src/lib/utils.ts
import type { ZodError } from "zod";
import type { ListParams } from "@/lib/validations";

// Ubah error Zod menjadi { namaField: "pesan pertama" }
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

// Zona waktu dikunci supaya hasil render server dan browser sama (tanpa hydration mismatch)
export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function listParamsToSearch({ page, limit, q }: ListParams) {
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) sp.set("q", q);
  return sp.toString();
}
