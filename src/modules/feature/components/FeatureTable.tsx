// src/modules/feature/components/FeatureTable.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";
import SearchInput from "@/components/SearchInput";
import { usePermission } from "@/context/PermissionContext";
import { ACTION_LABEL } from "@/lib/constants";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { formatDateTime } from "@/lib/utils";
import { deleteFeatureAction } from "../feature.actions";
import type { FeatureRow } from "../feature.schema";
import FeatureFormModal from "./FeatureFormModal";

type Props = { items: FeatureRow[]; offset: number };

export default function FeatureTable({ items, offset }: Props) {
  const { can } = usePermission();
  const [modal, setModal] = useState<{ feature: FeatureRow | null } | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAdd = can("feature", "add");
  const canEdit = can("feature", "edit");
  const canDelete = can("feature", "delete");

  async function handleDelete(row: FeatureRow) {
    const ok = await swalConfirm({
      title: `Hapus feature "${row.name}"?`,
      text: "Semua pengaturan izin untuk feature ini di semua role ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingId(row.id);
    const res = await deleteFeatureAction(row.id);
    setDeletingId(null);

    if (res.ok) swalSuccess(res.message ?? "Feature berhasil dihapus");
    else swalError("Gagal menghapus", res.message);
  }

  const columns: Column<FeatureRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Feature",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">
            <code>{row.key}</code>
            {row.isSystem && (
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                Bawaan
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      header: "Deskripsi",
      cell: (row) => row.desc ?? <span className="text-gray-400">-</span>,
    },
    {
      header: "Aksi tersedia",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.availableActions.map((a) => (
            <span
              key={a}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {ACTION_LABEL[a]}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Diperbarui",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.updatedAt),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-24",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              type="button"
              onClick={() => setModal({ feature: row })}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Edit ${row.name}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && !row.isSystem && (
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingId === row.id}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Hapus ${row.name}`}
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Cari nama, key, atau deskripsi..." />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ feature: null })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Tambah Feature
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={items} getKey={(r) => r.id} />

      {modal && (
        <FeatureFormModal
          key={modal.feature?.id ?? "new"} // state form dibuat baru setiap modal dibuka
          feature={modal.feature}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
