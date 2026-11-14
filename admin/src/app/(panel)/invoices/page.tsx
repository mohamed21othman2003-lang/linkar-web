import type { Metadata } from "next";
import { Suspense } from "react";
import { InvoicesView } from "./_components/InvoicesView";

export const metadata: Metadata = { title: "الفواتير والقسائم" };

// CON5-16 · الفواتير والقسائم (3114:47648) — Figma «v5 · 16 · الفواتير والقسائم» 3114:47647
export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesView />
    </Suspense>
  );
}
