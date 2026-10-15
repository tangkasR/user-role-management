// src/modules/role/role.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction, parseInput } from "@/lib/action";
import { requirePermission } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { roleSchema } from "./role.schema";
import { createRole, deleteRole, updateRole } from "./role.service";

// Nama role tampil di header dan relasi di halaman user, jadi layout ikut direvalidasi
function refresh() {
  revalidatePath("/roles");
  revalidatePath("/", "layout");
}

export async function createRoleAction(input: unknown) {
  return handleAction(async () => {
    await requirePermission("role", "add");
    const data = parseInput(roleSchema, input);
    const result = await createRole(data);
    refresh();
    return result;
  }, "Role berhasil dibuat");
}

export async function updateRoleAction(id: string, input: unknown) {
  return handleAction(async () => {
    await requirePermission("role", "edit");
    const roleId = parseInput(idSchema, id);
    const data = parseInput(roleSchema, input);
    await updateRole(roleId, data);
    refresh();
  }, "Role berhasil diperbarui");
}

export async function deleteRoleAction(id: string) {
  return handleAction(async () => {
    await requirePermission("role", "delete");
    const roleId = parseInput(idSchema, id);
    await deleteRole(roleId);
    refresh();
  }, "Role berhasil dihapus");
}
