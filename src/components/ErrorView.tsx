/* eslint-disable @next/next/no-location-assign-relative-destination */
// src/components/ErrorView.tsx
"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  fullScreen?: boolean;
};

export default function ErrorView({ error, reset, fullScreen }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`flex items-center justify-center p-6 ${
        fullScreen ? "min-h-screen bg-gray-50" : "mt-16"
      }`}
    >
      <div role="alert" className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Terjadi kesalahan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Halaman ini gagal dimuat. Coba lagi, atau kembali ke dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-gray-400">
            Kode referensi: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Coba lagi
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/dashboard")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ke dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
