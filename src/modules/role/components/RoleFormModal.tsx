// src/modules/role/components/RoleFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { swalError, swalSuccess } from "@/lib/swal";
import { createRoleAction, updateRoleAction } from "../role.actions";
import type { RoleFormInput, RoleRow } from "../role.schema";

type Props = { role: RoleRow | null; onClose: () => void };

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-500 disabled:bg-gray-100 disabled:text-gray-500";

export default function RoleFormModal({ role, onClose }: Props) {
  const isEdit = role !== null;

  const [form, setForm] = useState<RoleFormInput>({
    name: role?.name ?? "",
    desc: role?.desc ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateRoleAction(role.id, form)
      : await createRoleAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Edit Role" : "Tambah Role"}
      onClose={onClose}
      closeDisabled={pending}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Nama
          </label>
          <input
            id="name"
            value={form.name}
            autoFocus
            disabled={role?.isProtected}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            className={inputCls}
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          ) : (
            role?.isProtected && (
              <p className="mt-1 text-xs text-gray-400">
                Nama role bawaan sistem tidak dapat diubah.
              </p>
            )
          )}
        </div>

        <div>
          <label
            htmlFor="desc"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Deskripsi
          </label>
          <textarea
            id="desc"
            rows={3}
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            aria-invalid={!!errors.desc}
            className={inputCls}
          />
          {errors.desc && (
            <p className="mt-1 text-xs text-red-600">{errors.desc}</p>
          )}
        </div>

        {!isEdit && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Role baru belum memiliki izin apa pun. Atur izinnya lewat tombol
            &quot;Atur izin&quot; setelah role dibuat.
          </p>
        )}

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
