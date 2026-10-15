// src/modules/user/user.service.ts
import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AppError, errorCode } from "@/lib/errors";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import type { UserCreateInput, UserUpdateInput } from "./user.schema";

const COST = 12; // samakan dengan auth.service

// Siapa yang melakukan aksi (diisi oleh action dari session)
export type Actor = { userId: string; isSuperAdmin: boolean };

async function countSuperAdmins(tx: Prisma.TransactionClient) {
  return tx.user.count({ where: { role: { name: ROLE_SUPER_ADMIN } } });
}

export async function createUser(actor: Actor, input: UserCreateInput) {
  const role = await prisma.role.findUnique({
    where: { id: input.roleId },
    select: { name: true },
  });
  if (!role) throw new AppError("Role tidak ditemukan", "roleId");

  if (role.name === ROLE_SUPER_ADMIN && !actor.isSuperAdmin) {
    throw new AppError(
      "Hanya Super Admin yang dapat memberikan role Super Admin",
      "roleId"
    );
  }

  const exists = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (exists) throw new AppError("Email sudah terdaftar", "email");

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        roleId: input.roleId,
        password: await bcrypt.hash(input.password, COST),
      },
      select: { id: true },
    });
    return { id: user.id };
  } catch (e) {
    // dua request bersamaan dengan email sama: ditolak oleh unique constraint
    if (errorCode(e) === "P2002")
      throw new AppError("Email sudah terdaftar", "email");
    throw e;
  }
}

export async function updateUser(
  actor: Actor,
  id: string,
  input: UserUpdateInput
) {
  // hash dihitung di luar transaksi supaya transaksi tidak menahan koneksi selama bcrypt berjalan
  const passwordHash = input.password
    ? await bcrypt.hash(input.password, COST)
    : undefined;

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id },
        select: { roleId: true, role: { select: { name: true } } },
      });
      if (!target) throw new AppError("User tidak ditemukan");

      const targetIsSuperAdmin = target.role.name === ROLE_SUPER_ADMIN;
      if (targetIsSuperAdmin && !actor.isSuperAdmin) {
        throw new AppError(
          "Hanya Super Admin yang dapat mengubah akun Super Admin"
        );
      }

      const newRole = await tx.role.findUnique({
        where: { id: input.roleId },
        select: { id: true, name: true },
      });
      if (!newRole) throw new AppError("Role tidak ditemukan", "roleId");

      if (newRole.id !== target.roleId) {
        if (id === actor.userId) {
          throw new AppError(
            "Kamu tidak dapat mengubah role akunmu sendiri",
            "roleId"
          );
        }
        if (newRole.name === ROLE_SUPER_ADMIN && !actor.isSuperAdmin) {
          throw new AppError(
            "Hanya Super Admin yang dapat memberikan role Super Admin",
            "roleId"
          );
        }
        // menurunkan Super Admin: pastikan masih ada Super Admin lain
        if (targetIsSuperAdmin && (await countSuperAdmins(tx)) <= 1) {
          throw new AppError(
            "Tidak dapat mengubah role Super Admin terakhir",
            "roleId"
          );
        }
      }

      const taken = await tx.user.findFirst({
        where: { email: input.email, id: { not: id } },
        select: { id: true },
      });
      if (taken) throw new AppError("Email sudah terdaftar", "email");

      await tx.user.update({
        where: { id },
        data: {
          name: input.name,
          email: input.email,
          roleId: input.roleId,
          ...(passwordHash ? { password: passwordHash } : {}),
        },
      });
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Email sudah terdaftar", "email");
    throw e;
  }
}

export async function deleteUser(actor: Actor, id: string) {
  if (id === actor.userId) {
    throw new AppError("Kamu tidak dapat menghapus akunmu sendiri");
  }

  await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id },
      select: { role: { select: { name: true } } },
    });
    if (!target) throw new AppError("User tidak ditemukan");

    if (target.role.name === ROLE_SUPER_ADMIN) {
      if (!actor.isSuperAdmin) {
        throw new AppError(
          "Hanya Super Admin yang dapat menghapus akun Super Admin"
        );
      }
      if ((await countSuperAdmins(tx)) <= 1) {
        throw new AppError("Super Admin terakhir tidak dapat dihapus");
      }
    }

    // note milik user ikut terhapus oleh onDelete: Cascade
    await tx.user.delete({ where: { id } });
  });
}
