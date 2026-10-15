// src/modules/role-permission/role-permission.service.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { ROLE_SUPER_ADMIN, actionsToFlags } from "@/lib/constants";
import type { PermissionEntryInput } from "./role-permission.schema";

export async function saveRolePermissions(
  roleId: string,
  entries: PermissionEntryInput[]
) {
  return prisma.$transaction(async (tx) => {
    const role = await tx.role.findUnique({
      where: { id: roleId },
      select: { name: true },
    });
    if (!role) throw new AppError("Role tidak ditemukan");

    if (role.name === ROLE_SUPER_ADMIN) {
      throw new AppError("Izin Super Admin tidak dapat diubah");
    }

    const features = await tx.feature.findMany({
      select: { id: true, name: true, availableActions: true },
    });
    const featureById = new Map(features.map((f) => [f.id, f]));

    // validasi di server: aksi harus ada di availableActions feature
    for (const entry of entries) {
      const feature = featureById.get(entry.featureId);
      if (!feature) {
        throw new AppError(
          "Ada feature yang sudah tidak ada. Muat ulang halaman lalu coba lagi."
        );
      }

      const invalid = entry.actions.filter(
        (a) => !feature.availableActions.includes(a)
      );
      if (invalid.length > 0) {
        throw new AppError(
          `Aksi ${invalid.join(", ")} tidak tersedia pada feature "${
            feature.name
          }". Muat ulang halaman lalu coba lagi.`
        );
      }
    }

    // lengkapi baris yang kurang (default semua false), tanpa menimpa yang sudah ada
    await tx.rolePermission.createMany({
      data: features.map((f) => ({ roleId, featureId: f.id })),
      skipDuplicates: true,
    });

    for (const entry of entries) {
      await tx.rolePermission.update({
        where: { roleId_featureId: { roleId, featureId: entry.featureId } },
        data: actionsToFlags(entry.actions),
      });
    }

    return { updated: entries.length };
  });
}
