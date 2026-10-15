// src/modules/note/note.schema.ts
import { z } from "zod";

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(150, "Judul maksimal 150 karakter"),
  content: z
    .string()
    .trim()
    .max(5000, "Isi maksimal 5000 karakter")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type NoteInput = z.output<typeof noteSchema>;

// Bentuk yang dikirim dari form
export type NoteFormInput = { title: string; content: string };

// Siapa yang melakukan aksi (diisi dari session, bukan dari input user)
export type NoteActor = { userId: string; canManageAll: boolean };

// Baris yang ditampilkan di tabel
export type NoteRow = {
  id: string;
  title: string;
  content: string | null;
  authorName: string;
  isOwn: boolean;
  updatedAt: Date;
};

export const NOTE_CONTENT_MAX = 5000;
