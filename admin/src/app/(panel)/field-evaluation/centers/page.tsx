import type { Metadata } from "next";
import { Suspense } from "react";
import { CentersView } from "../_components/CentersView";

export const metadata: Metadata = { title: "تصنيف المراكز والاعتماد" };

// CON5-17C · تصنيف المراكز والاعتماد (3114:62451) — Figma «v5 · 17 · التقييم الميداني» 3114:62126
export default function CentersPage() {
  return (
    <Suspense>
      <CentersView />
    </Suspense>
  );
}
