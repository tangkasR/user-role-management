// src/modules/auth/components/LoginForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { login } from "../auth.actions";
import { swalError } from "@/lib/swal";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  useEffect(() => {
    if (state?.error) swalError("Login gagal", state.error);
  }, [state]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Masuk</h1>
      <p className="mt-1 text-sm text-gray-500">
        Masuk ke akunmu untuk melanjutkan
      </p>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
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
            autoFocus
            defaultValue={state?.values?.email}
            aria-invalid={!!state?.fieldErrors?.email}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500"
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.email}
            </p>
          )}
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
            autoComplete="current-password"
            aria-invalid={!!state?.fieldErrors?.password}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-500"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
