"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { SERVICE_TYPES } from "@/lib/api/providers";
import { ANALYTICS_PERIODS } from "@/lib/api/provider-tabs";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { FilterSelect } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · التحليلات (3114-24787)
// القسم 1.5 / 15: «الشكل فقط في المرحلة الأولى: الأرقام صفر» — نفس البطاقات والرسمين بأرقام صفر من api.providerTabs.analytics.
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
  const max = Math.max(1, ...(d?.monthly ?? []).map((m) => m.value));

  return (
    <>
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card title="الحجوزات الشهرية" sub={p.short || p.name}>
                <div className="flex h-[210px] items-end gap-3.5">
                  {d
                    ? d.monthly.map((m) => (
                        <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                          <span className="num text-12 leading-5 font-medium text-ink">{num(m.value)}</span>
                          <span aria-hidden className={`w-11 rounded-[6px] ${m.current ? "bg-lime" : "bg-ink"}`} style={{ height: Math.round((m.value / max) * 150) }} />
                          <span className="text-12 leading-5 font-medium text-muted">{m.month}</span>
                        </div>
                      ))
                    : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-full flex-1 rounded-[6px]" />)}
                </div>
              </Card>
              <Card title="حسب الفرع">
                {d ? (
                  d.byBranch.length ? (
                    d.byBranch.map((b) => (
                      <div key={b.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2 text-13 leading-[22px] font-medium text-ink">
                          <span>{b.name}</span>
                          <span dir="ltr" className="num">
                            {num(b.count)} · {num(b.pct)}%
                          </span>
                        </div>
                        <div className="flex h-2 justify-start overflow-hidden rounded-[4px] bg-surface-2">
                          <span className="h-full rounded-[4px] bg-ink" style={{ width: `${b.pct}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-13 text-muted">لا توجد فروع معتمدة بعد</p>
                  )
                ) : (
                  Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[34px] w-full" />)
                )}
              </Card>
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

function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[318px] flex-col gap-3.5 rounded-16 border border-border bg-white p-5">
      <div className="flex flex-col">
        <h3 className="text-18 leading-[30px] font-bold text-ink">{title}</h3>
        {sub ? <p className="text-13 leading-[22px] font-light text-muted">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}
