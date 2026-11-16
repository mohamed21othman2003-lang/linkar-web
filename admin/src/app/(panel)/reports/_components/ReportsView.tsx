"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExportModal } from "@/components/panel/ExportModal";
import { EmptyState, PageHead } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { FROM_OPTIONS, REPORT_DEFAULTS, REPORT_GROUPS, REPORT_KEYS, REPORT_PERIODS, TO_OPTIONS, type PillTone, type ReportCell, type ReportKey } from "@/lib/api/reports";
import { useUrlState } from "@/lib/use-url-state";
import { DataGrid } from "../../analytics/_components/blocks";

// CON5-02R · التقارير (3114-24825) · المحتوى = «CON5 · محتوى التقارير» (2126:1282) بتسع تقارير
// رأس: العنوان 24 Bold + الوصف · «تصدير» رئيسي كحلي 44 r10 بأيقونة خضرا → CON5-M00 تصدير
// يمين: قائمة التقارير 280 (إطار r16 حشو 12 مسافة 4 · عناوين المجموعات 12 Medium رمادي · بنود 44 r10 · المختار كحلي بنص أبيض وأيقونة خضرا)
// شمال: بطاقة التقرير (إطار r16 حشو 20 مسافة 16): العنوان 18 Bold + الوصف · فلاتر (الفترة · من · إلى · المدينة) حقول 44 r10 بعنوان 12 Medium
// + «عرض التقرير» (يطبّق الفلاتر) و«إعادة تعيين» (→ CON5-T00 «أُعيدت فلاتر التقرير للوضع الافتراضي · أكتوبر 2026 · كل المدن») · سطر العدد · الجدول · الصفحات.
// الرابط: ?report=&period=&from=&to=&scope=&page=&modal=export
const PILL: Record<PillTone, string> = {
  success: "bg-success-tint text-success",
  pending: "bg-pending-tint text-pending",
  danger: "bg-[#f8e9e9] text-danger",
  info: "bg-info-tint text-[#2b5f8e]",
  neutral: "bg-surface-2 text-ink",
};

