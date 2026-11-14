import type { Metadata } from "next";
import { Suspense } from "react";
import { BranchPerformanceView } from "./_components/BranchPerformanceView";

export const metadata: Metadata = { title: "أداء الفرع والمستحقات" };

// CON5-08X · أداء الفرع والمستحقات (3114-60556) — القسم 12 من دليل الواجهة
export default async function BranchPerformancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <BranchPerformanceView id={id} />
    </Suspense>
  );
}
