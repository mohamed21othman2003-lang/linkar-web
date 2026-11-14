import type { Metadata } from "next";
import { Suspense } from "react";
import { PaidFeaturesView } from "./_components/PaidFeaturesView";

export const metadata: Metadata = { title: "الميزات المدفوعة" };

// CON5-22 · الميزات المدفوعة (3114:64759) — Figma «v5 · 22 · الميزات المدفوعة» 3114:64758
export default function PaidFeaturesPage() {
  return (
    <Suspense>
      <PaidFeaturesView />
    </Suspense>
  );
}
