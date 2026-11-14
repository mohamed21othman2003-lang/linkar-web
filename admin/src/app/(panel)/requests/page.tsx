import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestsView } from "./_components/RequestsView";

export const metadata: Metadata = { title: "الطلبات" };

// CON5-03 · الطلبات (3114:29233) — Figma «v5 · 03 · الطلبات» 3114:29232
export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsView />
    </Suspense>
  );
}
