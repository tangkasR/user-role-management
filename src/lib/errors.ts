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
