import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersView } from "./_components/CustomersView";

export const metadata: Metadata = { title: "العملاء" };

// CON5-05 · العملاء (3114-16054) — Figma v5 · 05 · العملاء (3114:16053)
export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersView />
    </Suspense>
  );
}
