import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditView } from "../_components/AuditView";

export const metadata: Metadata = { title: "سجل التدقيق" };

// CON5-23L · سجل التدقيق (3114-28160)
export default function AuditLogPage() {
  return (
    <Suspense>
      <AuditView />
    </Suspense>
  );
}
