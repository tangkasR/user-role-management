// src/app/(dashboard)/roles/page.tsx
import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/permission";
import { listParamsSchema } from "@/lib/validations";
import { getRoles } from "@/modules/role/role.queries";
import RoleTable from "@/modules/role/components/RoleTable";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";
import DashboardLoading from "../loading";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function page({ searchParams }: Props) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RolesPage searchParams={searchParams} />
    </Suspense>
  );
}

async function RolesPage({ searchParams }: Props) {
  await requirePageAccess("role", "read");

  const params = listParamsSchema.parse(await searchParams);
  const { items, total, totalPages } = await getRoles(params);

  if (params.page > totalPages) {
    const sp = new URLSearchParams({
      page: String(totalPages),
      limit: String(params.limit),
    });
    if (params.q) sp.set("q", params.q);
    redirect(`/roles?${sp.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
        <p className="text-sm text-gray-500">
          Kelola role pengguna dan atur izin tiap role.
        </p>
      </div>

      <div>
        <RoleTable items={items} offset={(params.page - 1) * params.limit} />
        <Pagination
          page={params.page}
          totalPages={totalPages}
          total={total}
          limit={params.limit}
        />
      </div>
    </div>
  );
}
