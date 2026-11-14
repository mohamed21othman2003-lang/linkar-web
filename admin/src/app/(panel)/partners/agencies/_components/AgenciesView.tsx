"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  ARR_LABEL,
  ARR_OPTIONS,
  CITY_OPTIONS,
  FIN_OPTIONS,
  PO_STATUS_OPTIONS,
  ST_LABEL,
  ST_MONTH_OPTIONS,
  ST_STATUS_OPTIONS,
  type Agency,
  type PurchaseOrder,
  type RowAct,
  type Statement,
} from "@/lib/api/agencies";
import { arDate, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { AgencyDrawer } from "./AgencyDrawer";
import { AgencyModals } from "./AgencyModals";
import { PoDrawer } from "./PoDrawer";
import { StatementDrawer } from "./StatementDrawer";
import { DecisionModals } from "./DecisionModals";
import { DqDrawer, JoinDrawer } from "./RequestDrawers";
import { VoucherDrawer } from "./VoucherDrawer";
import { APill, InfoBtn, KpiB, Pager, RowBtn, Two, WaitPill } from "./bits";

// CON5-09 · الوكالات (3114:2150) وتبويباته: الطلبات والقسائم (3114:3808) · الكشوف الشهرية (3114:3854)
// الرابط: /partners/agencies?tab=orders|statements&q=…&page=… · الأدراج ?agency=DL-014 · ?po=PO-… · ?inv=INV-… · ?join=DR-… · ?dq=DQ-…
// النوافذ ?modal=ag-…&ref=<id> (القسم 2.3)
type Tab = "agencies" | "orders" | "statements";
const opts = (l: string[]) => l.map((x) => ({ value: x, label: x }));
const ACT_LABEL: Record<RowAct, string> = { limit: "تعديل الحد", pay: "تسجيل سداد", topup: "تسجيل شحن", confirm: "تأكيد الشحن", reactivate: "إعادة تفعيل" };
/** زر الإجراء → النافذة (تسجيل السداد على الكشف المتأخر) */
export const actModal = (a: Agency): { modal: string; ref: string } =>
  a.act === "pay" ? { modal: "ag-pay", ref: a.overdueInvoice ?? "" } : { modal: `ag-${a.act}`, ref: a.id };

export function AgenciesView() {
  const url = useUrlState();
  const t = url.get("tab");
  const tab: Tab = t === "orders" || t === "statements" ? t : "agencies";
  const [exportOpen, setExportOpen] = useState(false);
  const sum = useQuery({ queryKey: ["agencies", "summary"], queryFn: () => api.agencies.summary() });
  const k = sum.data?.kpis;

  return (
    <>
      <PageHead
        title="الوكالات"
        description="المعارض والوكالات التي تشتري باقات لينكار بأسعار الوكالات."
        actions={
          <>
            <Button variant="secondary" className="h-[50px]!" icon={<Icon name="download" size={18} />} onClick={() => setExportOpen(true)}>
              تصدير
            </Button>
            <Button icon={<Icon name="plus" size={18} />} onClick={() => url.push({ modal: "ag-add", step: null })}>
              إضافة وكالة
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiB label="الوكالات النشطة" icon="car" value={k?.active} hint={k?.activeSub} loading={sum.isLoading} />
        <KpiB label="قسائم أكتوبر" icon="qr" value={k?.vouchers} hint={k?.vouchersSub} loading={sum.isLoading} />
        <KpiB label="مستحقات كشوف سبتمبر" icon="receipt" value={k?.septDue} hint={k?.septSub} loading={sum.isLoading} />
        <KpiB label="متأخرات" icon="alert" value={k?.overdue} hint={k?.overdueSub} danger={!!k?.overdue} loading={sum.isLoading} />
      </div>
      {tab === "agencies" ? <PendingCard /> : null}
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs
          label="أقسام الوكالات"
          className="h-[50px]"
          value={tab}
          onChange={(key) => url.replace({ tab: key === "agencies" ? null : key, page: null, q: null, city: null, fin: null, arr: null, st: null, ag: null, mo: null })}
          items={[
            { key: "agencies", label: "الوكالات", count: sum.data?.tabs.agencies },
            { key: "orders", label: "الطلبات والقسائم", count: sum.data?.tabs.orders },
            { key: "statements", label: "الكشوف الشهرية", count: sum.data?.tabs.statements },
          ]}
        />
        {tab === "agencies" ? <AgenciesTab /> : tab === "orders" ? <OrdersTab /> : <StatementsTab />}
      </section>
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} module="الوكالات" tab={tab === "agencies" ? "الوكالات" : tab === "orders" ? "الطلبات والقسائم" : "الكشوف الشهرية"} />
      <AgencyDrawer />
      <PoDrawer />
      <StatementDrawer />
      <AgencyModals />
      <JoinDrawer />
      <DqDrawer />
      <DecisionModals />
      <VoucherDrawer />
    </>
  );
}

// ───────────── بطاقة «بانتظار قرار لينكار» ─────────────
function PendingCard() {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["agencies", "pending"], queryFn: () => api.agencyExtra.pending() });
  if (q.data && !q.data.total) return null;
  return (
    <section className="flex flex-col gap-2.5 rounded-16 bg-white px-[18px] py-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-16 leading-[26px] font-bold text-ink">بانتظار قرار لينكار · {q.data?.total ?? "…"}</h2>
        <p className="text-12 leading-[18px] font-light text-muted">طلبات الانضمام وطلبات الوكالات</p>
      </div>
      {q.isLoading
        ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[68px] w-full rounded-12" />)
        : q.isError ? (
            <div className="flex items-center justify-between gap-3 rounded-12 border border-border p-3 text-13 text-muted">
              تعذّر تحميل الطلبات
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : (
            q.data?.items.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-12 border border-border px-3 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-14 leading-[22px] font-semibold text-ink">{r.title}</p>
                  <p className="text-12 leading-[18px] font-light text-muted">{r.sub}</p>
                </div>
                <WaitPill>{r.pill}</WaitPill>
                <Button variant="secondary" className="h-[46px]! px-4" onClick={() => url.push(r.kind === "join" ? { join: r.id } : { dq: r.id })}>
                  مراجعة
                </Button>
              </div>
            ))
          )}
    </section>
  );
}

