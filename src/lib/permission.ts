// src/lib/permission.ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import {
  ACTIONS,
  ACTION_COLUMN,
  type Action,
  type FeatureKey,
  type PermissionMap,
} from "@/lib/constants";

// Satu role → satu query. cache(): dalam satu request tidak query berulang.
export const getPermissionMap = cache(
  async (roleId: string): Promise<PermissionMap> => {
    const rows = await prisma.rolePermission.findMany({
      where: { roleId },
      select: {
        isRead: true,
        isAdd: true,
        isEdit: true,
        isDelete: true,
        feature: { select: { key: true, availableActions: true } },
      },
    });

    const map: PermissionMap = {};
    for (const row of rows) {
      map[row.feature.key] = ACTIONS.filter(
        (a) => row[ACTION_COLUMN[a]] && row.feature.availableActions.includes(a)
      );
    }
    return map;
  }
);

// Untuk Server Action dan Route Handler: melempar error kalau tidak berhak
export async function requirePermission(feature: FeatureKey, action: Action) {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();

  const map = await getPermissionMap(session.roleId);
  if (!map[feature]?.includes(action)) throw new ForbiddenError();

  return session;
}

// Untuk page.tsx: mengarahkan ke halaman yang sesuai kalau tidak berhak
export async function requirePageAccess(
  feature: FeatureKey,
  action: Action = "read"
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const map = await getPermissionMap(session.roleId);
  if (!map[feature]?.includes(action)) redirect("/forbidden");

  return session;
}
