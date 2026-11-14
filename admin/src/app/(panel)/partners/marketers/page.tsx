import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketersView } from "./_components/MarketersView";

export const metadata: Metadata = { title: "المسوّقون" };

// CON5-10 · المسوّقون (3114:10032) — Figma «v5 · 10 · المسوّقون» 3114:10031
export default function MarketersPage() {
  return (
    <Suspense>
      <MarketersView />
    </Suspense>
  );
}
