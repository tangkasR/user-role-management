// src/app/(dashboard)/notes/page.tsx
import { requirePageAccess } from "@/lib/permission";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import NoteTable from "@/modules/note/components/NoteTable";
import { Suspense } from "react";
import DashboardLoading from "../loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <NotesPage />
    </Suspense>
  );
}

async function NotesPage() {
  const session = await requirePageAccess("note", "read");
  const canManageAll = session.roleName === ROLE_SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notes</h1>
        <p className="text-sm text-gray-500">
          {canManageAll
            ? "Kamu melihat note semua user."
            : "Catatan pribadimu. Hanya kamu yang bisa melihatnya."}
        </p>
      </div>

      <NoteTable showAuthor={canManageAll} />
    </div>
  );
}