// ───────────── تبويب الوكالات ─────────────
function AgenciesTab() {
  const url = useUrlState();
  const page = Number(url.get("page") ?? 1) || 1;
  const search = url.get("q") ?? "";
  const city = url.get("city") ?? "الكل";
  const fin = url.get("fin") ?? "الكل";
  const arr = url.get("arr") ?? "الكل";
  const filtered = !!search || city !== "الكل" || fin !== "الكل" || arr !== "الكل";
  const q = useQuery({ queryKey: ["agencies", "list", { page, search, city, fin, arr }], queryFn: () => api.agencies.list({ page, search, city, fin, arr }) });
  const set = (p: Record<string, string | null>) => url.replace({ ...p, page: null });

  const columns = useMemo<Column<Agency>[]>(
    () => [
      { id: "name", header: "الوكالة", width: 254, cell: (a) => <Two a={a.name} b={`‏${a.id} · ${a.contact.name}`} /> },
      { id: "city", header: "المدينة والفروع", width: 120, cell: (a) => <Two a={a.city} b={a.branches} /> },
      { id: "arr", header: "الترتيب", width: 100, cell: (a) => ARR_LABEL[a.arrangement] },
      { id: "money", header: "الحد أو الرصيد", width: 140, cell: (a) => <Two a={`${num(a.money)} ر.س`} b={a.moneySub} /> },
      { id: "vouchers", header: "قسائم أكتوبر", width: 90, cell: (a) => <span className="num">{a.vouchersOct}</span> },
      {
        id: "status",
        header: "الوضع المالي",
        width: 160,
        cell: (a) => (
          <div className="flex flex-col items-start gap-0.5">
            <APill tone={a.status.tone}>{a.status.label}</APill>
            <span className="text-12 leading-5 font-medium text-muted">{a.status.sub}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: " ",
        width: 150,
        actions: true,
        cell: (a) => (
          <>
            <InfoBtn label={`تفاصيل ${a.name}`} onClick={() => url.push({ agency: a.id })} />
            <RowBtn primary={a.actPrimary} onClick={() => url.push(actModal(a))}>
              {ACT_LABEL[a.act]}
            </RowBtn>
          </>
        ),
      },
    ],
    [url],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={(v) => set({ q: v || null })} placeholder="ابحث باسم الوكالة أو رقمها" />
        <Select variant="filter" label="الترتيب" value={arr} onChange={(v) => set({ arr: v === "الكل" ? null : v })} options={opts(ARR_OPTIONS)} />
        <Select variant="filter" label="الوضع المالي" value={fin} onChange={(v) => set({ fin: v === "الكل" ? null : v })} options={opts(FIN_OPTIONS)} />
        <Select variant="filter" label="المدينة" value={city} onChange={(v) => set({ city: v === "الكل" ? null : v })} options={opts(CITY_OPTIONS)} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(a) => a.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => set({ q: null, city: null, fin: null, arr: null })}
        empty={{ title: "لا توجد وكالات بعد" }}
        onRowClick={(a) => url.push({ agency: a.id })}
        rowLabel={(a) => `${a.name} · ${a.id}`}
      />
      {q.data && q.data.total ? (
        <Pager
          page={q.data.page}
          pages={q.data.pages}
          onPage={(p) => url.replace({ page: p === 1 ? null : String(p) })}
          text={`عرض ${(q.data.page - 1) * 6 + 1} – ${Math.min(q.data.page * 6, q.data.total)} من ${q.data.total} · ${q.data.credit} بالائتمان · ${q.data.prepaid} بالرصيد المسبق`}
        />
      ) : null}
    </>
  );
}

