// src/app/(dashboard)/roles/[id]/permissions/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePageAccess } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { getRolePermissionMatrix } from "@/modules/role-permission/role-permission.queries";
import PermissionMatrix from "@/modules/role-permission/components/PermissionMatrix";
import { Suspense } from "react";
import DashboardLoading from "@/app/(dashboard)/loading";

type Props = { params: Promise<{ id: string }> };

export default function page({ params }: Props) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RolePermissionsPage params={params} />
    </Suspense>
  );
}

async function RolePermissionsPage({ params }: Props) {
  const session = await requirePageAccess("role-permission", "read");

  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound(); // bukan UUID: jangan sampai ke query

  const data = await getRolePermissionMatrix(id);
  if (!data) notFound();

  // berubah saat data di server berubah → komponen dibuat ulang dengan baseline baru
  const signature = data.features
    .map(
      (f) => `${f.id}|${f.availableActions.join(",")}|${f.granted.join(",")}`
    )
    .join(";");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/roles"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Roles
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Izin role: {data.role.name}
        </h1>
        {data.role.desc && (
          <p className="text-sm text-gray-500">{data.role.desc}</p>
        )}
      </div>

      <PermissionMatrix
        key={signature}
        roleId={data.role.id}
        features={data.features}
        isSuperAdmin={data.role.isSuperAdmin}
        isOwnRole={session.roleId === data.role.id}
      />
    </div>
  );
}
