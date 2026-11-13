"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import type { Role } from "@/lib/api/users";
import { arDate, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useTeamData } from "./TeamOverlays";

// CON5-23 · المستخدمون والصلاحيات · الأدوار (3114-25331)
// الأعمدة من اليمين: الدور · المستخدمون · أبرز الصلاحيات · آخر تعديل · الإجراء (عرض لمدير النظام / تعديل الصلاحيات)
export function RolesView() {
  const router = useRouter();
  const { roles } = useTeamData();
  const canEdit = useCan("users", "edit");

  const columns = useMemo<Column<Role>[]>(
    () => [
      {
        id: "role",
        header: "الدور",
        width: 244,
        cell: (r) => (
          <div className="flex flex-col">
            <span className="text-13 font-medium text-ink">{r.name}</span>
            {r.tagline ? <span className="text-12 font-medium text-muted">{r.tagline}</span> : null}
          </div>
        ),
      },
      { id: "members", header: "المستخدمون", width: 90, cell: (r) => <span className="num">{num(r.memberCount)}</span> },
      { id: "highlights", header: "أبرز الصلاحيات", width: 420, cell: (r) => <span className="font-medium">{r.highlights}</span> },
      { id: "updated", header: "آخر تعديل", width: 150, cell: (r) => (r.updatedAt ? `${r.updatedBy} · ${arDate(r.updatedAt)}` : "—") },
      {
        id: "actions",
        header: " ",
        width: 130,
        actions: true,
        cell: (r) => (
          <ButtonLink href={`/settings/roles/${r.id}`} variant="secondary" size="S">
            {r.system || !canEdit ? "عرض" : "تعديل الصلاحيات"}
          </ButtonLink>
        ),
      },
    ],
    [canEdit],
  );

  return (
    <DataTable
      columns={columns}
      data={roles.data?.items}
      getRowId={(r) => r.id}
      loading={roles.isLoading}
      error={roles.isError}
      onRetry={() => roles.refetch()}
      empty={{ title: "لا توجد أدوار بعد", action: canEdit ? <ButtonLink href="/settings/roles/new" size="S">دور جديد</ButtonLink> : null }}
      onRowClick={(r) => router.push(`/settings/roles/${r.id}`)}
      rowLabel={(r) => `محرر الدور ${r.name}`}
    />
  );
}
