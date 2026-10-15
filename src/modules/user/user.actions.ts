// src/modules/user/user.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction, parseInput } from "@/lib/action";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import { requirePermission } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { userCreateSchema, userUpdateSchema } from "./user.schema";
import { createUser, deleteUser, updateUser, type Actor } from "./user.service";

// Jumlah user per role tampil di /roles, dan nama user tampil di header
function refresh() {
  revalidatePath("/users");
  revalidatePath("/", "layout");
}

function toActor(session: { userId: string; roleName: string }): Actor {
  return {
    userId: session.userId,
    isSuperAdmin: session.roleName === ROLE_SUPER_ADMIN,
  };
}

export async function createUserAction(input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("user", "add"); // 1. izin
    const data = parseInput(userCreateSchema, input); // 2. validasi
    const result = await createUser(toActor(session), data); // 3. service
    refresh(); // 4. revalidate
    return result;
  }, "User berhasil dibuat");
}

export async function updateUserAction(id: string, input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("user", "edit");
    const userId = parseInput(idSchema, id);
    const data = parseInput(userUpdateSchema, input);
    await updateUser(toActor(session), userId, data);
    refresh();
  }, "User berhasil diperbarui");
}

export async function deleteUserAction(id: string) {
  return handleAction(async () => {
    const session = await requirePermission("user", "delete");
    const userId = parseInput(idSchema, id);
    await deleteUser(toActor(session), userId);
    refresh();
  }, "User berhasil dihapus");
}
