// src/modules/note/note.service.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { NoteActor, NoteInput } from "./note.schema";

// Super Admin: semua note. User lain: hanya miliknya.
function ownerScope(actor: NoteActor) {
  return actor.canManageAll ? {} : { userId: actor.userId };
}

export async function createNote(actor: NoteActor, input: NoteInput) {
  const note = await prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      userId: actor.userId, // selalu dari session, bukan dari input
    },
    select: { id: true },
  });
  return { id: note.id };
}

export async function updateNote(
  actor: NoteActor,
  id: string,
  input: NoteInput
) {
  // kepemilikan ikut di dalam `where`: cek dan ubah terjadi dalam satu query
  const result = await prisma.note.updateMany({
    where: { id, ...ownerScope(actor) },
    data: { title: input.title, content: input.content },
  });

  // pesan sama untuk "tidak ada" dan "bukan milikmu": tidak membocorkan keberadaan note
  if (result.count === 0) throw new AppError("Note tidak ditemukan");
}

export async function deleteNote(actor: NoteActor, id: string) {
  const result = await prisma.note.deleteMany({
    where: { id, ...ownerScope(actor) },
  });

  if (result.count === 0) throw new AppError("Note tidak ditemukan");
}
