"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { RowMenu, type RowMenuItem } from "@/components/panel/RowMenu";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { ProviderUserRow } from "@/lib/api/provider-users";
import { arDate, phone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { Chips } from "../_components/tab-bits";
import { ProviderUserOverlays } from "../_components/users/ProviderUserOverlays";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · المستخدمون (3114-54076) · فرع الزهراء (3312-193276) · فرع الحمراء (3312-193658) · فرع المحمدية (3312-194040)
// الرابط: ?tab=users&ubranch=<id> · النوافذ ?modal=pu-add | pu-edit | pu-manage | pu-delete | pu-phone &u=<id> (القسم 2.3)
// الرأس: «مستخدمو لوحة المزوّد» 16 Bold + «إضافة مستخدم» S ثانوي شمال · شرائح الفروع 37 r16 حشو 6·14 13 Medium (#F1F3F2 / المختارة كحلي)
// الجدول: رأس 38 r10 #F4F6F5 حشو 9·12 · صفوف 65 حشو 12 بفاصل #E8ECEA · أعمدة 512/120/100/130/170/40 من غير مسافات.
// القسم 18.1: عمود «بريد الدخول» محذوف (الدخول بالجوال + رمز التحقق).
export default function UsersTab({ profile, canEdit }: ProfileTabProps) {
  const url = useUrlState();
  const id = profile.provider.id;
  const ub = url.get("ubranch") ?? "";
  const branches = useQuery({
    queryKey: ["providers", "users", id, "branches"],
    queryFn: () => api.providerUsers.branchOptions(id),
  });
  const valid = !ub || (branches.data ?? []).some((b) => b.value === ub);
  const list = useQuery({
    queryKey: ["providers", "users", id, "list", ub],
    queryFn: () => api.providerUsers.list(id, { branch: ub || undefined }),
  });
  const qc = useQueryClient();
  const toast = useToast();
  const resume = useMutation({
    mutationFn: (u: ProviderUserRow) => api.providerUsers.resume(id, u.id),
    onSuccess: (_x, u) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast("أُعيد تفعيل الحساب", `أُعيد تفعيل حساب ${u.name}`);
    },
  });
  const open = (modal: string, u?: string) => url.push({ modal, u: u ?? null });

  const menu = (u: ProviderUserRow): RowMenuItem[] => [
    { label: "تعديل البيانات", icon: "edit", onSelect: () => open("pu-edit", u.id) },
    u.status === "paused"
      ? { label: "إعادة تفعيل", icon: "check", onSelect: () => resume.mutate(u) }
      : { label: "إيقاف مؤقت", icon: "clock", onSelect: () => open("pu-manage", u.id) },
    { label: "حذف", icon: "trash", disabled: u.kind === "owner", onSelect: () => open("pu-delete", u.id) },
  ];
  const columns: Column<ProviderUserRow>[] = [
    {
      id: "user",
      header: "المستخدم",
      width: 512,
      cell: (u) => (
        <span className="flex flex-col gap-0.5">
          <span className="text-13 leading-5 font-semibold text-ink">{u.name}</span>
          <span className="text-12 leading-[18px] font-light text-muted">
            <bdi dir="ltr">{u.phone ? phone(u.phone) : "—"}</bdi>
          </span>
        </span>
      ),
    },
    { id: "role", header: "الدور", width: 120, cell: (u) => <span className="font-normal">{u.roleLabel}</span> },
    { id: "branch", header: "الفرع", width: 100, cell: (u) => <span className="font-normal">{u.branchLabel}</span> },
    { id: "last", header: "آخر دخول", width: 130, cell: (u) => <span className="num font-normal">{u.lastLogin ? arDate(u.lastLogin) : "—"}</span> },
    {
      id: "status",
      header: "الحالة",
      width: 170,
      cell: (u) =>
        u.status === "paused" ? (
          <Pill tone="danger">موقوف</Pill>
        ) : (
          // «نشط» أصفر = أُضيف ولسه ما دخلش (Figma: سلطان الحارثي · طلب إضافة REQ-0429)
          <Pill tone="success" className={u.status === "new" ? "bg-[#fdf3e1]! text-warning!" : undefined}>
            نشط
          </Pill>
        ),
    },
    {
      id: "actions",
      header: "",
      width: 40,
      actions: true,
      // الزر 32 على يمين خانة الـ40 (Figma C6)
      cell: (u) =>
        canEdit ? (
          <div className="flex w-10 justify-start">
            <RowMenu items={menu(u)} label={`إجراءات ${u.name}`} />
          </div>
        ) : null,
    },
  ];

  const chips = [{ value: "", label: "كل الفروع" }, ...(branches.data ?? []).map((b) => ({ value: b.value, label: b.short }))];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-16 leading-6 font-bold text-ink">مستخدمو لوحة المزوّد</h2>
        {canEdit ? (
          <Button variant="secondary" size="S" icon={<Icon name="plus" size={14} />} onClick={() => open("pu-add")}>
            إضافة مستخدم
          </Button>
        ) : null}
      </div>
      {branches.isLoading ? (
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[37px] w-20 rounded-16" />
          ))}
        </div>
      ) : (
        <Chips items={chips} value={valid ? ub : ""} onChange={(v) => url.replace({ ubranch: v || null })} label="الفرع" />
      )}
      <DataTable
        columns={columns}
        data={list.data?.items}
        getRowId={(u) => u.id}
        loading={list.isLoading}
        error={list.isError}
        onRetry={() => list.refetch()}
        filtered={!!ub}
        onClearFilters={() => url.replace({ ubranch: null })}
        empty={{
          title: "لا يوجد مستخدمون بعد",
          body: "أضف مستخدمي لوحة المزوّد: المالك ومديري الفروع والفنيين.",
          action: canEdit ? (
            <Button variant="secondary" size="S" onClick={() => open("pu-add")}>
              إضافة مستخدم
            </Button>
          ) : undefined,
        }}
        gap={0}
        edge={12}
        headRadius={10}
        rowPadY={12}
        rowClassName="border-divider"
        skeletonRows={7}
      />
      <ProviderUserOverlays profile={profile} />
    </>
  );
}
