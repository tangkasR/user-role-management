// src/modules/user/components/UserFormModal.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Modal from "@/components/Modal";
import { ROLE_DEFAULT } from "@/lib/constants";
import { swalError, swalSuccess } from "@/lib/swal";
import { createUserAction, updateUserAction } from "../user.actions";
import type { RoleOption, UserFormInput, UserRow } from "../user.schema";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../user.hooks";

type Props = {
  user: UserRow | null;
  roles: RoleOption[];
  isSelf: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-500 disabled:bg-gray-100 disabled:text-gray-500";

export default function UserFormModal({ user, roles, isSelf, onClose }: Props) {
  const isEdit = user !== null;

  const [form, setForm] = useState<UserFormInput>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    roleId:
      user?.roleId ?? roles.find((r) => r.name === ROLE_DEFAULT)?.id ?? "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateUserAction(user.id, form)
      : await createUserAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: userKeys.all });

    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Edit User" : "Tambah User"}
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
            autoComplete="off"
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
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            autoComplete="off"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={!!errors.email}
            className={inputCls}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
            {isEdit && (
              <span className="font-normal text-gray-400"> (opsional)</span>
            )}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              aria-invalid={!!errors.password}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              {isEdit
                ? "Kosongkan jika tidak ingin mengubah password."
                : "Minimal 8 karakter, mengandung huruf dan angka."}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="roleId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="roleId"
            value={form.roleId}
            disabled={isSelf}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            aria-invalid={!!errors.roleId}
            className={inputCls}
          >
            <option value="" disabled>
              Pilih role
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
            {/* jaga agar role saat ini tetap tampil walau tidak ada di daftar pilihan */}
            {user && !roles.some((r) => r.id === user.roleId) && (
              <option value={user.roleId}>{user.roleName}</option>
            )}
          </select>
          {errors.roleId ? (
            <p className="mt-1 text-xs text-red-600">{errors.roleId}</p>
          ) : (
            isSelf && (
              <p className="mt-1 text-xs text-gray-400">
                Kamu tidak dapat mengubah role akunmu sendiri.
              </p>
            )
          )}
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
