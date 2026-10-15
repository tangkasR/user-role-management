// src/lib/api.ts
import { NextResponse } from "next/server";
import { AppError, ForbiddenError, UnauthorizedError } from "@/lib/errors";

// Mengubah error menjadi respons JSON dengan status code yang benar
export function apiError(e: unknown) {
  if (e instanceof UnauthorizedError)
    return NextResponse.json({ message: e.message }, { status: 401 });
  if (e instanceof ForbiddenError)
    return NextResponse.json({ message: e.message }, { status: 403 });
  if (e instanceof AppError)
    return NextResponse.json({ message: e.message }, { status: 400 });

  console.error("[api]", e);
  return NextResponse.json(
    { message: "Terjadi kesalahan pada server" },
    { status: 500 }
  );
}

// Data per user: jangan pernah disimpan di cache bersama
export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };
