import type { Metadata } from "next";
import { Suspense } from "react";
import { DuesView } from "./_components/DuesView";

export const metadata: Metadata = { title: "مستحقات المزوّدين" };

// CON5-14 · مستحقات المزوّدين (3114:71708) — Figma «v5 · 14 · مستحقات المزوّدين» 3114:71707
export default function DuesPage() {
  return (
    <Suspense>
      <DuesView />
    </Suspense>
  );
}
