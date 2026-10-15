// src/modules/note/note.queries.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { ListParams } from "@/lib/validations";
import type { NoteActor, NoteRow } from "./note.schema";

// Dipakai juga oleh Route Handler di Step 11, jadi aturan kepemilikan hanya ada di satu tempat
export async function getNotes(
  actor: NoteActor,
  { page, limit, q }: ListParams
) {
  const where: Prisma.NoteWhereInput = {
    AND: [
      actor.canManageAll ? {} : { userId: actor.userId }, // kepemilikan
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [rows, total] = await prisma.$transaction([
    prisma.note.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }], // urutan stabil
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.note.count({ where }),
  ]);

  const items: NoteRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    authorName: r.user.name,
    isOwn: r.userId === actor.userId,
    updatedAt: r.updatedAt,
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
