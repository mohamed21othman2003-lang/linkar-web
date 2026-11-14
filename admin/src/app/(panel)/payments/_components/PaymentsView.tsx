"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Cell, ExportBtn, Head2, Pill, RoundBtn, StartCell } from "@/components/finance/bits";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { api } from "@/lib/api";
import type { PaymentRow, PayTab } from "@/lib/api/payments";
import { sar } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { PaymentDrawer } from "./PaymentDrawer";

// CON5-15 · المدفوعات والاستردادات (3114:47245) + تبويب «الاستردادات» (3114:47603)
// الرابط: /payments?tab=refunds · درج العملية ?payment=PAY-… أو ?refund=RF-… (CON5-15D) · ?modal=export (CON5-M00 تصدير)
// رابط «استرداد قيد التنفيذ» في الرئيسية = /payments?refund=RF-2026-0190 → يفتح تبويب الاستردادات تحت الدرج.
const TABS: { key: PayTab; label: string }[] = [
  { key: "payments", label: "مدفوعات العملاء" },
  { key: "refunds", label: "الاستردادات" },
];
const HINT = "text-13 leading-[22px] font-light";

export function PaymentsView() {
  const url = useUrlState();
  const raw = url.get("tab");
  const tab: PayTab = raw === "refunds" || raw === "payments" ? raw : url.get("refund") ? "refunds" : "payments";
  const kpis = useQuery({ queryKey: ["payments", "kpis"], queryFn: () => api.payments.kpis() });
  const list = useQuery({ queryKey: ["payments", "list", tab], queryFn: () => api.payments.list({ tab }) });
  const k = kpis.data;

  const columns = useMemo<Column<PaymentRow>[]>(() => {
    const open = (r: PaymentRow) => url.push(r.kind === "refund" ? { refund: r.id, payment: null } : { payment: r.id, refund: null });
    return [
      { id: "id", header: "رقم العملية", width: 170, cell: (r) => <Cell>{r.id}</Cell> },
      { id: "ref", header: "المرجع", width: 298, cell: (r) => <Cell>{`${r.booking} · ${r.customer}`}</Cell> },
      { id: "amount", header: <Head2 a="المبلغ" b="شامل الضريبة" />, width: 110, cell: (r) => <Cell className="num">{sar(r.amount)}</Cell> },
      { id: "method", header: "الوسيلة", width: 130, cell: (r) => <Cell>{r.method}</Cell> },
      { id: "date", header: "التاريخ", width: 150, cell: (r) => <Cell>{r.date}</Cell> },
      { id: "status", header: "الحالة", width: 170, cell: (r) => <Pill tone={r.tone}>{r.status}</Pill> },
      { id: "actions", header: " ", width: 44, actions: true, cell: (r) => <StartCell width={44}><RoundBtn label={`تفاصيل ${r.id}`} onClick={() => open(r)} /></StartCell> },
    ];
  }, [url]);

  return (
    <>
      <div className="flex min-h-[100px] flex-col justify-end">
        <PageHead title="المدفوعات والاستردادات" description="كل ما يدفعه العملاء لِلينكار والاستردادات." actions={<ExportBtn onClick={() => url.push({ modal: "export" })} />} />
      </div>
      <KpiRow>
        <KpiCard label="مدفوعات العملاء · أكتوبر" icon="card" value={k?.payments.value} hint={k?.payments.hint} hintClassName={`${HINT} text-muted`} loading={kpis.isLoading} />
        <KpiCard label="الاستردادات · أكتوبر" icon="x" value={k?.refunds.value} hint={k?.refunds.hint} hintClassName={`${HINT} text-danger`} loading={kpis.isLoading} />
        <KpiCard label="مستحقات المزوّدين · أكتوبر" icon="calendar" value={k?.dues.value} hint={k?.dues.hint} hintClassName={`${HINT} text-warning`} loading={kpis.isLoading} />
        <KpiCard label="هامش لينكار المتوقع · أكتوبر" icon="chart" value={k?.margin.value} hint={k?.margin.hint} hintClassName={`${HINT} text-success`} loading={kpis.isLoading} />
      </KpiRow>
      <section className="flex flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs variant="pill" label="المدفوعات والاستردادات" value={tab} onChange={(t) => url.replace({ tab: t === "payments" ? null : t })} items={TABS.map((t) => ({ ...t, count: list.data?.counts[t.key] }))} />
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(r) => r.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          empty={{ title: tab === "refunds" ? "لا توجد استردادات" : "لا توجد مدفوعات" }}
          onRowClick={(r) => url.push(r.kind === "refund" ? { refund: r.id } : { payment: r.id })}
          rowLabel={(r) => `تفاصيل ${r.id}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
          skeletonRows={5}
        />
        {tab === "refunds" ? <p className="text-12 leading-5 font-light text-muted">ينفّذ الاسترداد لينكار أو المالية فقط، ويعود للوسيلة الأصلية خلال 5 أيام عمل</p> : null}
      </section>
      <PaymentDrawer />
      <ExportModal open={url.get("modal") === "export"} onOpenChange={(o) => !o && url.replace({ modal: null })} module="payments" tab={tab} />
    </>
  );
}
