// src/app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat halaman">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-gray-200/70" />
    </div>
  );
}
