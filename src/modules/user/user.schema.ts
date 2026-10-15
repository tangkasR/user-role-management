// src/modules/user/user.schema.ts
import { z } from "zod";
import { idSchema } from "@/lib/validations";

const name = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama maksimal 100 karakter");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email tidak valid")
  .max(191, "Email terlalu panjang");

const roleId = z
  .string()
  .min(1, "Pilih role")
  .refine((v) => idSchema.safeParse(v).success, "Role tidak valid");

export const userCreateSchema = z.object({
  name,
  email,
  roleId,
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter") // batas bcrypt
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

// Saat edit: kosong = password tidak diubah
export const userUpdateSchema = z.object({
  name,
  email,
  roleId,
  password: z
    .string()
    .max(72, "Password maksimal 72 karakter")
    .optional()
    .refine((v) => !v || v.length >= 8, "Password minimal 8 karakter")
    .refine(
      (v) => !v || (/[A-Za-z]/.test(v) && /[0-9]/.test(v)),
      "Password harus mengandung huruf dan angka"
    )
    .transform((v) => (v ? v : undefined)),
});

export type UserCreateInput = z.output<typeof userCreateSchema>;
export type UserUpdateInput = z.output<typeof userUpdateSchema>;

// Bentuk yang dikirim dari form
export type UserFormInput = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

// Baris yang ditampilkan di tabel (tanpa password)
export type UserRow = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  createdAt: Date;
  isSuperAdmin: boolean;
};

export type RoleOption = { id: string; name: string };
