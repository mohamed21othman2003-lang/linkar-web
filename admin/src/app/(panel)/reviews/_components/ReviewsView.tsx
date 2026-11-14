"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { COMPLAINT_CATEGORIES, COMPLAINT_STAGES, QUALITY_CENTERS, type ComplaintRow, type ReviewRow } from "@/lib/api/reviews";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { InfoBtn, SPill } from "../../field-evaluation/_components/bits";
import { ComplaintDrawer } from "./ComplaintDrawer";
import { QualityModals } from "./QualityModals";
import { ReviewDrawer } from "./ReviewDrawer";

// CON5-18 · التقييمات والشكاوى (3114:414 — تبويب «الشكاوى») · التقييمات (3114:1248)
// الرابط: /reviews?tab=reviews&center=&category=&stage=&stars=&state=&q=&page=&complaint=CM-…|review=RV-…&modal=rv-… (القسم 2.3)
type Tab = "complaints" | "reviews";
const ALL = "__all";
const opts = (l: { value: string; label: string }[]) => [{ value: ALL, label: "الكل" }, ...l];
const CENTER_OPTS = opts(QUALITY_CENTERS.map((c) => ({ value: c, label: c.replace("‏", "") })));
const STARS_OPTS = opts([5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) })));
const STATE_OPTS = opts([
  { value: "flagged", label: "بلاغ" },
  { value: "published", label: "منشور" },
  { value: "hidden", label: "مخفي" },
]);

function Two({ top, sub, light }: { top: React.ReactNode; sub?: string; light?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`text-13 leading-[22px] text-ink ${light ? "font-light" : "font-medium"}`}>{top}</span>
      {sub ? <span className="text-12 leading-5 font-medium text-muted">{sub}</span> : null}
    </div>
  );
}
function Status({ s }: { s: { label: string; tone: ComplaintRow["status"]["tone"]; sub?: string } }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <SPill tone={s.tone}>{s.label}</SPill>
      {s.sub ? <span className="text-12 leading-5 font-medium text-muted">{s.sub}</span> : null}
    </div>
  );
}

