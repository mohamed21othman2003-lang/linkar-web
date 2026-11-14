"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import {
  CENTER_ACTION_LABEL,
  CENTER_CITIES,
  CENTER_FOOT,
  CENTER_SERVICES,
  CENTER_TABS,
  CRITERIA_COUNT,
  TIERS,
  type CenterRow,
  type CenterTab,
  type Tier,
} from "@/lib/api/field-evaluation";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { InfoBtn, SPill, TierBadge } from "./bits";
import { CenterDrawer } from "./CenterDrawer";
import { CenterModals } from "./CenterModals";
import { VisitModals } from "./VisitModals";

// CON5-17C · تصنيف المراكز والاعتماد (3114:62451) وتبويباته: تحت التجربة (3114:63408) · ينتظر القرار (3114:63493)
// · مسودات (3114:63578) · غير مقبول (3114:63663). الرابط: /field-evaluation/centers?tab=&city=&service=&tier=&q=&page=&center=<id>&modal=fe-…
const TAB_KEYS = CENTER_TABS.map((t) => t.key) as string[];
const ALL = "__all";
const opts = (l: string[]) => [{ value: ALL, label: "الكل" }, ...l.map((v) => ({ value: v, label: v }))];
const TIER_OPTS = [{ value: ALL, label: "الكل" }, ...(Object.keys(TIERS) as Tier[]).map((t) => ({ value: t, label: TIERS[t].label }))];
const EMPTY: Record<CenterTab, string> = {
  all: "لا توجد مراكز مقيّمة",
  trial: "لا توجد مراكز تحت التجربة",
  pending: "لا توجد مراكز تنتظر القرار",
  drafts: "لا توجد مسودات",
  rejected: "لا توجد مراكز غير مقبولة",
};

/** عمود بسطرين: 13 Medium + 12 Medium رمادي */
function Two({ top, sub, tone }: { top: React.ReactNode; sub?: string; tone?: "danger" | "muted" }) {
  return (
    <div className="flex flex-col">
      <span className={`text-13 leading-[22px] font-medium ${tone === "danger" ? "text-danger" : tone === "muted" ? "text-muted" : "text-ink"}`}>{top}</span>
      {sub ? <span className="text-12 leading-5 font-medium text-muted">{sub}</span> : null}
    </div>
  );
}
function PillCell({ p }: { p: CenterRow["status"] }) {
  if (!p) return <span className="text-13 leading-[22px] font-medium text-muted">—</span>;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <SPill tone={p.tone}>{p.label}</SPill>
      {p.sub ? <span className="text-12 leading-5 font-medium text-muted">{p.sub}</span> : null}
    </div>
  );
}

