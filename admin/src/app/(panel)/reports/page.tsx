import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportsView } from "./_components/ReportsView";

export const metadata: Metadata = { title: "التقارير" };

// CON5-02R · التقارير (3114-24825)
export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsView />
    </Suspense>
  );
}