export function ReviewsView() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const [exportOpen, setExportOpen] = useState(false);
  const tab: Tab = url.get("tab") === "reviews" || (!url.get("tab") && url.get("review")) ? "reviews" : "complaints";
  const f = { center: url.get("center") ?? "", category: url.get("category") ?? "", stage: url.get("stage") ?? "", stars: url.get("stars") ?? "", state: url.get("state") ?? "", search: url.get("q") ?? "" };
  const page = Number(url.get("page") ?? 1) || 1;
  const filtered = tab === "complaints" ? !!(f.center || f.category || f.stage || f.search) : !!(f.center || f.stars || f.state || f.search);
  const k = useQuery({ queryKey: ["quality", "kpis"], queryFn: () => api.quality.kpis() });
  const cq = useQuery({ queryKey: ["quality", "complaints", f, page], queryFn: () => api.quality.complaints({ ...f, page }), enabled: tab === "complaints" });
  const rq = useQuery({ queryKey: ["quality", "reviews", f, page], queryFn: () => api.quality.reviews({ ...f, page }), enabled: tab === "reviews" });
  const set = (key: string) => (v: string) => url.replace({ [key]: v === ALL ? null : v, page: null });
  const clear = () => url.replace({ center: null, category: null, stage: null, stars: null, state: null, q: null, page: null });

  const done = (r: { toast: string }, title: string) => {
    qc.invalidateQueries({ queryKey: ["quality"] });
    toast(title, r.toast);
  };
  const remind = useMutation({ mutationFn: (id: string) => api.quality.remindCenter(id), onSuccess: (r) => done(r, "تذكير") });
  const keep = useMutation({ mutationFn: (id: string) => api.quality.keep(id), onSuccess: (r) => done(r, "أُبقي التقييم") });

  const cCols = useMemo<Column<ComplaintRow>[]>(
    () => [
      { id: "id", header: "الشكوى", width: 80, cell: (r) => <Two top={r.id} /> },
      { id: "customer", header: "العميل والحجز", width: 150, cell: (r) => <Two top={r.customer} sub={r.booking} /> },
      { id: "center", header: "المركز والفرع", width: 148, cell: (r) => <Two top={r.center} sub={r.branch} /> },
      { id: "category", header: "التصنيف", width: 110, cell: (r) => <Two top={r.category} light /> },
      { id: "opened", header: "فُتحت", width: 110, cell: (r) => <Two top={r.openedAt} light /> },
      { id: "status", header: "الحالة", width: 170, cell: (r) => <Status s={r.status} /> },
      {
        id: "actions",
        header: " ",
        width: 236,
        actions: true,
        cell: (r) => (
          <>
            <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => url.push({ complaint: r.id })} />
            {r.stage === "center" ? (
              <Button size="S" variant="secondary" loading={remind.isPending && remind.variables === r.id} onClick={() => remind.mutate(r.id)}>
                تذكير المركز
              </Button>
            ) : null}
            {r.stage === "linkar" ? (
              <Button size="S" variant="secondary" onClick={() => url.push({ complaint: r.id, modal: "rv-center" })}>
                مراسلة المركز
              </Button>
            ) : null}
            {r.stage === "linkar" || r.stage === "customer" ? (
              <Button size="S" onClick={() => url.push({ complaint: r.id, modal: "rv-close" })}>
                إغلاق بنتيجة
              </Button>
            ) : null}
          </>
        ),
      },
    ],
    [url, remind],
  );

  const rCols = useMemo<Column<ReviewRow>[]>(
    () => [
      { id: "text", header: "التقييم", width: 294, cell: (r) => <Two top={`${"★".repeat(r.stars)} ${r.text}`} sub={r.textSub} /> },
      { id: "customer", header: "العميل والحجز", width: 130, cell: (r) => <Two top={r.customer} sub={r.booking} /> },
      { id: "center", header: "المركز", width: 130, cell: (r) => <Two top={r.center} light /> },
      { id: "date", header: "التاريخ", width: 130, cell: (r) => <Two top={r.date} light /> },
      { id: "status", header: "الحالة", width: 160, cell: (r) => <Status s={r.status} /> },
      {
        id: "actions",
        header: " ",
        width: 170,
        actions: true,
        cell: (r) => (
          <>
            <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => url.push({ review: r.id })} />
            {r.state === "flagged" ? (
              <>
                <Button size="S" variant="secondary" className="text-danger-strong!" onClick={() => url.push({ review: r.id, modal: "rv-hide" })}>
                  إخفاء
                </Button>
                <Button size="S" variant="secondary" loading={keep.isPending && keep.variables === r.id} onClick={() => keep.mutate(r.id)}>
                  إبقاء
                </Button>
              </>
            ) : null}
          </>
        ),
      },
    ],
    [url, keep],
  );

  const d = k.data;
  const list = tab === "complaints" ? cq.data : rq.data;
  return (
    <>
      <PageHead
        title="التقييمات والشكاوى"
        description="شكاوى العملاء على مقدّمي الخدمة وبلاغات التقييمات."
        actions={
          <Button variant="secondary" className="h-[50px]!" icon={<Icon name="download" size={16} />} onClick={() => setExportOpen(true)}>
            تصدير
          </Button>
        }
      />
      <KpiRow className="[&>section]:border [&>section]:border-border [&>section>div:first-child]:justify-between">
        <KpiCard label="شكاوى مفتوحة" icon="message" value={d?.open} loading={k.isLoading} hint={d?.openHint} hintClassName="num text-13 font-light text-pending" />
        <KpiCard label="متوسط زمن الحل" icon="clock" value={d?.resolve} loading={k.isLoading} hint="الشكاوى المغلقة في 2026" hintClassName="text-13 font-light text-muted" />
        <KpiCard label="شكاوى لكل 100 حجز" icon="alert" value={d?.per100} loading={k.isLoading} hint={d?.per100Hint} hintClassName="num text-13 font-light text-muted" />
        <KpiCard label="بلاغات التقييمات" icon="star" value={d?.flagged} loading={k.isLoading} hint={d?.flaggedHint} hintClassName="text-13 font-light text-pending" />
      </KpiRow>
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs
          label="التقييمات والشكاوى"
          value={tab}
          onChange={(t) => url.replace({ tab: t === "complaints" ? null : t, center: null, category: null, stage: null, stars: null, state: null, q: null, page: null })}
          items={[
            { key: "complaints" as Tab, label: "الشكاوى", count: d?.counts.complaints },
            { key: "reviews" as Tab, label: "التقييمات", count: d?.counts.reviews },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={f.search}
            onChange={(v) => url.replace({ q: v || null, page: null })}
            placeholder={tab === "complaints" ? "ابحث برقم الشكوى أو الحجز أو المركز" : "ابحث في نص التقييم أو اسم المركز"}
            className="w-full sm:w-[280px]"
          />
          {tab === "complaints" ? (
            <>
              <Select variant="filter" label="الحالة" value={f.stage || ALL} onChange={set("stage")} options={opts(COMPLAINT_STAGES)} />
              <Select variant="filter" label="التصنيف" value={f.category || ALL} onChange={set("category")} options={opts(COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c })))} />
            </>
          ) : (
            <>
              <Select variant="filter" label="الحالة" value={f.state || ALL} onChange={set("state")} options={STATE_OPTS} />
              <Select variant="filter" label="النجوم" value={f.stars || ALL} onChange={set("stars")} options={STARS_OPTS} />
            </>
          )}
          <Select variant="filter" label="المركز" value={f.center || ALL} onChange={set("center")} options={CENTER_OPTS} />
        </div>
        {tab === "complaints" ? (
          <DataTable
            columns={cCols}
            data={cq.data?.items}
            getRowId={(r) => r.id}
            loading={cq.isLoading}
            error={cq.isError}
            onRetry={() => cq.refetch()}
            filtered={filtered}
            onClearFilters={clear}
            empty={{ title: "لا توجد شكاوى" }}
            onRowClick={(r) => url.push({ complaint: r.id })}
            rowLabel={(r) => `${r.id} · ${r.status.label}`}
            skeletonRows={7}
            rowClassName="border-border border-b-0! border-t"
          />
        ) : (
          <DataTable
            columns={rCols}
            data={rq.data?.items}
            getRowId={(r) => r.id}
            loading={rq.isLoading}
            error={rq.isError}
            onRetry={() => rq.refetch()}
            filtered={filtered}
            onClearFilters={clear}
            empty={{ title: "لا توجد تقييمات" }}
            onRowClick={(r) => url.push({ review: r.id })}
            rowLabel={(r) => `${r.id} · ${r.status.label}`}
            skeletonRows={6}
            rowClassName="border-border border-b-0! border-t"
          />
        )}
        {list && list.total ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="num text-13 leading-[22px] font-light text-muted">
              عرض {num(list.from)} – {num(list.to)} من {num(list.total)} هذا الشهر
            </p>
            <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
              {pageWindow(list.page, list.pages).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => url.replace({ page: p === 1 ? null : String(p) })}
                  aria-current={p === list.page ? "page" : undefined}
                  className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${p === list.page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
                >
                  {p}
                </button>
              ))}
            </nav>
          </div>
        ) : null}
      </section>
      <ComplaintDrawer />
      <ReviewDrawer />
      <QualityModals />
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} module="reviews" tab={tab} />
    </>
  );
}

/** 3 أزرار صفحات حوالين الصفحة الحالية (Figma: 1 · 2 · 3) */
function pageWindow(page: number, pages: number) {
  const n = Math.min(3, pages);
  const start = Math.max(1, Math.min(page - 1, pages - n + 1));
  return Array.from({ length: n }, (_, i) => start + i);
}
