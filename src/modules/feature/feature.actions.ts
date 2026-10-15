// src/modules/feature/feature.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction, parseInput } from "@/lib/action";
import { requirePermission } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { featureCreateSchema, featureUpdateSchema } from "./feature.schema";
import { createFeature, deleteFeature, updateFeature } from "./feature.service";

// Perubahan feature memengaruhi tabel DAN peta izin di layout (sidebar)
function refresh() {
  revalidatePath("/features");
  revalidatePath("/", "layout");
}

export async function createFeatureAction(input: unknown) {
  return handleAction(async () => {
    await requirePermission("feature", "add"); // 1. izin
    const data = parseInput(featureCreateSchema, input); // 2. validasi
    const result = await createFeature(data); // 3. service
    refresh(); // 4. revalidate
    return result;
  }, "Feature berhasil dibuat");
}

export async function updateFeatureAction(id: string, input: unknown) {
  return handleAction(async () => {
    await requirePermission("feature", "edit");
    const featureId = parseInput(idSchema, id);
    const data = parseInput(featureUpdateSchema, input);
    const result = await updateFeature(featureId, data);
    refresh();
    return result;
  }, "Feature berhasil diperbarui");
}

export async function deleteFeatureAction(id: string) {
  return handleAction(async () => {
    await requirePermission("feature", "delete");
    const featureId = parseInput(idSchema, id);
    await deleteFeature(featureId);
    refresh();
  }, "Feature berhasil dihapus");
}
