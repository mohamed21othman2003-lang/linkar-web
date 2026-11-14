import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsView } from "./_components/BookingsView";

export const metadata: Metadata = { title: "الحجوزات" };

// CON5-04 · الحجوزات (3114-33571) — Figma v5 · 04 · الحجوزات (3114:33570)
export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsView />
    </Suspense>
  );
}
