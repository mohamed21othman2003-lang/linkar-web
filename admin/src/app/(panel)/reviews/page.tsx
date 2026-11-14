import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewsView } from "./_components/ReviewsView";

export const metadata: Metadata = { title: "التقييمات والشكاوى" };

// CON5-18 · التقييمات والشكاوى (3114:414) — Figma «v5 · 18 · التقييمات والشكاوى» 3114:413
export default function ReviewsPage() {
  return (
    <Suspense>
      <ReviewsView />
    </Suspense>
  );
}
