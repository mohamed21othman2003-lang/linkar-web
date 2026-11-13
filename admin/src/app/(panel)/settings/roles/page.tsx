import type { Metadata } from "next";
import { Suspense } from "react";
import { RolesView } from "../_components/RolesView";
import { TeamShell } from "../_components/TeamShell";

export const metadata: Metadata = { title: "الأدوار · المستخدمون والصلاحيات" };

// CON5-23 · المستخدمون والصلاحيات · الأدوار (3114-25331)
export default function RolesPage() {
  return (
    <Suspense>
      <TeamShell tab="roles">
        <RolesView />
      </TeamShell>
    </Suspense>
  );
}
