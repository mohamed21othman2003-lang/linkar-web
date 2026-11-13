import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamShell } from "../_components/TeamShell";
import { UsersView } from "../_components/UsersView";

export const metadata: Metadata = { title: "المستخدمون والصلاحيات" };

// CON5-23 · المستخدمون والصلاحيات (3114-24841)
export default function UsersPage() {
  return (
    <Suspense>
      <TeamShell tab="users">
        <UsersView />
      </TeamShell>
    </Suspense>
  );
}
