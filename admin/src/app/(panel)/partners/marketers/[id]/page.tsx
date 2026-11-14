import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "../_components/ProfileView";

export const metadata: Metadata = { title: "ملف المسوّق" };

// CON5-10P · ملف المسوّق (تركي الحارثي 3114:11435 …) — /partners/marketers/[id]?tab=sales|payouts|requests
export default async function MarketerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ProfileView id={id} />
    </Suspense>
  );
}
