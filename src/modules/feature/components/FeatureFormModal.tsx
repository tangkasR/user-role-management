// src/modules/feature/components/FeatureFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { ACTIONS, ACTION_LABEL, type Action } from "@/lib/constants";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { createFeatureAction, updateFeatureAction } from "../feature.actions";
import type { FeatureFormInput, FeatureRow } from "../feature.schema";

type Props = { feature: FeatureRow | null; onClose: () => void };

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-500 disabled:bg-gray-100 disabled:text-gray-500";

export default function FeatureFormModal({ feature, onClose }: Props) {
  const isEdit = feature !== null;

  const [form, setForm] = useState<FeatureFormInput>({
    key: feature?.key ?? "",
    name: feature?.name ?? "",
    desc: feature?.desc ?? "",
    availableActions: feature?.availableActions ?? [...ACTIONS],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function toggleAction(action: Action) {
    setForm((f) => ({
      ...f,
      availableActions: f.availableActions.includes(action)
        ? f.availableActions.filter((a) => a !== action)
        : [...f.availableActions, action],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    // mencabut aksi bersifat destruktif: konfirmasi dulu
    if (isEdit) {
      const removed = feature.availableActions.filter(
        (a) => !form.availableActions.includes(a)
      );
      if (removed.length > 0) {
        const ok = await swalConfirm({
          title: "Cabut aksi dari feature?",
          text: `Aksi ${removed.join(
            ", "
          )} akan dinonaktifkan untuk semua role pada feature ini.`,
          confirmText: "Ya, simpan",
        });
        if (!ok) return;
      }
    }

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateFeatureAction(feature.id, form)
      : await createFeatureAction(form);

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
      title={isEdit ? "Edit Feature" : "Tambah Feature"}
      onClose={onClose}
      closeDisabled={pending}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="key"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Key
          </label>
          <input
            id="key"
            value={form.key}
            disabled={isEdit}
            autoFocus={!isEdit}
            placeholder="contoh: report"
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            aria-invalid={!!errors.key}
            className={inputCls}
          />
          {errors.key ? (
            <p className="mt-1 text-xs text-red-600">{errors.key}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              {isEdit
                ? "Key tidak dapat diubah."
                : "Dipakai kode untuk mengecek izin. Tidak bisa diubah setelah dibuat."}
            </p>
          )}
        </div>

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
            autoFocus={isEdit}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            className={inputCls}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
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

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            Aksi yang tersedia
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => (
              <label
                key={action}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={form.availableActions.includes(action)}
                  onChange={() => toggleAction(action)}
                  className="size-4 rounded border-gray-300 text-blue-600"
                />
                {ACTION_LABEL[action]}
              </label>
            ))}
          </div>
          {errors.availableActions && (
            <p className="mt-1 text-xs text-red-600">
              {errors.availableActions}
            </p>
          )}
        </fieldset>

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
