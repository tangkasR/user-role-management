// src/app/(dashboard)/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPermissionMap } from "@/lib/permission";
import { NAV_GROUPS } from "@/lib/navigation";
import { Suspense } from "react";
import DashboardLoading from "../loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPage />
    </Suspense>
  );
}

async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = await getPermissionMap(session.roleId);
  const items = NAV_GROUPS.flatMap((g) => g.items).filter(
    (i) =>
      i.href !== "/dashboard" &&
      i.feature &&
      permissions[i.feature]?.includes("read")
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Halo, {session.name}
        </h1>
        <p className="text-sm text-gray-500">Role: {session.roleName}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="font-medium text-gray-900">
            Belum ada fitur yang bisa kamu akses
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Hubungi administrator untuk mendapatkan izin pada role{" "}
            {session.roleName}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </span>
              <span className="font-medium text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
