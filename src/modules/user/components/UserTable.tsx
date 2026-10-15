// src/modules/user/components/UserTable.tsx
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Column } from "@/components/DataTable";
import QueryTable from "@/components/QueryTable";
import SearchBox from "@/components/SearchBox";
import { usePermission } from "@/context/PermissionContext";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { useListParams } from "@/lib/use-list-params";
import { formatDateTime } from "@/lib/utils";
import { deleteUserAction } from "../user.actions";
import { userKeys, useUsers } from "../user.hooks";
import type { RoleOption, UserRow } from "../user.schema";
import UserFormModal from "./UserFormModal";

type Props = {
  roles: RoleOption[];
  currentUserId: string;
  actorIsSuperAdmin: boolean;
};

export default function UserTable({
  roles,
  currentUserId,
  actorIsSuperAdmin,
}: Props) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const { params, setQuery, setPage } = useListParams();
  const query = useUsers(params);

  const [modal, setModal] = useState<{ user: UserRow | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAdd = can("user", "add");
  const canEdit = can("user", "edit");
  const canDelete = can("user", "delete");
  const offset = (params.page - 1) * params.limit;

  // hanya Super Admin yang boleh menyentuh akun Super Admin (server juga menolak)
  const canTouch = (row: UserRow) => actorIsSuperAdmin || !row.isSuperAdmin;

  async function handleDelete(row: UserRow) {
    const ok = await swalConfirm({
      title: `Hapus user "${row.name}"?`,
      text: "Semua note milik user ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingId(row.id);
    const res = await deleteUserAction(row.id);
    setDeletingId(null);

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      swalSuccess(res.message ?? "User berhasil dihapus");
    } else {
      swalError("Gagal menghapus", res.message);
    }
  }

  const columns: Column<UserRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "User",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {row.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium text-gray-900">
              <span className="truncate">{row.name}</span>
              {row.id === currentUserId && (
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-green-700">
                  Kamu
                </span>
              )}
            </p>
            <p className="truncate text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isSuperAdmin
              ? "bg-purple-50 text-purple-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.roleName}
        </span>
      ),
    },
    {
      header: "Dibuat",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-24",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canEdit && canTouch(row) && (
            <button
              type="button"
              onClick={() => setModal({ user: row })}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Edit ${row.name}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && canTouch(row) && row.id !== currentUserId && (
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
        <SearchBox
          value={params.q}
          onSearch={setQuery}
          placeholder="Cari nama atau email..."
        />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ user: null })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Tambah User
          </button>
        )}
      </div>

      <QueryTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.id}
        emptyText={params.q ? "User tidak ditemukan" : "Belum ada user"}
        isPending={query.isPending}
        isFetching={query.isFetching}
        isPlaceholderData={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        page={params.page}
        limit={params.limit}
        total={query.data?.total}
        totalPages={query.data?.totalPages}
        onPageChange={setPage}
      />

      {modal && (
        <UserFormModal
          key={modal.user?.id ?? "new"}
          user={modal.user}
          roles={roles}
          isSelf={modal.user?.id === currentUserId}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
