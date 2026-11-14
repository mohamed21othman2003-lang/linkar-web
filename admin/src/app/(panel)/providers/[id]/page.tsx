import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "./_components/ProfileView";

export const metadata: Metadata = { title: "ملف المزوّد" };

// CON5-07a · ملف المزوّد — القسم 9 (نظرة عامة 3114-48595) والقسم 10 (الخدمات والأسعار 3114-50957)
// الرابط: /providers/[id]?tab=overview|bookings|analytics|services|branches|dues|bank|users|quality (القسم 2.3)
export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ProfileView id={id} />
    </Suspense>
  );
}
