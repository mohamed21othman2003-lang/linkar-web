import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "../_components/ProfileView";

export const metadata: Metadata = { title: "ملف العميل" };

// CON5-05P · ملف العميل · محمد سالم (3260-257929 · 3260-258298 · 3260-258667 · 3260-259036)
export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ProfileView id={id} />
    </Suspense>
  );
}
