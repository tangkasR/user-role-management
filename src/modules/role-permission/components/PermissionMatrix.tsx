// src/modules/role-permission/components/PermissionMatrix.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Info, RotateCcw, Save } from "lucide-react";
import { usePermission } from "@/context/PermissionContext";
import { ACTIONS, ACTION_LABEL, type Action } from "@/lib/constants";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { saveRolePermissionsAction } from "../role-permission.actions";
import type { MatrixFeature } from "../role-permission.schema";

type Props = {
  roleId: string;
  features: MatrixFeature[];
  isSuperAdmin: boolean;
  isOwnRole: boolean; // role yang sedang dipakai oleh user yang login
};

const keyOf = (featureId: string, action: Action) => `${featureId}:${action}`;

function toSet(features: MatrixFeature[]) {
  return new Set(features.flatMap((f) => f.granted.map((a) => keyOf(f.id, a))));
}

// Checkbox dengan keadaan "sebagian" (indeterminate) untuk toggle baris dan kolom
function TriCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="size-4 rounded border-gray-300 text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

export default function PermissionMatrix({
  roleId,
  features,
  isSuperAdmin,
  isOwnRole,
}: Props) {
  const { can } = usePermission();
  const canEdit = can("role-permission", "edit");
  const editable = canEdit && !isSuperAdmin;

  // `key` di page membuat komponen ini dibuat ulang saat data server berubah,
  // jadi baseline selalu sama dengan data terakhir dari server
  const [baseline] = useState(() => toSet(features));
  const [granted, setGranted] = useState(() => new Set(baseline));
  const [pending, setPending] = useState(false);

  let changes = 0;
  for (const k of granted) if (!baseline.has(k)) changes++;
  for (const k of baseline) if (!granted.has(k)) changes++;
  const dirty = changes > 0;

  function setKeys(keys: string[], value: boolean) {
    setGranted((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (value) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function status(keys: string[]) {
    const count = keys.filter((k) => granted.has(k)).length;
    return {
      disabled: !editable || keys.length === 0,
      checked: keys.length > 0 && count === keys.length,
      indeterminate: count > 0 && count < keys.length,
    };
  }

  async function handleSave() {
    if (!editable || !dirty || pending) return;

    if (isOwnRole) {
      const ok = await swalConfirm({
        title: "Ubah izin role kamu sendiri?",
        text: "Role ini sedang kamu pakai. Perubahan langsung berlaku dan bisa membatasi akses yang sedang kamu gunakan.",
        confirmText: "Ya, simpan",
      });
      if (!ok) return;
    }

    setPending(true);
    const res = await saveRolePermissionsAction(roleId, {
      entries: features.map((f) => ({
        featureId: f.id,
        actions: ACTIONS.filter((a) => granted.has(keyOf(f.id, a))),
      })),
    });
    setPending(false);

    if (!res.ok) {
      swalError(
        "Gagal menyimpan izin",
        res.fieldErrors?.entries ?? res.message
      );
      return;
    }
    swalSuccess(res.message ?? "Izin berhasil disimpan");
  }

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Info className="mt-0.5 size-4 shrink-0" />
          Super Admin selalu memiliki akses penuh dan izinnya tidak dapat
          diubah.
        </div>
      )}
      {!isSuperAdmin && !canEdit && (
        <div className="flex items-start gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
          <Info className="mt-0.5 size-4 shrink-0" />
          Kamu hanya dapat melihat izin, tidak dapat mengubahnya.
        </div>
      )}

      {editable && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500" aria-live="polite">
            {dirty
              ? `${changes} perubahan belum disimpan`
              : "Belum ada perubahan"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGranted(new Set(baseline))}
              disabled={!dirty || pending}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || pending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" />
              {pending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Feature
              </th>
              {ACTIONS.map((action) => {
                const keys = features
                  .filter((f) => f.availableActions.includes(action))
                  .map((f) => keyOf(f.id, action));
                const s = status(keys);

                return (
                  <th
                    key={action}
                    scope="col"
                    className="px-4 py-3 text-center"
                  >
                    <label className="inline-flex flex-col items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {ACTION_LABEL[action]}
                      <TriCheckbox
                        checked={s.checked}
                        indeterminate={s.indeterminate}
                        disabled={s.disabled}
                        onChange={(v) => setKeys(keys, v)}
                        label={`Pilih semua aksi ${ACTION_LABEL[action]}`}
                      />
                    </label>
                  </th>
                );
              })}
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Semua
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {features.length === 0 && (
              <tr>
                <td
                  colSpan={ACTIONS.length + 2}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Belum ada feature
                </td>
              </tr>
            )}

            {features.map((f) => {
              const rowKeys = f.availableActions.map((a) => keyOf(f.id, a));
              const rowStatus = status(rowKeys);

              return (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{f.name}</p>
                    <p className="text-xs text-gray-500">
                      <code>{f.key}</code>
                      {f.desc ? ` · ${f.desc}` : ""}
                    </p>
                  </td>

                  {ACTIONS.map((action) => {
                    const available = f.availableActions.includes(action);
                    const k = keyOf(f.id, action);

                    return (
                      <td key={action} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={granted.has(k)}
                          disabled={!editable || !available}
                          onChange={() => setKeys([k], !granted.has(k))}
                          title={
                            available
                              ? undefined
                              : "Aksi tidak tersedia pada feature ini"
                          }
                          aria-label={`${ACTION_LABEL[action]} ${f.name}`}
                          className="size-4 rounded border-gray-300 text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center">
                    <TriCheckbox
                      checked={rowStatus.checked}
                      indeterminate={rowStatus.indeterminate}
                      disabled={rowStatus.disabled}
                      onChange={(v) => setKeys(rowKeys, v)}
                      label={`Pilih semua aksi ${f.name}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
