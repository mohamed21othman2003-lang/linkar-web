"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { VISIT_TABS, type VisitRow, type VisitTab } from "@/lib/api/field-evaluation";
import { useUrlState } from "@/lib/use-url-state";
import { TextLink, VisitPill } from "./bits";
import { VisitDrawer } from "./VisitDrawer";
import { VisitModals } from "./VisitModals";

// CON5-17 · التقييم الميداني (3114:62127) وتبويباته: بانتظار القرار (3114:63748) · المكتملة (3114:63795)
// الرابط: /field-evaluation?tab=pending|done&visit=<id>&modal=fe-schedule|fe-reschedule|fe-cancel (القسم 2.3)
const EMPTY: Record<VisitTab, string> = {
  scheduled: "لا توجد زيارات مجدولة",
  pending: "لا توجد زيارات بانتظار القرار",
  done: "لا توجد زيارات مكتملة",
};

export function VisitsView() {
  const url = useUrlState();
  const raw = url.get("tab");
  const tab: VisitTab = raw === "pending" || raw === "done" ? raw : "scheduled";
  const q = useQuery({ queryKey: ["field-visits", "list", tab], queryFn: () => api.fieldVisits.list({ tab }) });
  const k = useQuery({ queryKey: ["field-visits", "kpis"], queryFn: () => api.fieldVisits.kpis() });
  const counts = q.data?.counts;

  const columns = useMemo<Column<VisitRow>[]>(() => {
    const open = (id: string) => url.push({ visit: id });
    return [
      {
        id: "branch",
        header: "الفرع · السبب",
        width: 262,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{r.branch}</span>
            <span className="text-12 leading-[18px] font-light text-muted">{r.reason}</span>
          </div>
        ),
      },
      { id: "templates", header: "القوالب", width: 260, cell: (r) => <span className="text-13 leading-5 font-normal text-ink">{r.templates}</span> },
      { id: "at", header: "الموعد", width: 190, cell: (r) => <span className="text-13 leading-5 font-normal text-ink">{r.at}</span> },
      { id: "assessor", header: "المقيّم", width: 110, cell: (r) => <span className="text-13 leading-5 font-normal text-ink">{r.assessor}</span> },
      { id: "status", header: "الحالة", width: 150, cell: (r) => <VisitPill tone={r.pill.tone}>{r.pill.label}</VisitPill> },
      {
        id: "actions",
        header: " ",
        width: 100,
        actions: true,
        cell: (r) => <TextLink onClick={() => open(r.id)}>{r.tab === "scheduled" ? "فتح النموذج" : "النتيجة"}</TextLink>,
      },
    ];
  }, [url]);

  return (
    <>
      <div className="flex min-h-[100px] flex-col justify-end">
        <PageHead
          title="التقييم الميداني والتصنيف"
          description="زيارات الفروع الجديدة والخدمات الجديدة والتقييمات الدورية والمفاجئة."
          actions={
            <>
              <Button variant="accent" className="h-11! rounded-12" icon={<Icon name="calendar" size={16} />} onClick={() => url.push({ modal: "fe-schedule" })}>
                جدولة زيارة
              </Button>
              <ButtonLink href="/field-evaluation/centers" variant="secondary" className="h-[46px]!" icon={<Icon name="calendar" size={16} />}>
                تصنيف المراكز والاعتماد
              </ButtonLink>
            </>
          }
        />
      </div>
      <KpiRow>
        <KpiCard label="الزيارات القادمة" icon="calendar" value={k.data?.upcoming} loading={k.isLoading} hint={k.data?.upcomingHint} hintClassName="num text-13 font-light text-muted" />
        <KpiCard label="بانتظار القرار" icon="clock" value={k.data?.pending} loading={k.isLoading} hint={k.data?.pendingHint} hintClassName="text-13 font-light text-warning" />
        <KpiCard label="نسبة القبول · 2026" icon="check" value={k.data?.acceptRate} loading={k.isLoading} hint={k.data?.visitsYear} hintClassName="text-13 font-light text-muted" />
        <KpiCard label="متوسط النتيجة" icon="star" value={k.data?.avgScore} loading={k.isLoading} hint={k.data?.avgTier} hintClassName="text-13 font-light text-muted" />
      </KpiRow>
      <section className="flex flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs
          variant="pill"
          label="حالة الزيارة"
          value={tab}
          onChange={(t) => url.replace({ tab: t === "scheduled" ? null : t })}
          items={VISIT_TABS.map((t) => ({ ...t, count: counts?.[t.key] }))}
        />
        <DataTable
          columns={columns}
          data={q.data?.items}
          getRowId={(r) => r.id}
          loading={q.isLoading}
          error={q.isError}
          onRetry={() => q.refetch()}
          empty={{ title: EMPTY[tab] }}
          onRowClick={(r) => url.push({ visit: r.id })}
          rowLabel={(r) => `${r.branch} · ${r.pill.label}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
          skeletonRows={3}
        />
        <p className="text-12 leading-5 font-light text-muted">يفتح المقيّم النموذج في الموقع من الجهاز اللوحي؛ القوالب تُختار تلقائياً حسب خدمات الفرع ونوع المنشأة</p>
      </section>
      <VisitDrawer />
      <VisitModals />
    </>
  );
}
