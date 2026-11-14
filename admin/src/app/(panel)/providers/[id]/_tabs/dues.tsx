"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { CURRENT_MONTH, MONTH_OPTIONS, type DuesRow } from "@/lib/api/provider-tabs";
import { arDate, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { SectionTitle } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · المستحقات (3114-50726)
// القسم 1.5 / 15: «الشكل فقط في المرحلة الأولى» — بطاقة الشهر بأرقام صفر وجدولي «المطالبات» و«التحويلات» برؤوسهم وحالة فاضية.
// البطاقة: إطار r14 حشو 16 مسافة 8 · الرأس: «المستحقات · <الشهر>» 16 Bold + سهم 24 (يمين) · «كشف <الشهر>» ثانوي 46 + ملف (نص) ·
// «إصدار فاتورة وتحويل» S بإطار + إعدادات (شمال) · سطر «خدمات معتمدة» (13 Light رمادي / القيمة 13 Medium).
// «إصدار فاتورة وتحويل» → CON5-14M تحويل · «كشف أكتوبر» → CON5-14D (قسم الفواتير — قريباً). الرابط: ?tab=dues&month=
const MONTHS = MONTH_OPTIONS.map((m) => ({ value: m.value, label: `المستحقات · ${m.label}` }));

export default function DuesTab({ profile }: ProfileTabProps) {
  const url = useUrlState();
  const id = profile.provider.id;
  const month = url.get("month") ?? CURRENT_MONTH;
  const q = useQuery({ queryKey: ["providers", "dues", id, month], queryFn: () => api.providerTabs.dues(id, month) });
  const d = q.data;
  const monthName = month.split(" ")[0];

  const columns: Column<DuesRow>[] = [
    { id: "ref", header: "المطالبة · التحويل", width: 150, cell: (r) => <bdi dir="ltr">{r.ref}</bdi> },
    { id: "period", header: "عن فترة", width: 120, cell: (r) => r.period },
    { id: "bookings", header: "الحجوزات", width: 110, cell: (r) => num(r.bookings) },
    { id: "amount", header: "المبلغ", width: 110, cell: (r) => num(r.amount) },
    { id: "account", header: "الحساب", width: 322, cell: (r) => r.account },
    { id: "date", header: "تاريخ التحويل", width: 140, cell: (r) => arDate(r.date) },
    { id: "status", header: "الحالة", width: 120, cell: (r) => (r.status === "transferred" ? <Pill tone="success">تم التحويل</Pill> : <Pill className="bg-info-tint text-info">قيد النظر</Pill>) },
  ];
  const table = (rows: DuesRow[] | undefined, empty: string) => (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.ref}
      loading={q.isLoading}
      error={q.isError}
      onRetry={() => q.refetch()}
      empty={{ title: empty }}
      gap={0}
      edge={12}
      headRadius={10}
      rowPadY={12}
      rowClassName="border-divider"
      skeletonRows={2}
    />
  );

  return (
    <>
      <section aria-label="المستحقات" className="flex flex-col gap-2 rounded-14 border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Select
            value={month}
            onChange={(v) => url.replace({ month: v === CURRENT_MONTH ? null : v })}
            options={MONTHS}
            ariaLabel="شهر المستحقات"
            icon="chevron-down"
            className="h-[46px]! w-fit! border-transparent! px-0! hover:bg-transparent! [&>span]:flex-none! [&>span]:text-16! [&>span]:leading-6! [&>span]:font-bold! [&>svg]:size-6!"
          />
          <ButtonLink href={`/coming-soon?s=invoices&statement=${id}&month=${encodeURIComponent(month)}`} variant="secondary" className="h-[46px]! px-4 text-14">
            {`كشف ${monthName}`}
            <Icon name="file" size={16} />
          </ButtonLink>
          <ButtonLink href={`/coming-soon?s=invoices&transfer=${id}`} variant="secondary" size="S" className="gap-1! px-2.5">
            إصدار فاتورة وتحويل
            <Icon name="settings" size={14} />
          </ButtonLink>
        </div>
        <div className="flex items-center justify-between gap-3 py-1.5 text-13 leading-5">
          <span className="font-light text-muted">خدمات معتمدة</span>
          {d ? (
            <span className="num font-medium text-ink">
              {num(d.approved.amount)} ر.س · {num(d.approved.bookings)} حجزاً
            </span>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}
        </div>
      </section>
      <SectionTitle>المطالبات</SectionTitle>
      {table(d?.claims, "لا توجد مطالبات")}
      <SectionTitle>التحويلات</SectionTitle>
      {table(d?.transfers, "لا توجد تحويلات")}
    </>
  );
}
