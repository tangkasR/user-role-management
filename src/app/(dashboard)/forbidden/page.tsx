// src/app/(dashboard)/forbidden/page.tsx   (file baru)
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Suspense } from "react";
import DashboardLoading from "../loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ForbiddenPage />
    </Suspense>
  );
}

function ForbiddenPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldX className="size-7" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        Akses ditolak
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Kamu tidak memiliki izin untuk membuka halaman ini.
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
