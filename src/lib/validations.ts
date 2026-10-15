// src/lib/validations.ts
import { z } from "zod";

// Zod 4: z.uuid(). Kalau yang terpasang Zod 3, ganti jadi z.string().uuid("ID tidak valid")
export const idSchema = z.uuid("ID tidak valid");

// Parameter URL tidak bisa dipercaya: nilai tidak valid kembali ke default
export const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(10),
  q: z.string().trim().max(100).catch(""),
});

export type ListParams = z.infer<typeof listParamsSchema>;
