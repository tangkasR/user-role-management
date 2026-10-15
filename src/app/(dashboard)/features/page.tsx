// src/app/(dashboard)/features/page.tsx
import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/permission";
import { listParamsSchema } from "@/lib/validations";
import { getFeatures } from "@/modules/feature/feature.queries";
import FeatureTable from "@/modules/feature/components/FeatureTable";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";
import DashboardLoading from "../loading";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function page({ searchParams }: Props) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <FeaturesPage searchParams={searchParams} />
    </Suspense>
  );
}

async function FeaturesPage({ searchParams }: Props) {
  await requirePageAccess("feature", "read");

  const params = listParamsSchema.parse(await searchParams);
  const { items, total, totalPages } = await getFeatures(params);

  // halaman sudah tidak ada (misalnya item terakhir di halaman itu dihapus)
  if (params.page > totalPages) {
    const sp = new URLSearchParams({
      page: String(totalPages),
      limit: String(params.limit),
    });
    if (params.q) sp.set("q", params.q);
    redirect(`/features?${sp.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Features</h1>
        <p className="text-sm text-gray-500">
          Kelola feature dan aksi yang tersedia untuk tiap feature.
        </p>
      </div>

      <div>
        <FeatureTable items={items} offset={(params.page - 1) * params.limit} />
        <Pagination
          page={params.page}
          totalPages={totalPages}
          total={total}
          limit={params.limit}
        />
      </div>
    </div>
  );
}