export function CentersView() {
  const url = useUrlState();
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const tab = (TAB_KEYS.includes(url.get("tab") ?? "") ? url.get("tab") : "all") as CenterTab;
  const city = url.get("city") ?? "";
  const service = url.get("service") ?? "";
  const tier = url.get("tier") ?? "";
  const search = url.get("q") ?? "";
  const page = Number(url.get("page") ?? 1) || 1;
  const filtered = !!(city || service || tier || search);
  const q = useQuery({ queryKey: ["centers", "list", { tab, city, service, tier, search, page }], queryFn: () => api.centers.list({ tab, city, service, tier, search, page }) });
  const s = useQuery({ queryKey: ["centers", "summary"], queryFn: () => api.centers.summary() });
  const counts = q.data?.counts;
  const set = (k: string) => (v: string) => url.replace({ [k]: v === ALL ? null : v, page: null });

  const columns = useMemo<Column<CenterRow>[]>(() => {
    const act = (r: CenterRow) => {
      if (r.action === "decision") {
        // مركز له تقييم عملي (درع) → صفحة CON5-17P · غيره → نافذة القرار
        if (r.id === "lk-dr-001") router.push(`/field-evaluation/centers/${r.id}`);
        else url.push({ center: r.id, modal: "fe-decision" });
      } else if (r.action === "direct") url.push({ center: r.id, modal: "fe-direct" });
      else if (r.action === "periodic") url.push({ center: r.id, modal: "fe-periodic" });
      else url.push({ center: r.id });
    };
    return [
      { id: "name", header: "المركز", width: 154, cell: (r) => <Two top={r.name} sub={r.cityLine} /> },
      { id: "services", header: "الخدمات", width: 150, cell: (r) => <Two top={r.services} /> },
      { id: "score", header: "التقييم", width: 80, cell: (r) => <Two top={r.score ?? "—"} tone={r.score == null ? "muted" : r.scoreBad ? "danger" : undefined} /> },
      {
        id: "tier",
        header: "التصنيف",
        width: 90,
        cell: (r) =>
          r.tier ? (
            <span className="flex items-center gap-1.5">
              <TierBadge tier={r.tier} />
              <span className="text-13 leading-[22px] font-medium text-ink">{TIERS[r.tier].label}</span>
            </span>
          ) : (
            <Two top="—" tone="muted" />
          ),
      },
      { id: "status", header: "الحالة", width: 120, cell: (r) => <PillCell p={r.status} /> },
      { id: "acc", header: "الاعتماد", width: 150, cell: (r) => <PillCell p={r.accreditation} /> },
      { id: "date", header: "تاريخ التقييم", width: 110, cell: (r) => <Two top={r.date} sub={r.dateSub} /> },
      {
        id: "actions",
        header: " ",
        width: 150,
        actions: true,
        cell: (r) => (
          <>
            <InfoBtn label={`تفاصيل ${r.name}`} onClick={() => url.push({ center: r.id })} />
            {r.action ? (
              <Button size="S" variant={r.action === "direct" || r.action === "periodic" ? "secondary" : "primary"} onClick={() => act(r)}>
                {CENTER_ACTION_LABEL[r.action].row}
              </Button>
            ) : null}
          </>
        ),
      },
    ];
  }, [url, router]);

  const d = s.data;
  return (
    <>
      <PageHead
        title="تصنيف المراكز والاعتماد"
        description="التقييم الفني الميداني للمراكز وتصنيفها، وفترة التجربة، وقرار شارة «معتمد LINKAR»."
        actions={
          <>
            <Button variant="secondary" className="h-[50px]!" icon={<Icon name="download" size={16} />} onClick={() => setExportOpen(true)}>
              تصدير Excel
            </Button>
            <ButtonLink href="/field-evaluation" variant="secondary" className="h-[50px]!" icon={<Icon name="navigation" size={16} />}>
              الزيارات الميدانية ({d ? num(d.upcomingVisits) : "…"})
            </ButtonLink>
            <Button icon={<Icon name="plus" size={16} />} onClick={() => url.push({ modal: "fe-schedule" })}>
              جدولة زيارة
            </Button>
          </>
        }
      />
      <KpiRow className="[&>section]:border [&>section]:border-border [&>section>div:first-child]:justify-between lg:grid-cols-none max-lg:[&>section:last-child]:col-span-2">
        <KpiCard label="المراكز المقيّمة" icon="check" value={d?.evaluated} loading={s.isLoading} hint={d ? `متوسط نسبة التحقق ${d.verifyAvg}` : undefined} hintClassName="text-13 font-light text-muted" />
        <KpiCard label="مقبول" icon="star" value={d?.accepted} loading={s.isLoading} hint="70 فأعلى" hintClassName="text-13 font-light text-muted" />
        <KpiCard label="تحت التجربة" icon="clock" value={d?.trial} loading={s.isLoading} hint={d ? `+${d.pending} ينتظر القرار` : undefined} hintClassName="text-13 font-light text-pending" />
        <KpiCard label="معتمد LINKAR" icon="star-filled" value={d?.accredited} loading={s.isLoading} hint="بعد 3 شهور تقييم عملي" hintClassName="text-13 font-light text-muted" />
        <KpiCard label="غير مقبول" icon="alert" value={d?.rejected} loading={s.isLoading} hint="أقل من 70" hintClassName="text-13 font-light text-muted" />
      </KpiRow>
      <section className="flex flex-col gap-3 rounded-16 border border-border bg-white p-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-col gap-0.5 lg:w-[360px] lg:shrink-0">
          <h2 className="text-18 font-bold text-ink">تصنيف المراكز</h2>
          <p className="text-13 font-light text-muted">يُعطى لكل مركز مقبول حسب التقييم الميداني، وشارة معتمد LINKAR منفصلة وتُكتسب بعد 3 شهور.</p>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {(["platinum", "gold", "silver"] as Tier[]).map((t) => (
            <div key={t} className="flex items-center gap-2.5 rounded-12 bg-surface-1 p-3">
              <TierBadge tier={t} big />
              <div className="flex flex-1 flex-col">
                <span className="text-13 leading-[22px] font-medium text-ink">{TIERS[t].label}</span>
                <span className="num text-12 leading-5 font-medium text-muted">{TIERS[t].range}</span>
              </div>
              <span className="num text-24 font-bold text-ink">{d ? d.tiers[t] : "…"}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs
          label="حالة التقييم"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "all" ? null : k, page: null })}
          items={[
            ...CENTER_TABS.map((t) => ({ ...t, count: counts?.[t.key] })),
            { key: "criteria" as CenterTab, label: "المعايير ↗", count: CRITERIA_COUNT, href: "/reference/accreditation" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput value={search} onChange={(v) => url.replace({ q: v || null, page: null })} placeholder="ابحث باسم المركز أو المدينة أو السجل…" className="w-full sm:w-[280px]" />
          <Select variant="filter" label="التصنيف" value={tier || ALL} onChange={set("tier")} options={TIER_OPTS} />
          <Select variant="filter" label="الخدمة" value={service || ALL} onChange={set("service")} options={opts(CENTER_SERVICES)} />
          <Select variant="filter" label="المدينة" value={city || ALL} onChange={set("city")} options={opts(CENTER_CITIES)} />
        </div>
        <DataTable
          columns={columns}
          data={q.data?.items}
          getRowId={(r) => r.id}
          loading={q.isLoading}
          error={q.isError}
          onRetry={() => q.refetch()}
          filtered={filtered}
          onClearFilters={() => url.replace({ city: null, service: null, tier: null, q: null, page: null })}
          empty={{ title: EMPTY[tab] }}
          onRowClick={(r) => url.push({ center: r.id })}
          rowLabel={(r) => r.name}
          skeletonRows={9}
          rowClassName="border-border border-b-0! border-t"
        />
        {q.data && q.data.total ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="num text-13 leading-[22px] font-light text-muted">
              {tab === "all" ? `عرض ${num(q.data.from)} – ${num(q.data.to)} من ${num(q.data.total)} · الأحدث نشاطاً أولاً` : CENTER_FOOT[tab]}
            </p>
            <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
              {Array.from({ length: q.data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => url.replace({ page: p === 1 ? null : String(p) })}
                  aria-current={p === q.data.page ? "page" : undefined}
                  className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${p === q.data.page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
                >
                  {p}
                </button>
              ))}
            </nav>
          </div>
        ) : null}
      </section>
      <CenterDrawer />
      <CenterModals />
      <VisitModals />
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} module="centers" tab={tab} />
    </>
  );
}
