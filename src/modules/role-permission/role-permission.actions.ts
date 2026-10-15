// src/modules/role-permission/role-permission.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction, parseInput } from "@/lib/action";
import { requirePermission } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { savePermissionsSchema } from "./role-permission.schema";
import { saveRolePermissions } from "./role-permission.service";

export async function saveRolePermissionsAction(
  roleId: string,
  input: unknown
) {
  return handleAction(async () => {
    await requirePermission("role-permission", "edit"); // 1. izin
    const id = parseInput(idSchema, roleId); // 2. validasi
    const data = parseInput(savePermissionsSchema, input);
    const result = await saveRolePermissions(id, data.entries); // 3. service

    revalidatePath(`/roles/${id}/permissions`); // 4. revalidate
    revalidatePath("/", "layout"); // sidebar user yang memakai role ini ikut diperbarui
    return result;
  }, "Izin berhasil disimpan");
}
