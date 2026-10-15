// src/app/(dashboard)/not-found.tsx   (file baru)
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Suspense } from "react";
import DashboardLoading from "./loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardNotFound />
    </Suspense>
  );
}

function DashboardNotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <SearchX className="size-7" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        Data tidak ditemukan
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Halaman atau data yang kamu cari tidak ada.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Kembali ke dashboard
      </Link>
    </div>
  );
}
