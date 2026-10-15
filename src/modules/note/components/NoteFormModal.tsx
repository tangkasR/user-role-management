// src/modules/note/components/NoteFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { swalError, swalSuccess } from "@/lib/swal";
import { createNoteAction, updateNoteAction } from "../note.actions";
import {
  NOTE_CONTENT_MAX,
  type NoteFormInput,
  type NoteRow,
} from "../note.schema";
import { useQueryClient } from "@tanstack/react-query";
import { noteKeys } from "../note.hooks";

type Props = { note: NoteRow | null; onClose: () => void };

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-500";

export default function NoteFormModal({ note, onClose }: Props) {
  const isEdit = note !== null;
  const queryClient = useQueryClient();

  const [form, setForm] = useState<NoteFormInput>({
    title: note?.title ?? "",
    content: note?.content ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateNoteAction(note.id, form)
      : await createNoteAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: noteKeys.all });
    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Edit Note" : "Tambah Note"}
      onClose={onClose}
      closeDisabled={pending}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Judul
          </label>
          <input
            id="title"
            value={form.title}
            autoFocus
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            aria-invalid={!!errors.title}
            className={inputCls}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Isi
          </label>
          <textarea
            id="content"
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            aria-invalid={!!errors.content}
            className={inputCls}
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            <p className="text-xs text-red-600">{errors.content}</p>
            <p
              className={`shrink-0 text-xs ${
                form.content.length > NOTE_CONTENT_MAX
                  ? "text-red-600"
                  : "text-gray-400"
              }`}
            >
              {form.content.length}/{NOTE_CONTENT_MAX}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
