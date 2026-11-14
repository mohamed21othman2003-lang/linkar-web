import type { Metadata } from "next";
import { Suspense } from "react";
import { VisitsView } from "./_components/VisitsView";

export const metadata: Metadata = { title: "التقييم الميداني والتصنيف" };

// CON5-17 · التقييم الميداني (3114:62127) — Figma «v5 · 17 · التقييم الميداني» 3114:62126
export default function FieldEvaluationPage() {
  return (
    <Suspense>
      <VisitsView />
    </Suspense>
  );
}
