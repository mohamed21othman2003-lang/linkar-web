import type { Metadata } from "next";
import { Suspense } from "react";
import { BranchesView } from "./_components/BranchesView";

export const metadata: Metadata = { title: "الفروع" };

// CON5-08 · الفروع (3114-55392) — القسم 12 من دليل الواجهة
export default function BranchesPage() {
  return (
    <Suspense>
      <BranchesView />
    </Suspense>
  );
}
