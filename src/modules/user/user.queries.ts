// src/modules/user/user.queries.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import type { ListParams } from "@/lib/validations";
import type { RoleOption, UserRow } from "./user.schema";

export async function getUsers({ page, limit, q }: ListParams) {
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], // urutan stabil
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        createdAt: true,
        role: { select: { name: true } },
        // password sengaja tidak di-select: hash tidak boleh keluar dari server
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: UserRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    roleId: r.roleId,
    roleName: r.role.name,
    createdAt: r.createdAt,
    isSuperAdmin: r.role.name === ROLE_SUPER_ADMIN,
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// Pilihan role di form. Role Super Admin hanya ditawarkan ke sesama Super Admin.
export async function getRoleOptions(
  includeSuperAdmin: boolean
): Promise<RoleOption[]> {
  return prisma.role.findMany({
    where: includeSuperAdmin ? {} : { name: { not: ROLE_SUPER_ADMIN } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
