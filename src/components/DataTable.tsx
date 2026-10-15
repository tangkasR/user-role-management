// src/components/DataTable.tsx
export type Column<T> = {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  emptyText?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  getKey,
  emptyText = "Data tidak ditemukan",
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${
                  col.className ?? ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={getKey(row)} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`px-4 py-3 text-gray-700 ${col.className ?? ""}`}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
