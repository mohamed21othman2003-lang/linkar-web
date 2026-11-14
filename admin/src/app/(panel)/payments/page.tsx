import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsView } from "./_components/PaymentsView";

export const metadata: Metadata = { title: "المدفوعات والاستردادات" };

// CON5-15 · المدفوعات والاستردادات (3114:47245) — Figma «v5 · 15 · المدفوعات والاستردادات» 3114:47244
export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsView />
    </Suspense>
  );
}
