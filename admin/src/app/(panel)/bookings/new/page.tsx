import type { Metadata } from "next";
import { Suspense } from "react";
import { ManualBookingWizard } from "./_components/ManualBookingWizard";

export const metadata: Metadata = { title: "حجز يدوي" };

// CON5-04N1 … 04N4 · حجز يدوي (3114-36264 · 3114-36379 · 3114-36508 · 3114-36603) — /bookings/new?step=1…4
export default function NewBookingPage() {
  return (
    <Suspense>
      <ManualBookingWizard />
    </Suspense>
  );
}
