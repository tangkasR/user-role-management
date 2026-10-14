// src/modules/auth/components/RegisterForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { register } from "../auth.actions";
import { swalError } from "@/lib/swal";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-500";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);

  useEffect(() => {
    if (state?.error) swalError("Pendaftaran gagal", state.error);
  }, [state]);

  const err = (name: string) =>
    state?.fieldErrors?.[name] ? (
      <p className="mt-1 text-xs text-red-600">{state.fieldErrors[name]}</p>
    ) : null;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Daftar</h1>
      <p className="mt-1 text-sm text-gray-500">Buat akun baru</p>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Nama
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            autoFocus
            defaultValue={state?.values?.name}
            aria-invalid={!!state?.fieldErrors?.name}
            className={inputCls}
          />
          {err("name")}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.values?.email}
            aria-invalid={!!state?.fieldErrors?.email}
            className={inputCls}
          />
          {err("email")}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!state?.fieldErrors?.password}
            className={inputCls}
          />
          {err("password")}
          <p className="mt-1 text-xs text-gray-400">
            Minimal 8 karakter, mengandung huruf dan angka
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Konfirmasi password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!state?.fieldErrors?.confirmPassword}
            className={inputCls}
          />
          {err("confirmPassword")}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
