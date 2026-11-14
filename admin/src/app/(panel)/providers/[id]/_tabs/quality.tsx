"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { ComplaintRow } from "@/lib/api/provider-tabs";
import { arDate, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { Chips } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الجودة والتقييم (3114-51034 · ردود بانتظار الاعتماد 3302-138749)
// القسم 1.5 / 15: «الشكل فقط في المرحلة الأولى» — بطاقة التقييم بأرقام صفر + الشرائح + جدول الشكاوى برأسه وحالة فاضية.
// بطاقة التقييم: إطار r14 حشو 16 مسافة 12 · «★ 4.9 · 320 تقييماً» 18 Bold · 5 أشرطة (عنوان 13 Medium + عدد شمال · مسار 8 #EEF1EF والشريط أخضر).
// الشرائح: العرض (تقييمات الخدمات · الشكاوى · تقييمات الفروع) ثم الفلتر (بانتظار الرد · مفتوحة · 3 نجوم فأقل · ردود بانتظار اعتماد لينكار).
// «ردود بانتظار اعتماد لينكار» (3302-138749): من غير بطاقة التقييم — قائمة ردود المزوّد (هنا حالة فاضية).
// الرابط: ?tab=quality&qview=services|complaints|branches&qf=waiting|open|low|replies
const VIEWS = [
  { value: "services", label: "تقييمات الخدمات" },
  { value: "complaints", label: "الشكاوى" },
  { value: "branches", label: "تقييمات الفروع" },
] as const;
const FILTERS = [
  { value: "waiting", label: "بانتظار الرد" },
  { value: "open", label: "مفتوحة" },
  { value: "low", label: "3 نجوم فأقل" },
  { value: "replies", label: "ردود بانتظار اعتماد لينكار" },
] as const;
const STARS = ["5 نجوم", "4 نجوم", "3 نجوم", "نجمتان", "نجمة"];
type View = (typeof VIEWS)[number]["value"];
type Filter = (typeof FILTERS)[number]["value"];

export default function QualityTab({ profile }: ProfileTabProps) {
  const url = useUrlState();
  const id = profile.provider.id;
  const view: View = VIEWS.some((v) => v.value === url.get("qview")) ? (url.get("qview") as View) : "complaints";
  const filter: Filter = FILTERS.some((v) => v.value === url.get("qf")) ? (url.get("qf") as Filter) : "open";
  const q = useQuery({ queryKey: ["providers", "quality", id, view, filter], queryFn: () => api.providerTabs.quality(id, { view, filter }) });
  const d = q.data;
  const replies = filter === "replies";
  const maxStars = Math.max(1, ...(d?.stars ?? [0]));

  const columns: Column<ComplaintRow>[] = [
    { id: "code", header: "الشكوى", width: 90, cell: (r) => <span className="font-medium">{r.code}</span> },
    {
      id: "customer",
      header: "العميل والحجز",
      width: 396,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium">{r.customer}</span>
          <span className="text-12 font-medium text-muted">
            <bdi dir="ltr">{r.booking}</bdi> · {r.branch}
          </span>
        </span>
      ),
    },
    { id: "category", header: "التصنيف", width: 130, cell: (r) => r.category },
    { id: "opened", header: "فُتحت", width: 140, cell: (r) => arDate(r.openedAt) },
    {
      id: "status",
      header: "الحالة",
      width: 160,
      cell: (r) => (r.status === "at-linkar" ? <Pill size="S" className="bg-[#f8e9e9] text-danger">لدى لينكار</Pill> : <Pill size="S" tone="pending">بانتظار رد المركز</Pill>),
    },
    { id: "actions", header: "", width: 110, actions: true, cell: () => null },
  ];

  return (
    <>
      {replies ? null : (
        <section aria-label="التقييم" className="flex flex-col gap-3 rounded-14 border border-border bg-white p-4">
          {d ? (
            <p className="text-18 leading-[30px] font-bold text-ink">
              <span className="text-star">★</span> {d.reviews ? d.rating.toFixed(1) : "0"} · {num(d.reviews)} تقييماً
            </p>
          ) : (
            <Skeleton className="h-[30px] w-48" />
          )}
          {STARS.map((label, i) => {
            const n = d?.stars[i] ?? 0;
            return (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-13 leading-[22px] font-medium text-ink">
                  <span>{label}</span>
                  <span className="num">{d ? num(n) : "—"}</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-[4px] bg-surface-2">
                  <span className="h-full rounded-[4px] bg-lime" style={{ width: `${(n / maxStars) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      )}
      <Chips items={VIEWS} value={view} onChange={(v) => url.replace({ qview: v === "complaints" ? null : v })} label="نوع التقييم" />
      <Chips items={FILTERS} value={filter} onChange={(v) => url.replace({ qf: v === "open" ? null : v })} label="فلتر" />
      {replies ? (
        q.isError ? (
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        ) : q.isLoading ? (
          <Skeleton className="h-40 w-full rounded-16" />
        ) : (
          <EmptyState title="لا توجد ردود بانتظار الاعتماد" body="تظهر هنا ردود المزوّد على التقييمات والشكاوى قبل نشرها للعملاء." />
        )
      ) : (
        <>
          <h2 className="text-16 leading-[26px] font-medium text-ink">
            {VIEWS.find((v) => v.value === view)!.label} · {num(view === "complaints" ? (d?.complaints.length ?? 0) : 0)}
          </h2>
          {view === "complaints" ? (
            <DataTable
              columns={columns}
              data={d?.complaints}
              getRowId={(r) => r.code}
              loading={q.isLoading}
              error={q.isError}
              onRetry={() => q.refetch()}
              empty={{ title: "لا توجد شكاوى" }}
              skeletonRows={2}
            />
          ) : (
            // تقييمات الخدمات / الفروع: مش مرسومة كجدول في Figma — حالة فاضية لحد ما الخادم يجهز
            <EmptyState title="لا توجد تقييمات" />
          )}
        </>
      )}
    </>
  );
}
