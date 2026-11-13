import type { Metadata } from "next";
import { Suspense } from "react";
import { ProvidersView } from "./_components/ProvidersView";

export const metadata: Metadata = { title: "مقدّمو الخدمة" };

// CON5-07 · مقدّمو الخدمة (3114-48542) — القسم 7 من دليل الواجهة
export default function ProvidersPage() {
  return (
    <Suspense>
      <ProvidersView />
    </Suspense>
  );
}
