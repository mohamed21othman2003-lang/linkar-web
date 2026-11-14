import type { Metadata } from "next";
import { Suspense } from "react";
import { AgenciesView } from "./_components/AgenciesView";

export const metadata: Metadata = { title: "الوكالات" };

// CON5-09 · الوكالات (3114:2150) — Figma «v5 · 09 · الوكالات» 3114:2149
export default function AgenciesPage() {
  return (
    <Suspense>
      <AgenciesView />
    </Suspense>
  );
}
