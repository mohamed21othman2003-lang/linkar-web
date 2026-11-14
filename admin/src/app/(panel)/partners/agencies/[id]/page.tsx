import type { Metadata } from "next";
import { Suspense } from "react";
import { AgencyProfileView } from "./_components/AgencyProfileView";

export const metadata: Metadata = { title: "ملف الوكالة" };

// CON5-09P · ملف الوكالة (3114:4312 …) — /partners/agencies/<DL>?tab=overview|orders|vouchers|branches|statements|requests
export default async function AgencyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <AgencyProfileView id={id} />
    </Suspense>
  );
}
