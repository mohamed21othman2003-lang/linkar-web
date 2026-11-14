import type { Metadata } from "next";
import { Suspense } from "react";
import { NewBranchForm } from "./_components/NewBranchForm";

export const metadata: Metadata = { title: "إضافة فرع" };

// CON5-08N · إضافة فرع (3114-59725) — القسم 12 من دليل الواجهة · /branches/new?provider=<id>
export default async function NewBranchPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider } = await searchParams;
  return (
    <Suspense>
      <NewBranchForm key={provider} providerId={provider} />
    </Suspense>
  );
}
