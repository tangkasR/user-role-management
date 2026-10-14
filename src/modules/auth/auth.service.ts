// src/modules/auth/auth.service.ts
import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { ROLE_DEFAULT } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "./auth.schema";

const COST = 12;

// Hash pembanding supaya waktu respons sama baik email ada maupun tidak
let dummyHash: string | undefined;
async function getDummyHash() {
  return (dummyHash ??= await bcrypt.hash("dummy-password-untuk-timing", COST));
}

// Mengembalikan userId kalau kredensial benar, null kalau salah
export async function authenticate({
  email,
  password,
}: LoginInput): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  const ok = await bcrypt.compare(
    password,
    user?.password ?? (await getDummyHash())
  );
  return user && ok ? user.id : null;
}

export async function registerUser({
  name,
  email,
  password,
}: RegisterInput): Promise<string> {
  const role = await prisma.role.findUnique({ where: { name: ROLE_DEFAULT } });
  if (!role)
    throw new AppError(
      "Role default belum tersedia. Jalankan seeder terlebih dahulu."
    );

  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) throw new AppError("Email sudah terdaftar", "email");

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, COST),
        roleId: role.id,
      },
      select: { id: true },
    });
    return user.id;
  } catch (e) {
    // dua pendaftaran bersamaan dengan email sama: ditolak oleh unique constraint
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2002"
    ) {
      throw new AppError("Email sudah terdaftar", "email");
    }
    throw e;
  }
}