// ───────────── تبويب الطلبات والقسائم (3114:3808) ─────────────
function OrdersTab() {
  const url = useUrlState();
  const page = Number(url.get("page") ?? 1) || 1;
  const search = url.get("q") ?? "";
  const status = url.get("st") ?? "الكل";
  const agency = url.get("ag") ?? "الكل";
  const filtered = !!search || status !== "الكل" || agency !== "الكل";
  const q = useQuery({ queryKey: ["agencies", "orders", { page, search, status, agency }], queryFn: () => api.agencies.orders({ page, search, status, agency }) });
  const set = (p: Record<string, string | null>) => url.replace({ ...p, page: null });

  const columns = useMemo<Column<PurchaseOrder>[]>(
    () => [
      { id: "id", header: "الطلب", width: 120, cell: (o) => <Two a={<bdi>{o.id}</bdi>} b={arDate(o.date)} /> },
      { id: "agency", header: "الوكالة", width: 150, cell: (o) => o.agency },
      { id: "service", header: "الخدمة والمركز", width: 310, cell: (o) => <Two a={o.service} b={o.serviceSub} /> },
      { id: "vouchers", header: "القسائم", width: 110, cell: (o) => <Two a={o.vouchersLabel} b={<bdi>{o.usedLabel}</bdi>} /> },
      {
        id: "value",
        header: (
          <>
            القيمة (سعر الوكالات)
            <br />
            شامل الضريبة
          </>
        ),
        width: 140,
        cell: (o) => `${num(o.value)} ر.س`,
      },
      {
        id: "status",
        header: "الحالة",
        width: 150,
        cell: (o) => (
          <div className="flex flex-col items-start gap-0.5">
            <APill tone={o.status.tone}>{o.status.label}</APill>
            {o.status.sub ? <span className="text-12 leading-5 font-medium text-muted">{o.status.sub}</span> : null}
          </div>
        ),
      },
      { id: "actions", header: " ", width: 34, actions: true, cell: (o) => <InfoBtn label={`تفاصيل ${o.id}`} onClick={() => url.push({ po: o.id })} /> },
    ],
    [url],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={(v) => set({ q: v || null })} placeholder="ابحث برقم الطلب أو القسيمة" />
        <Select variant="filter" label="الوكالة" value={agency} onChange={(v) => set({ ag: v === "الكل" ? null : v })} options={opts(api.agencies.agencyNames())} />
        <Select variant="filter" label="الحالة" value={status} onChange={(v) => set({ st: v === "الكل" ? null : v })} options={opts(PO_STATUS_OPTIONS)} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(o) => o.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => set({ q: null, st: null, ag: null })}
        empty={{ title: "لا توجد طلبات شراء بعد" }}
        onRowClick={(o) => url.push({ po: o.id })}
        rowLabel={(o) => `${o.id} · ${o.agency}`}
      />
      {q.data && q.data.total ? <Pager page={q.data.page} pages={q.data.pages} onPage={(p) => url.replace({ page: p === 1 ? null : String(p) })} text="51 قسيمة صدرت هذا الشهر · 27 مستخدمة" /> : null}
    </>
  );
}

