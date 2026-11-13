import type { Metadata } from "next";
import { RoleEditor } from "../../_components/RoleEditor";

export const metadata: Metadata = { title: "محرر الدور" };

// CON5-23R · محرر الدور (3114-25621 · ومتغيّراته 3114-25352 … 27506) — /settings/roles/new لدور جديد
export default async function RoleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoleEditor id={id} />;
}
