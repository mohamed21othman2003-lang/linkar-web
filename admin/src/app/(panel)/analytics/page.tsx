import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsView } from "./_components/AnalyticsView";

export const metadata: Metadata = { title: "التحليلات" };

// CON5-02 · التحليلات (3114-24750) + «سلوك العملاء» (3400-240630) على ?tab=behavior
export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsView />
    </Suspense>
  );
}