// ───────────── تبويب الكشوف الشهرية (3114:3854) ─────────────
function StatementsTab() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const page = Number(url.get("page") ?? 1) || 1;
  const search = url.get("q") ?? "";
  const status = url.get("st") ?? "الكل";
  const month = url.get("mo") ?? "الكل";
  const filtered = !!search || status !== "الكل" || month !== "الكل";
  const q = useQuery({ queryKey: ["agencies", "statements", { page, search, status, month }], queryFn: () => api.agencies.statements({ page, search, status, month }) });
  const set = (p: Record<string, string | null>) => url.replace({ ...p, page: null });
  const remind = useMutation({
    mutationFn: (id: string) => api.agencies.remind(id),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("تذكير", r.toast);
    },
  });

  const columns = useMemo<Column<Statement>[]>(
    () => [
      { id: "id", header: "الكشف", width: 140, cell: (s) => <span className="text-13 leading-[22px] font-medium">{s.id}</span> },
      { id: "agency", header: "الوكالة", width: 160, cell: (s) => s.agency },
      { id: "period", header: "الفترة", width: 110, cell: (s) => s.period },
      {
        id: "amount",
        header: (
          <>
            المبلغ
            <br />
            شامل الضريبة
          </>
        ),
        width: 120,
        cell: (s) => `${num(s.amount)} ر.س`,
      },
      {
        id: "due",
        header: "الاستحقاق",
        width: 150,
        cell: (s) => (
          <Two
            a={arDate(s.due)}
            b={s.state === "overdue" ? `متأخر ${s.overdueDays} يوماً` : s.state === "paid" && s.paid ? `سُدّد ${arDate(s.paid.on)}` : undefined}
            bClass={s.state === "overdue" ? "text-danger" : undefined}
          />
        ),
      },
      { id: "status", header: "الحالة", width: 140, cell: (s) => <APill tone={ST_LABEL[s.state].tone}>{ST_LABEL[s.state].label}</APill> },
      {
        id: "actions",
        header: " ",
        width: 194,
        actions: true,
        cell: (s) => (
          <>
            <InfoBtn label={`تفاصيل ${s.id}`} onClick={() => url.push({ inv: s.id })} />
            {s.state === "overdue" ? (
              <RowBtn onClick={() => remind.mutate(s.id)} loading={remind.isPending && remind.variables === s.id}>
                تذكير
              </RowBtn>
            ) : null}
            {s.state !== "paid" ? (
              <RowBtn primary={s.state === "overdue"} onClick={() => url.push({ modal: "ag-pay", ref: s.id })}>
                تسجيل سداد
              </RowBtn>
            ) : null}
          </>
        ),
      },
    ],
    [url, remind],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={(v) => set({ q: v || null })} placeholder="ابحث برقم الكشف" />
        <Select variant="filter" label="الشهر" value={month} onChange={(v) => set({ mo: v === "الكل" ? null : v })} options={opts(ST_MONTH_OPTIONS)} />
        <Select variant="filter" label="الحالة" value={status} onChange={(v) => set({ st: v === "الكل" ? null : v })} options={opts(ST_STATUS_OPTIONS)} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(s) => s.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => set({ q: null, st: null, mo: null })}
        empty={{ title: "لا توجد كشوف بعد" }}
        onRowClick={(s) => url.push({ inv: s.id })}
        rowLabel={(s) => `${s.id} · ${s.agency}`}
      />
    </>
  );
}
