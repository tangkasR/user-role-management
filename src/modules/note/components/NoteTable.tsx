// src/modules/note/components/NoteTable.tsx
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
import { deleteNoteAction } from "../note.actions";
import { noteKeys, useNotes } from "../note.hooks";
import type { NoteRow } from "../note.schema";
import NoteFormModal from "./NoteFormModal";

export default function NoteTable({ showAuthor }: { showAuthor: boolean }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const { params, setQuery, setPage } = useListParams();
  const query = useNotes(params);

  const [modal, setModal] = useState<{ note: NoteRow | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAdd = can("note", "add");
  const canEdit = can("note", "edit");
  const canDelete = can("note", "delete");
  const offset = (params.page - 1) * params.limit;

  async function handleDelete(row: NoteRow) {
    const ok = await swalConfirm({
      title: `Hapus note "${row.title}"?`,
      text: "Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingId(row.id);
    const res = await deleteNoteAction(row.id);
    setDeletingId(null);

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      swalSuccess(res.message ?? "Note berhasil dihapus");
    } else {
      swalError("Gagal menghapus", res.message);
    }
  }

  const columns: Column<NoteRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Note",
      cell: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900">{row.title}</p>
          {row.content && (
            <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-gray-500">
              {row.content}
            </p>
          )}
        </div>
      ),
    },
  ];

  if (showAuthor) {
    columns.push({
      header: "Penulis",
      cell: (row) => (
        <span className="flex items-center gap-2">
          {row.authorName}
          {row.isOwn && (
            <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-green-700">
              Kamu
            </span>
          )}
        </span>
      ),
    });
  }

  columns.push({
    header: "Diperbarui",
    className: "whitespace-nowrap",
    cell: (row) => formatDateTime(row.updatedAt),
  });

  if (canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-24",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              type="button"
              onClick={() => setModal({ note: row })}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Edit ${row.title}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingId === row.id}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Hapus ${row.title}`}
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
          placeholder="Cari judul atau isi..."
        />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ note: null })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Tambah Note
          </button>
        )}
      </div>

      <QueryTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.id}
        emptyText={params.q ? "Note tidak ditemukan" : "Belum ada note"}
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
        <NoteFormModal
          key={modal.note?.id ?? "new"}
          note={modal.note}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
