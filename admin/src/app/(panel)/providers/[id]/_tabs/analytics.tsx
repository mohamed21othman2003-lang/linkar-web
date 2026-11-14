"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { SERVICE_TYPES } from "@/lib/api/providers";
import { ANALYTICS_PERIODS } from "@/lib/api/provider-tabs";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { BlockCard, BlockSkeleton } from "../../../analytics/_components/blocks";
import { FilterSelect } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · التحليلات (3114-24787)
// البيانات: api.providerTabs.analytics ← api.analytics.get("demand", { center: id }) (نفس «التحليلات» بفلتر المركز ?center=lk-jn-001)
// — البطاقتين بمكوّن BlockCard بتاع صفحة التحليلات، والأرقام الأربعة بتاعة التبويب (منفّذة · مبيعات المنفّذ · هامش لينكار).
// الفلاتر يمين (الفترة · المدينة · نوع الخدمة · الفرع) 40 r10 · ثم «CON7 · التحليلات» بإطار r16 حشو 20 مسافة 16:
// 4 أرقام (#F4F6F5 r12 حشو 14 · الرقم 18 Bold · العنوان 12 Medium رمادي) + «الحجوزات الشهرية» (أعمدة 44 r6، الشهر الحالي أخضر) و«حسب الفرع» (أشرطة 8 r4).
// الرابط: ?tab=analytics&aperiod=&acity=&atype=&abranch=
export default function AnalyticsTab({ profile }: ProfileTabProps) {
  const url = useUrlState();
  const p = profile.provider;
  const f = {
    period: url.get("aperiod") ?? ANALYTICS_PERIODS[0].value,
    city: url.get("acity") ?? "",
    type: url.get("atype") ?? "",
    branch: url.get("abranch") ?? "",
  };
  const q = useQuery({ queryKey: ["providers", "analytics", p.id, f], queryFn: () => api.providerTabs.analytics(p.id, f) });
  const branches = useQuery({ queryKey: ["providers", "branches", p.id], queryFn: () => api.profile.branches(p.id) });
  const d = q.data;

  return (
    <>
      {/* Figma: «Page head» فاضي ارتفاعه 1 قبل الفلاتر (فالفلاتر بتنزل 17) */}
      <div aria-hidden className="h-px" />
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect semibold={false} label="الفترة" value={f.period} options={ANALYTICS_PERIODS} onChange={(v) => url.replace({ aperiod: v === ANALYTICS_PERIODS[0].value ? null : v })} />
        <FilterSelect semibold={false} label="المدينة" value={f.city} options={[{ value: "", label: "الكل" }, { value: p.city, label: p.city }]} onChange={(v) => url.replace({ acity: v || null })} />
        <FilterSelect semibold={false} label="نوع الخدمة" value={f.type} options={[{ value: "", label: "الكل" }, ...SERVICE_TYPES.map((t) => ({ value: t, label: t }))]} onChange={(v) => url.replace({ atype: v || null })} />
        <FilterSelect
          semibold={false}
          label="الفرع"
          value={f.branch}
          options={[{ value: "", label: "كل الفروع" }, ...(branches.data ?? []).filter((b) => b.status === "approved").map((b) => ({ value: b.id, label: `فرع ${b.name}` }))]}
          onChange={(v) => url.replace({ abranch: v || null })}
        />
      </div>
      <section aria-label={`تحليلات ${p.name}`} className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        {q.isError ? (
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <Stat value={d && num(d.kpis.month)} label="حجوزات الشهر" />
              <Stat value={d && num(d.kpis.done)} label="منفّذة" />
              <Stat value={d && num(d.kpis.sales)} label="مبيعات المنفّذ · ر.س" />
              <Stat value={d && num(d.kpis.margin)} label="هامش لينكار · ر.س" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 [&>section]:min-h-[318px]">
              {d ? d.blocks.map((b) => <BlockCard key={b.title} b={b} />) : Array.from({ length: 2 }, (_, i) => <BlockSkeleton key={i} />)}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function Stat({ value, label }: { value?: string; label: string }) {
  return (
    <div className="flex flex-col rounded-12 bg-surface-1 p-3.5">
      {value === undefined ? <Skeleton className="my-1.5 h-[18px] w-16" /> : <span className="num text-18 leading-[30px] font-bold text-ink">{value}</span>}
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
    </div>
  );
}
