// src/modules/role/role.queries.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { PROTECTED_ROLE_NAMES } from "@/lib/constants";
import type { ListParams } from "@/lib/validations";
import type { RoleRow } from "./role.schema";

export async function getRoles({ page, limit, q }: ListParams) {
  const where: Prisma.RoleWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { desc: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }], // urutan stabil
      select: {
        id: true,
        name: true,
        desc: true,
        updatedAt: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.role.count({ where }),
  ]);

  const items: RoleRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    desc: r.desc,
    updatedAt: r.updatedAt,
    userCount: r._count.users,
    isProtected: PROTECTED_ROLE_NAMES.includes(r.name),
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
