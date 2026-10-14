// src/lib/session.ts
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/constants";

const DURATION_SEC = 60 * 60 * 24 * 7; // 7 hari

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi, minimal 32 karakter");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + DURATION_SEC;

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(exp * 1000),
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type Session = {
  userId: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
};

// cache(): dalam satu request, query user hanya dijalankan sekali
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: { select: { name: true } },
      },
    });
    if (!user) return null;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    };
  } catch {
    return null; // token rusak, kedaluwarsa, atau tanda tangan salah
  }
});
