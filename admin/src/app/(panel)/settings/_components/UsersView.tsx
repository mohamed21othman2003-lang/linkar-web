"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { PanelUser } from "@/lib/api/users";
import { arDate } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { StatusPill, lastLoginLabel, useTeamData } from "./TeamOverlays";

// CON5-23 · المستخدمون والصلاحيات (3114-24841) — تبويب «المستخدمون»
// الأعمدة من اليمين: المستخدم · الدور · النطاق · آخر دخول · الحالة · الإجراءات (التفاصيل · إيقاف · تعديل / حذف الدعوة · إعادة الإرسال)
export function UsersView() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const { users, roles } = useTeamData();
  const roleName = useMemo(() => new Map(roles.data?.items.map((r) => [r.id, r.name])), [roles.data]);
  const canEdit = useCan("users", "edit");

  const resend = useMutation({
    mutationFn: (id: string) => api.users.resendInvite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast("أُعيدت الدعوة", "أُعيد إرسال الدعوة");
    },
  });
  const reactivate = useMutation({
    mutationFn: (id: string) => api.users.reactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast("أُعيد تفعيل الحساب", "أُعيد تفعيل الحساب");
    },
  });

  const columns = useMemo<Column<PanelUser>[]>(
    () => [
      {
        id: "user",
        header: "المستخدم",
        width: 221,
        cell: (u) => (
          <div className="flex flex-col">
            <span className="text-13 font-medium text-ink">{u.name}</span>
            <bdi dir="ltr" className="text-end text-12 font-medium text-muted">
              {u.email}
            </bdi>
          </div>
        ),
      },
      { id: "role", header: "الدور", width: 170, cell: (u) => roleName.get(u.roleId) ?? "—" },
      { id: "scope", header: "النطاق", width: 110, cell: (u) => u.scope },
      { id: "last", header: "آخر دخول", width: 150, cell: (u) => lastLoginLabel(u) },
      {
        id: "status",
        header: "الحالة",
        width: 140,
        cell: (u) => (
          <div className="flex flex-col items-start gap-0.5">
            <StatusPill u={u} />
            {u.isMe ? <span className="text-12 font-medium text-muted">أنت</span> : null}
            {u.status === "invited" && u.invitedAt ? <span className="text-12 font-medium whitespace-nowrap text-muted">أُرسلت {arDate(u.invitedAt)}</span> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: " ",
        width: 233,
        actions: true,
        cell: (u) => (
          <>
            <button
              type="button"
              aria-label={`تفاصيل ${u.name}`}
              title="التفاصيل"
              onClick={() => url.push({ user: u.id, modal: null })}
              className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1"
            >
              <Icon name="info" size={18} />
            </button>
            {u.isMe || !canEdit ? null : u.status === "invited" ? (
              <>
                <Button variant="secondary" size="S" className="text-danger-strong!" onClick={() => url.push({ modal: "delete-invite", user: u.id })}>
                  حذف الدعوة
                </Button>
                <Button variant="secondary" size="S" loading={resend.isPending && resend.variables === u.id} onClick={() => resend.mutate(u.id)}>
                  إعادة الإرسال
                </Button>
              </>
            ) : (
              <>
                {u.status === "suspended" ? (
                  <Button variant="secondary" size="S" loading={reactivate.isPending && reactivate.variables === u.id} onClick={() => reactivate.mutate(u.id)}>
                    إعادة التفعيل
                  </Button>
                ) : (
                  <Button variant="secondary" size="S" className="text-danger-strong!" onClick={() => url.push({ modal: "suspend", user: u.id })}>
                    إيقاف
                  </Button>
                )}
                <Button variant="secondary" size="S" onClick={() => url.push({ modal: "edit", user: u.id })}>
                  تعديل
                </Button>
              </>
            )}
          </>
        ),
      },
    ],
    [roleName, canEdit, url, resend, reactivate],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={users.data?.items}
        getRowId={(u) => u.id}
        loading={users.isLoading}
        error={users.isError}
        onRetry={() => users.refetch()}
        empty={{ title: "لا يوجد مستخدمون بعد", body: "ادعُ أول عضو في فريق لينكار.", action: canEdit ? <Button size="S" onClick={() => url.push({ modal: "invite" })}>دعوة مستخدم</Button> : null }}
        onRowClick={(u) => url.push({ user: u.id, modal: null })}
        rowLabel={(u) => `تفاصيل ${u.name}`}
      />
      <Note>كل الحسابات بالبريد المؤسسي وتحقق بخطوتين إلزامي. «إدارة المحتوى» تستخدم نفس الحسابات والأدوار.</Note>
    </>
  );
}
