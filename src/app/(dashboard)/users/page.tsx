// src/app/(dashboard)/users/page.tsx
import { requirePageAccess } from "@/lib/permission";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import { getRoleOptions } from "@/modules/user/user.queries";
import UserTable from "@/modules/user/components/UserTable";
import DashboardLoading from "../loading";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <UsersPage />
    </Suspense>
  );
}

async function UsersPage() {
  const session = await requirePageAccess("user", "read");
  const actorIsSuperAdmin = session.roleName === ROLE_SUPER_ADMIN;
  const roles = await getRoleOptions(actorIsSuperAdmin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">
          Kelola akun pengguna dan role-nya.
        </p>
      </div>

      <UserTable
        roles={roles}
        currentUserId={session.userId}
        actorIsSuperAdmin={actorIsSuperAdmin}
      />
    </div>
  );
}
