// src/modules/role/role.service.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { PROTECTED_ROLE_NAMES } from "@/lib/constants";
import type { RoleInput } from "./role.schema";

type Db = Pick<Prisma.TransactionClient, "role">;

function errorCode(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e
    ? String(e.code)
    : undefined;
}

// Nama unik tanpa membedakan huruf besar/kecil
async function assertNameAvailable(db: Db, name: string, excludeId?: string) {
  const exists = await db.role.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (exists) throw new AppError("Nama role sudah dipakai", "name");
}

export async function createRole(input: RoleInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      await assertNameAvailable(tx, input.name);

      const features = await tx.feature.findMany({ select: { id: true } });

      // permission otomatis untuk semua feature, default semua false
      const role = await tx.role.create({
        data: {
          name: input.name,
          desc: input.desc,
          permissions: { create: features.map((f) => ({ featureId: f.id })) },
        },
        select: { id: true },
      });

      return { id: role.id, featuresCount: features.length };
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Nama role sudah dipakai", "name");
    throw e;
  }
}

export async function updateRole(id: string, input: RoleInput) {
  const role = await prisma.role.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!role) throw new AppError("Role tidak ditemukan");

  if (PROTECTED_ROLE_NAMES.includes(role.name) && input.name !== role.name) {
    throw new AppError("Nama role bawaan sistem tidak dapat diubah", "name");
  }

  await assertNameAvailable(prisma, input.name, id);

  try {
    await prisma.role.update({
      where: { id },
      data: { name: input.name, desc: input.desc },
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Nama role sudah dipakai", "name");
    throw e;
  }
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
    select: { name: true, _count: { select: { users: true } } },
  });
  if (!role) throw new AppError("Role tidak ditemukan");

  if (PROTECTED_ROLE_NAMES.includes(role.name)) {
    throw new AppError(
      `Role ${role.name} adalah role bawaan sistem dan tidak boleh dihapus`
    );
  }
  if (role._count.users > 0) {
    throw new AppError(
      `Role masih dipakai oleh ${role._count.users} user. Pindahkan user ke role lain terlebih dahulu.`
    );
  }

  try {
    // role_permissions ikut terhapus oleh onDelete: Cascade
    await prisma.role.delete({ where: { id } });
  } catch (e) {
    // user baru saja dipasangkan ke role ini di antara pengecekan dan penghapusan
    if (errorCode(e) === "P2003") {
      throw new AppError(
        "Role baru saja dipakai oleh user, tidak bisa dihapus"
      );
    }
    throw e;
  }
}
