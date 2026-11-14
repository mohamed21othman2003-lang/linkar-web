"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Cell, ExportBtn, Head2, Pill, RoundBtn, StartCell } from "@/components/finance/bits";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { api } from "@/lib/api";
import { INV_TABS, type DocRow, type InvTab, type VoucherRow } from "@/lib/api/invoices";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { DocViewer } from "./DocViewer";
import { VoucherDrawer } from "./VoucherDrawer";

// CON5-16 · الفواتير والقسائم (3114:47648) وتبويباته: فواتير المزوّدين (3260:261595) · الإشعارات الدائنة (3114:48085) · القسائم (3114:48129)
// الرابط: /invoices?tab=provider|credit|vouchers · ?invoice=<INV-L/CN-L/SB-…> = عرض المستند CON5-16V · ?voucher=<LK-…> = درج القسيمة CON5-16D
// · ?booking=BK-…[&type=credit] (من درج الحجز) → يفتح فاتورة/إشعار الحجز · ?modal=export
// ملاحظة: جدول القسائم في Figma فيه عمود بعرض 1 فيه «—» راكب على أول نص «الصلاحية» (أثر تصميم) — العمود متشال وعرضه اتضاف للصلاحية.
const TAB_KEYS = INV_TABS.map((t) => t.key) as string[];
const EMPTY: Record<InvTab, string> = { customer: "لا توجد فواتير", provider: "لا توجد فواتير مزوّدين", credit: "لا توجد إشعارات دائنة", vouchers: "لا توجد قسائم" };

export function InvoicesView() {
  const url = useUrlState();
  const tab = (TAB_KEYS.includes(url.get("tab") ?? "") ? url.get("tab") : "customer") as InvTab;
  const kpis = useQuery({ queryKey: ["invoices", "kpis"], queryFn: () => api.invoices.kpis() });
  const docs = useQuery({ queryKey: ["invoices", "list", tab], queryFn: () => api.invoices.list({ tab: tab as Exclude<InvTab, "vouchers"> }), enabled: tab !== "vouchers" });
  const vouchers = useQuery({ queryKey: ["invoices", "vouchers"], queryFn: () => api.invoices.vouchers(), enabled: tab === "vouchers" });
  const counts = (tab === "vouchers" ? vouchers.data : docs.data)?.counts;
  const k = kpis.data;

  // روابط درج الحجز: /invoices?booking=BK-21474 → فاتورته · &type=credit → إشعاره الدائن
  const booking = url.get("booking");
  const type = url.get("type");
  const { replace } = url;
  useEffect(() => {
    if (!booking) return;
    let live = true;
    api.invoices.docForBooking(booking, type ?? undefined).then((id) => live && replace({ booking: null, type: null, invoice: id, tab: type === "credit" ? "credit" : null }));
    return () => {
      live = false;
    };
  }, [booking, type, replace]);

  const docCols = useMemo<Column<DocRow>[]>(
    () => [
      { id: "id", header: "الرقم", width: 190, cell: (r) => <Cell>{r.id}</Cell> },
      { id: "ref", header: tab === "provider" ? "المزوّد · الفترة" : "الحجز", width: 348, cell: (r) => <Cell>{r.ref}</Cell> },
      { id: "total", header: <Head2 a={tab === "provider" ? "الإجمالي" : "المبلغ"} b="شامل الضريبة" />, width: 110, cell: (r) => <Cell className="num">{r.total}</Cell> },
      { id: "vat", header: "الضريبة 15%", width: 120, cell: (r) => <Cell className="num">{r.vat}</Cell> },
      { id: "date", header: "التاريخ", width: 150, cell: (r) => <Cell>{r.date}</Cell> },
      { id: "status", header: "الحالة", width: 110, cell: (r) => <Pill tone={r.tone}>{r.status}</Pill> },
      { id: "actions", header: " ", width: 44, actions: true, cell: (r) => <StartCell width={44}><RoundBtn label={`عرض ${r.id}`} onClick={() => url.push({ invoice: r.id })} /></StartCell> },
    ],
    [tab, url],
  );
  const voucherCols = useMemo<Column<VoucherRow>[]>(
    () => [
      { id: "code", header: "القسيمة", width: 150, cell: (r) => <Cell>{r.code}</Cell> },
      { id: "ref", header: "الحجز · الفرع", width: 357, cell: (r) => <Cell>{`${r.booking} · ${r.where}`}</Cell> },
      { id: "service", header: "الخدمة", width: 210, cell: (r) => <Cell>{r.service}</Cell> },
      { id: "validity", header: "الصلاحية", width: 201, cell: (r) => <Cell>{r.validity}</Cell> },
      { id: "status", header: "الحالة", width: 110, cell: (r) => <Pill tone={r.tone}>{r.status}</Pill> },
      { id: "actions", header: " ", width: 44, actions: true, cell: (r) => <StartCell width={44}><RoundBtn label={`تفاصيل ${r.code}`} onClick={() => url.push({ voucher: r.code })} /></StartCell> },
    ],
    [url],
  );
  const table = { gap: 0, edge: 12, headRadius: 10 as const, rowPadY: 12, rowClassName: "border-divider" };

  return (
    <>
      <div className="flex min-h-[100px] flex-col justify-end">
        <PageHead title="الفواتير والقسائم" description="فواتير العملاء والمزوّدين والإشعارات الدائنة وقسائم الحجوزات." actions={<ExportBtn onClick={() => url.push({ modal: "export" })} />} />
      </div>
      <KpiRow>
        <KpiCard label="فواتير أكتوبر" icon="receipt" value={k && num(k.invoices)} loading={kpis.isLoading} />
        <KpiCard label="إشعارات دائنة" icon="file" value={k && num(k.credits)} loading={kpis.isLoading} />
        <KpiCard label="قسائم صالحة" icon="qr" value={k && num(k.validVouchers)} loading={kpis.isLoading} />
        <KpiCard label="قسائم أُعيد إرسالها" icon="share" value={k && num(k.resent)} loading={kpis.isLoading} />
      </KpiRow>
      <section className="flex flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs variant="pill" label="الفواتير والقسائم" value={tab} onChange={(t) => url.replace({ tab: t === "customer" ? null : t })} items={INV_TABS.map((t) => ({ ...t, count: counts?.[t.key] }))} />
        {tab === "vouchers" ? (
          <DataTable
            columns={voucherCols}
            data={vouchers.data?.items}
            getRowId={(r) => r.code}
            loading={vouchers.isLoading}
            error={vouchers.isError}
            onRetry={() => vouchers.refetch()}
            empty={{ title: EMPTY.vouchers }}
            onRowClick={(r) => url.push({ voucher: r.code })}
            rowLabel={(r) => `تفاصيل ${r.code}`}
            skeletonRows={5}
            {...table}
          />
        ) : (
          <DataTable
            columns={docCols}
            data={docs.data?.items}
            getRowId={(r) => r.id}
            loading={docs.isLoading}
            error={docs.isError}
            onRetry={() => docs.refetch()}
            empty={{ title: EMPTY[tab] }}
            onRowClick={(r) => url.push({ invoice: r.id })}
            rowLabel={(r) => `عرض ${r.id}`}
            skeletonRows={3}
            {...table}
          />
        )}
      </section>
      <DocViewer />
      <VoucherDrawer />
      <ExportModal open={url.get("modal") === "export"} onOpenChange={(o) => !o && url.replace({ modal: null })} module="invoices" tab={tab} />
    </>
  );
}
