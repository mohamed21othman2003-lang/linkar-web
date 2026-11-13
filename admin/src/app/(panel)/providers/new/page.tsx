import type { Metadata } from "next";
import { Suspense } from "react";
import { AddProviderWizard } from "./_components/AddProviderWizard";

export const metadata: Metadata = { title: "إضافة مقدّم خدمة" };

// CON5-07N1 / 07N2 / 07N3 · إضافة مقدّم خدمة (3114-51246 / 3114-51551 / 3114-51438) — /providers/new?step=1|2|3
export default function NewProviderPage() {
  return (
    <Suspense>
      <AddProviderWizard />
    </Suspense>
  );
}
