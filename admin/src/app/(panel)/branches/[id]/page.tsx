import type { Metadata } from "next";
import { Suspense } from "react";
import { BranchProfile } from "./_components/BranchProfile";

export const metadata: Metadata = { title: "ملف الفرع" };

// CON5-08P · ملف الفرع (3114-56007 …) — القسم 12 من دليل الواجهة
export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <BranchProfile id={id} />
    </Suspense>
  );
}
