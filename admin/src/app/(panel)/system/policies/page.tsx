import type { Metadata } from "next";
import { Suspense } from "react";
import { PoliciesView } from "./_components/PoliciesView";

export const metadata: Metadata = { title: "السياسات" };

// CON5-21 · السياسات (3114:64406) — Figma «v5 · 21 · السياسات» 3114:64405
export default function PoliciesPage() {
  return (
    <Suspense>
      <PoliciesView />
    </Suspense>
  );
}