export function ReportsView() {
  const url = useUrlState();
  const toast = useToast();
  const rp = url.get("report");
  const key: ReportKey = REPORT_KEYS.includes(rp as ReportKey) ? (rp as ReportKey) : "providers";
  const applied = {
    period: url.get("period") ?? REPORT_DEFAULTS.period,
    from: url.get("from") ?? REPORT_DEFAULTS.from,
    to: url.get("to") ?? REPORT_DEFAULTS.to,
    scope: url.get("scope") ?? "",
  };
  const page = Number(url.get("page") ?? 1) || 1;
  const q = useQuery({ queryKey: ["reports", key, applied, page], queryFn: () => api.reports.get(key, { ...applied, page }) });
  const d = q.data;
  // الفلاتر مسودة لحد «عرض التقرير»
  const appliedKey = `${key}|${applied.period}|${applied.from}|${applied.to}|${applied.scope}`;
  const [draft, setDraft] = useState({ ...applied, key: appliedKey });
  const f = draft.key === appliedKey ? draft : { ...applied, key: appliedKey };
  const set = (patch: Partial<typeof applied>) => setDraft({ ...f, ...patch });
  const reset = useMutation({
    mutationFn: api.reports.defaults,
    onSuccess: (v) => {
      url.replace({ period: null, from: null, to: null, scope: null, page: null });
      setDraft({ ...v, key: `${key}|${v.period}|${v.from}|${v.to}|${v.scope}` });
      toast("أُعيدت الفلاتر", "أُعيدت فلاتر التقرير للوضع الافتراضي · أكتوبر 2026 · كل المدن");
    },
  });
  const apply = () =>
    url.replace({
      period: f.period === REPORT_DEFAULTS.period ? null : f.period,
      from: f.from === REPORT_DEFAULTS.from ? null : f.from,
      to: f.to === REPORT_DEFAULTS.to ? null : f.to,
      scope: f.scope || null,
      page: null,
    });
  const exporting = url.get("modal") === "export";
  const reportLabel = REPORT_GROUPS.flatMap((g) => g.items).find((i) => i.key === key)?.label;

  return (
    <>
      <PageHead
        title="التقارير"
        description="اختر التقرير وحدّد الفترة، ثم صدّره بصيغة Excel أو PDF."
        actions={
          <Button className="h-11 rounded-10" icon={<Icon name="download" size={16} className="text-lime" />} onClick={() => url.push({ modal: "export" })}>
            تصدير
          </Button>
        }
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <nav aria-label="التقارير" className="flex flex-col gap-1 rounded-16 border border-border bg-white p-3 lg:w-[280px] lg:shrink-0">
          {REPORT_GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-1">
              <span className="px-2 pt-2 pb-1 text-12 leading-5 font-medium text-muted">{g.title}</span>
              {g.items.map((it) => (
                <ReportLink key={it.key} label={it.label} icon={it.icon} active={it.key === key} onClick={() => url.replace({ report: it.key === "providers" ? null : it.key, period: null, from: null, to: null, scope: null, page: null })} />
              ))}
            </div>
          ))}
        </nav>
        <section aria-labelledby="report-title" className="flex min-w-0 flex-1 flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-0.5">
            {d ? (
              <>
                <h2 id="report-title" className="text-18 leading-[30px] font-bold text-ink">
                  {d.title}
                </h2>
                <p className="text-13 leading-[22px] font-light text-muted">{d.description}</p>
              </>
            ) : (
              <>
                <Skeleton className="my-1 h-[22px] w-48" />
                <Skeleton className="h-[18px] w-72" />
              </>
            )}
          </div>
          {/* الموبايل: كل حقل في سطر لوحده بعرض كامل — التاريخ «1 أكتوبر 2026» كان بيتكسر على سطرين في 130px */}
          <div className="flex flex-wrap items-end gap-2.5">
            <FieldSelect label="الفترة" icon="calendar" value={f.period} options={REPORT_PERIODS} onChange={(v) => set({ period: v })} className="w-[138px] max-sm:w-full" />
            <FieldSelect label="من" icon="calendar" value={f.from} options={FROM_OPTIONS} onChange={(v) => set({ from: v })} className="w-[130px] max-sm:w-full" wrap />
            <FieldSelect label="إلى" icon="calendar" value={f.to} options={TO_OPTIONS} onChange={(v) => set({ to: v })} className="w-[130px] max-sm:w-full" wrap />
            <FieldSelect label={d?.scope.label ?? "المدينة"} icon={d?.scope.icon ?? "map-pin"} value={f.scope} options={d?.scope.options ?? [{ value: "", label: "الكل" }]} onChange={(v) => set({ scope: v })} className="w-[121px] max-sm:w-full" />
            <div className="flex items-end gap-2.5 max-sm:w-full sm:me-auto">
              <Button className="h-11 rounded-10 max-sm:flex-1" onClick={apply}>
                عرض التقرير
              </Button>
              <Button variant="secondary" className="h-[46px] rounded-10 max-sm:flex-1" loading={reset.isPending} onClick={() => reset.mutate()}>
                إعادة تعيين
              </Button>
            </div>
          </div>
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
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[22px] w-40" />
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-[45px] w-full" />
              ))}
            </div>
          ) : !d.rows.length ? (
            <EmptyState
              title="لا توجد نتائج"
              body="جرّب تغيير الفلاتر."
              action={
                <Button variant="secondary" size="S" onClick={() => reset.mutate()}>
                  مسح الفلاتر
                </Button>
              }
            />
          ) : (
            <>
              <p className="num text-13 leading-[22px] font-light text-muted">{d.range}</p>
              <DataGrid<ReportCell> cols={d.cols} rows={d.rows} label={d.title} rowPad="px-2.5 py-3.5" flexMin={80} renderCell={(c) => <ReportCellView c={c} />} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-13 leading-5 font-light text-muted">
                  صفحة {d.page} من {d.pages}
                </span>
                <div dir="ltr" className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(d.pages, 3) }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`صفحة ${n}`}
                      aria-current={n === d.page ? "page" : undefined}
                      onClick={() => url.replace({ page: n === 1 ? null : String(n) })}
                      className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${n === d.page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      <ExportModal open={exporting} onOpenChange={(o) => !o && url.replace({ modal: null })} module="التقارير" tab={reportLabel} filters={applied} />
    </>
  );
}

function ReportLink({ label, icon, active, onClick }: { label: string; icon: UiGlyph; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 items-center gap-2.5 rounded-10 px-3 text-start text-14 font-medium ${active ? "bg-ink text-white" : "text-ink hover:bg-surface-1"}`}
    >
      <Icon name={icon} size={16} className={`shrink-0 ${active ? "text-lime" : ""}`} />
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

function FieldSelect({ label, icon, value, options, onChange, className, wrap }: { label: string; icon: UiGlyph; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; className?: string; wrap?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 max-sm:flex-1 ${className ?? ""}`}>
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
      <span className="relative">
        <Icon name={icon} size={16} className="pointer-events-none absolute inset-y-0 start-3 z-10 my-auto text-ink" />
        <Select
          value={value}
          onChange={onChange}
          options={options}
          ariaLabel={label}
          className={`ps-9 ${wrap ? "[&>span:first-child]:overflow-visible [&>span:first-child]:leading-[22px] [&>span:first-child]:whitespace-normal" : ""}`}
        />
      </span>
    </label>
  );
}

function ReportCellView({ c }: { c: ReportCell }) {
  if (typeof c === "string") return <>{c}</>;
  if (c.pill) return <span className={`inline-flex h-[22px] items-center rounded-8 px-2 text-12 font-medium whitespace-nowrap ${PILL[c.pill]}`}>{c.text}</span>;
  return <span className={c.medium ? "font-medium" : undefined}>{c.text}</span>;
}
