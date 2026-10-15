// src/modules/auth/auth.service.ts
import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppError, errorCode } from "@/lib/errors";
import { ROLE_DEFAULT } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "./auth.schema";

const COST = 12;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_PER_EMAIL = 5;
const MAX_FAILED_PER_IP = 20;
const RETENTION_MS = 24 * 60 * 60 * 1000;

// Hash pembanding supaya waktu respons sama baik email ada maupun tidak
let dummyHash: string | undefined;
async function getDummyHash() {
  return (dummyHash ??= await bcrypt.hash("dummy-password-untuk-timing", COST));
}

// Dicek SEBELUM bcrypt: percobaan yang diblokir tidak membebani CPU
async function assertNotRateLimited(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);

  const byEmail = await prisma.loginAttempt.count({
    where: { email, createdAt: { gte: since } },
  });
  // IP "unknown" (header proxy tidak ada) dilewati, supaya semua pengguna tidak berbagi satu jatah
  const byIp =
    ip === "unknown"
      ? 0
      : await prisma.loginAttempt.count({
          where: { ip, createdAt: { gte: since } },
        });

  if (byEmail >= MAX_FAILED_PER_EMAIL || byIp >= MAX_FAILED_PER_IP) {
    throw new AppError(
      "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi."
    );
  }
}

async function recordFailedLogin(email: string, ip: string) {
  await prisma.loginAttempt.create({ data: { email, ip } });
  // bersihkan data lama supaya tabel tidak membengkak
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
  });
}

// Mengembalikan userId kalau kredensial benar, null kalau salah
// Melempar AppError kalau kena pembatasan
export async function authenticate(
  { email, password }: LoginInput,
  ip: string
): Promise<string | null> {
  await assertNotRateLimited(email, ip);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  const ok = await bcrypt.compare(
    password,
    user?.password ?? (await getDummyHash())
  );

  if (!user || !ok) {
    // dicatat juga untuk email yang tidak terdaftar: perilakunya sama, tidak membocorkan email valid
    await recordFailedLogin(email, ip);
    return null;
  }

  await prisma.loginAttempt.deleteMany({ where: { email } });
  return user.id;
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
    if (errorCode(e) === "P2002")
      throw new AppError("Email sudah terdaftar", "email");
    throw e;
  }
}
