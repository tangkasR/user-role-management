// src/components/Pagination.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange?: (page: number) => void; // diisi = mode tombol (tanpa ke server)
};

// contoh: 1 … 4 5 [6] 7 8 … 20
function pageNumbers(page: number, total: number): (number | "…")[] {
  const set = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

const base = "rounded-lg border px-3 py-1.5 text-sm transition";
const styles = {
  idle: `${base} border-gray-200 text-gray-700 hover:bg-gray-100`,
  active: `${base} border-blue-600 bg-blue-600 text-white`,
  disabled: `${base} pointer-events-none border-gray-100 text-gray-300`,
};

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: Props) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function href(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  function item(
    key: string,
    p: number,
    label: React.ReactNode,
    state: keyof typeof styles
  ) {
    if (state === "disabled") {
      return (
        <span key={key} className={styles.disabled} aria-disabled="true">
          {label}
        </span>
      );
    }

    const current = state === "active" ? "page" : undefined;

    if (onPageChange) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={current}
          className={styles[state]}
        >
          {label}
        </button>
      );
    }

    return (
      <Link
        key={key}
        href={href(p)}
        aria-current={current}
        className={styles[state]}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-gray-500">
        Menampilkan {from}–{to} dari {total}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {item("prev", page - 1, "Sebelumnya", page > 1 ? "idle" : "disabled")}

        {pageNumbers(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            item(`p-${p}`, p, p, p === page ? "active" : "idle")
          )
        )}

        {item(
          "next",
          page + 1,
          "Berikutnya",
          page < totalPages ? "idle" : "disabled"
        )}
      </div>
    </nav>
  );
}
