// src/modules/role/components/RoleTable.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";
import SearchInput from "@/components/SearchInput";
import { usePermission } from "@/context/PermissionContext";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { formatDateTime } from "@/lib/utils";
import { deleteRoleAction } from "../role.actions";
import type { RoleRow } from "../role.schema";
import RoleFormModal from "./RoleFormModal";

type Props = { items: RoleRow[]; offset: number };

export default function RoleTable({ items, offset }: Props) {
  const { can } = usePermission();
  const [modal, setModal] = useState<{ role: RoleRow | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAdd = can("role", "add");
  const canEdit = can("role", "edit");
  const canDelete = can("role", "delete");
  const canViewPermission = can("role-permission", "read");

  async function handleDelete(row: RoleRow) {
    const ok = await swalConfirm({
      title: `Hapus role "${row.name}"?`,
      text: "Semua pengaturan izin role ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingId(row.id);
    const res = await deleteRoleAction(row.id);
    setDeletingId(null);

    if (res.ok) swalSuccess(res.message ?? "Role berhasil dihapus");
    else swalError("Gagal menghapus", res.message);
  }

  const columns: Column<RoleRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Role",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.name}</span>
          {row.isProtected && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
              Bawaan
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Deskripsi",
      cell: (row) => row.desc ?? <span className="text-gray-400">-</span>,
    },
    {
      header: "User",
      className: "w-20",
      cell: (row) => (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {row.userCount}
        </span>
      ),
    },
    {
      header: "Diperbarui",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.updatedAt),
    },
  ];

  if (canViewPermission || canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-32",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canViewPermission && (
            <Link
              href={`/roles/${row.id}/permissions`}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Atur izin ${row.name}`}
              title="Atur izin"
            >
              <KeyRound className="size-4" />
            </Link>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setModal({ role: row })}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Edit ${row.name}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && !row.isProtected && (
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingId === row.id || row.userCount > 0}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              aria-label={`Hapus ${row.name}`}
              title={
                row.userCount > 0
                  ? `Dipakai ${row.userCount} user, tidak bisa dihapus`
                  : "Hapus"
              }
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
        <SearchInput placeholder="Cari nama atau deskripsi..." />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ role: null })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Tambah Role
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={items} getKey={(r) => r.id} />

      {modal && (
        <RoleFormModal
          key={modal.role?.id ?? "new"}
          role={modal.role}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
