/* eslint-disable @next/next/no-location-assign-relative-destination */
// src/components/QueryTable.tsx
"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import { ApiError } from "@/lib/fetcher";

type Props<T> = {
  columns: Column<T>[];
  rows: T[] | undefined;
  getKey: (row: T) => string;
  emptyText?: string;
  isPending: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  limit: number;
  total: number | undefined;
  totalPages: number | undefined;
  onPageChange: (page: number, replace?: boolean) => void;
};

function TableSkeleton<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      aria-busy="true"
      aria-label="Memuat data"
    >
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3">
                  <div className="h-4 animate-pulse rounded bg-gray-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QueryTable<T>({
  columns,
  rows,
  getKey,
  emptyText,
  isPending,
  isFetching,
  isPlaceholderData,
  error,
  onRetry,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
}: Props<T>) {
  const unauthorized = error instanceof ApiError && error.status === 401;
  const forbidden = error instanceof ApiError && error.status === 403;

  // sesi berakhir: kembali ke login
  useEffect(() => {
    if (unauthorized) window.location.assign("/login");
  }, [unauthorized]);

  // halaman sudah tidak ada (misalnya item terakhir di halaman itu dihapus): mundur ke halaman terakhir
  useEffect(() => {
    if (!isPlaceholderData && totalPages !== undefined && page > totalPages) {
      onPageChange(totalPages, true);
    }
  }, [isPlaceholderData, totalPages, page, onPageChange]);

  if (error && !rows) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
      >
        <AlertCircle className="mx-auto size-8 text-red-500" />
        <p className="mt-2 font-medium text-red-700">Gagal memuat data</p>
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
        {!forbidden && !unauthorized && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="size-4" />
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  if (isPending || !rows) return <TableSkeleton columns={columns} />;

  return (
    <div>
      <div
        aria-busy={isFetching}
        className={`transition-opacity ${
          isFetching && isPlaceholderData ? "opacity-60" : "opacity-100"
        }`}
      >
        <DataTable
          columns={columns}
          rows={rows}
          getKey={getKey}
          emptyText={emptyText}
        />
      </div>
      <Pagination
        page={page}
        totalPages={Math.max(1, totalPages ?? 1)}
        total={total ?? 0}
        limit={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
}
