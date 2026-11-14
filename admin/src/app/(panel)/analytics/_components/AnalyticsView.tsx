"use client";

import { useQuery } from "@tanstack/react-query";
import { ExportModal } from "@/components/panel/ExportModal";
import { Note } from "@/components/panel/Note";
import { EmptyState, PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { ANALYTICS_TABS, CITY_OPTIONS, PERIOD_OPTIONS, TYPE_OPTIONS, type AnalyticsTab } from "@/lib/api/analytics";
import { TIER_LABEL } from "@/lib/api/providers";
import { useUrlState } from "@/lib/use-url-state";
import { BlockCard, BlockSkeleton, StatsRow } from "./blocks";

// CON5-02 · التحليلات (3114-24750) · CON5-02 · التحليلات · سلوك العملاء (3400-240630)
// رأس (العنوان 24 Bold + الوصف 13 Light · «تصدير» ثانوي 50 r12 → CON5-M00 تصدير) · فلاتر 40 r10 يمين: الفترة · المدينة · نوع الخدمة · المركز · الفرع
// («الفرع» معطّل «اختر مركزاً أولاً» لحد ما يتختار مركز) · بطاقة التبويبات (إطار r16 حشو 20 مسافة 16) بتبويبات تحت خط.
// تبويب «الطلب» بعد اختيار مركز = Tab=الطلب · جونسون (2126:1004): ملاحظة النطاق + أرقام المركز.
// إطار «سلوك العملاء» في Figma من غير زر «تصدير» — متطبّق زي ما هو.
// الرابط: ?tab=&period=&city=&type=&center=&branch=&modal=export
const DEFAULT_PERIOD = PERIOD_OPTIONS[0].value;

export function AnalyticsView() {
  const url = useUrlState();
  const tabParam = url.get("tab");
  const tab: AnalyticsTab = ANALYTICS_TABS.some((t) => t.key === tabParam) ? (tabParam as AnalyticsTab) : "network";
  const f = {
    period: url.get("period") ?? DEFAULT_PERIOD,
    city: url.get("city") ?? "",
    type: url.get("type") ?? "",
    center: url.get("center") ?? "",
    branch: url.get("branch") ?? "",
  };
  const providers = useQuery({ queryKey: ["providers", { tab: "all" }], queryFn: () => api.providers.list({}) });
  const branches = useQuery({ queryKey: ["providers", "branches", f.center], queryFn: () => api.profile.branches(f.center), enabled: !!f.center });
  const centerName = providers.data?.items.find((p) => p.id === f.center)?.name;
  const branchName = branches.data?.find((b) => b.id === f.branch)?.name;
  const q = useQuery({
    queryKey: ["analytics", tab, f, centerName, branchName],
    queryFn: () => api.analytics.get(tab, { ...f, centerName, branchName }),
    enabled: !f.center || !!centerName,
  });
  const d = q.data;
  const exporting = url.get("modal") === "export";

  return (
    <>
      <PageHead
        title="التحليلات"
        description="مؤشرات الشبكة والطلب والجودة وهامش لينكار والقنوات."
        actions={
          tab === "behavior" ? null : (
            <Button variant="secondary" className="h-[50px]" icon={<Icon name="download" size={18} />} onClick={() => url.push({ modal: "export" })}>
              تصدير
            </Button>
          )
        }
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <Select variant="filter" label="الفترة" value={f.period} options={PERIOD_OPTIONS} onChange={(v) => url.replace({ period: v === DEFAULT_PERIOD ? null : v })} />
        <Select variant="filter" label="المدينة" value={f.city} options={CITY_OPTIONS} onChange={(v) => url.replace({ city: v || null })} />
        <Select variant="filter" label="نوع الخدمة" value={f.type} options={TYPE_OPTIONS} onChange={(v) => url.replace({ type: v || null })} />
        <Select
          variant="filter"
          label="المركز"
          value={f.center}
          options={[{ value: "", label: "كل المراكز" }, ...(providers.data?.items ?? []).map((p) => ({ value: p.id, label: p.name }))]}
          onChange={(v) => url.replace({ center: v || null, branch: null })}
        />
        <Select
          variant="filter"
          label="الفرع"
          value={f.branch}
          disabled={!f.center}
          placeholder="اختر مركزاً أولاً"
          className="disabled:[&>span:last-of-type]:text-muted"
          options={
            f.center
              ? [{ value: "", label: "كل الفروع" }, ...(branches.data ?? []).filter((b) => b.status === "approved").map((b) => ({ value: b.id, label: [b.name, b.code, b.tier ? TIER_LABEL[b.tier] : ""].filter(Boolean).join(" · ") }))]
              : []
          }
          onChange={(v) => url.replace({ branch: v || null })}
        />
      </div>
      <section aria-label="التحليلات" className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs items={ANALYTICS_TABS} value={tab} onChange={(k) => url.replace({ tab: k === "network" ? null : k })} label="تبويبات التحليلات" />
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
        ) : !d ? (
          <>
            <StatsRow loading />
            <BlockSkeleton />
          </>
        ) : (
          <>
            {d.scope ? <Note>{d.scope}</Note> : null}
            {d.stats ? <StatsRow stats={d.stats} /> : null}
            {d.rows.map((row, i) => (
              <div key={i} className="flex flex-col gap-4 lg:flex-row">
                {row.map((b) => (
                  <BlockCard key={b.title} b={b} />
                ))}
              </div>
            ))}
            {d.note ? <Note>{d.note}</Note> : null}
          </>
        )}
      </section>
      <ExportModal
        open={exporting}
        onOpenChange={(o) => !o && url.replace({ modal: null })}
        module="التحليلات"
        tab={ANALYTICS_TABS.find((t) => t.key === tab)?.label}
        filters={{ period: f.period, city: f.city, type: f.type, center: f.center, branch: f.branch }}
      />
    </>
  );
}
