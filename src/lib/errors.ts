// src/lib/errors.ts
// Error "yang diharapkan" (aturan bisnis), pesannya aman ditampilkan ke user
export class AppError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "AppError";
    this.field = field; // kalau diisi, pesan ditampilkan di bawah input itu
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Sesi berakhir, silakan login kembali");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("Kamu tidak memiliki izin untuk melakukan aksi ini");
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  fieldErrors: Record<string, string>;

  constructor(
    fieldErrors: Record<string, string>,
    message = "Periksa kembali isian form"
  ) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

// Kode error Prisma (misalnya "P2002" untuk pelanggaran unique)
export function errorCode(e: unknown): string | undefined {
  return typeof e === "object" && e !== null && "code" in e
    ? String(e.code)
    : undefined;
}
