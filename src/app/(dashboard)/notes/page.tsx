import { requirePageAccess } from "@/lib/permission";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
          Memuat...
        </div>
      }
    >
      <NotesPage />
    </Suspense>
  );
}
async function NotesPage() {
  await requirePageAccess("note", "read");
  return <h1 className="text-xl font-semibold">Notes (halaman uji)</h1>;
}
