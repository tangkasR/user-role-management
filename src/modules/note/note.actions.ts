// src/modules/note/note.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction, parseInput } from "@/lib/action";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import { requirePermission } from "@/lib/permission";
import { idSchema } from "@/lib/validations";
import { noteSchema, type NoteActor } from "./note.schema";
import { createNote, deleteNote, updateNote } from "./note.service";

function toActor(session: { userId: string; roleName: string }): NoteActor {
  return {
    userId: session.userId,
    canManageAll: session.roleName === ROLE_SUPER_ADMIN,
  };
}

export async function createNoteAction(input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("note", "add"); // 1. izin
    const data = parseInput(noteSchema, input); // 2. validasi
    const result = await createNote(toActor(session), data); // 3. service
    revalidatePath("/notes"); // 4. revalidate
    return result;
  }, "Note berhasil dibuat");
}

export async function updateNoteAction(id: string, input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("note", "edit");
    const noteId = parseInput(idSchema, id);
    const data = parseInput(noteSchema, input);
    await updateNote(toActor(session), noteId, data);
    revalidatePath("/notes");
  }, "Note berhasil diperbarui");
}

export async function deleteNoteAction(id: string) {
  return handleAction(async () => {
    const session = await requirePermission("note", "delete");
    const noteId = parseInput(idSchema, id);
    await deleteNote(toActor(session), noteId);
    revalidatePath("/notes");
  }, "Note berhasil dihapus");
}
