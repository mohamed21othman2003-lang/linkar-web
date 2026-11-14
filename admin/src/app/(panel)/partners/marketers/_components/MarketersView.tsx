"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { api, can } from "@/lib/api";
import { CITY_FILTER, COMMISSION_FILTER, PAYOUT_FILTER, STATUS_FILTER, type MarketerRow, type MarketerSale, type MkTone, type Payout } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { InfoBtn, KpiBox, MPill, Pager, RowBtn, Two, WaitPill } from "./bits";
import { MarketerOverlays } from "./Overlays";

// CON5-10 · المسوّقون (3114:10032) وتبويباته: المبيعات (3114:10987) · العمولات (3114:11036).
// الرابط: /partners/marketers?tab=sales|commissions & marketer=SM… | sale=BK-… | payout=PY-… | join=AR-… | mq=MQ-… & modal=… (القسم 2.3)
type Tab = "marketers" | "sales" | "commissions";
const TABS: Tab[] = ["marketers", "sales", "commissions"];
const sar2 = (n: number) => `${num(n, 2)} ر.س`;

export function MarketersView() {
  const url = useUrlState();
  const t = url.get("tab");
  const tab: Tab = (TABS as string[]).includes(t ?? "") ? (t as Tab) : "marketers";
  const me = useQuery({ queryKey: ["me"], queryFn: api.me.get });
  const edit = !me.data || can(me.data, "partners", "edit");
  const sum = useQuery({ queryKey: ["marketers", "summary"], queryFn: api.marketers.summary });
  const k = sum.data?.kpis;
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <PageHead
        title="المسوّقون"
        description="المسوّقون المستقلون وروابطهم ومبيعاتهم وعمولاتهم."
        actions={
          <>
            <Button variant="secondary" icon={<Icon name="download" size={18} />} onClick={() => setExportOpen(true)}>
              تصدير
            </Button>
            {edit ? (
              <Button icon={<Icon name="plus" size={18} />} onClick={() => url.push({ modal: "add" })}>
                إضافة مسوّق
              </Button>
            ) : null}
            <Link href="/partners/marketers/rates" className="inline-flex h-12 shrink-0 items-center justify-center rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1">
              نسب العمولة
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiBox label="المسوّقون النشطون" icon="share" loading={!k} value={k ? num(k.active.value) : undefined} hint={k?.active.hint} />
        <KpiBox label="مبيعات المسوّقين" icon="calendar" loading={!k} value={k ? num(k.sales.value) : undefined} hint={k?.sales.hint} />
        <KpiBox label="عمولات أكتوبر" icon="wallet" loading={!k} value={k ? num(k.commissions.value, 2) : undefined} hint={k?.commissions.hint} />
        <KpiBox label="تحتاج مراجعة" icon="alert" loading={!k} value={k ? num(k.review.value) : undefined} hint={k?.review.hint} hintClass={k?.review.value ? "text-pending" : undefined} />
      </div>
      {tab === "marketers" ? <PendingCard /> : null}
      <section className="flex min-w-0 flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs
          label="المسوّقون"
          value={tab}
          onChange={(key) => url.replace({ tab: key === "marketers" ? null : key })}
          items={[
            { key: "marketers", label: "المسوّقون", count: sum.data?.counts.marketers },
            { key: "sales", label: "المبيعات", count: sum.data?.counts.sales },
            { key: "commissions", label: "العمولات", count: sum.data?.counts.commissions },
          ]}
        />
        {tab === "marketers" ? <MarketersTab /> : tab === "sales" ? <SalesTab /> : <CommissionsTab />}
      </section>
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} module="marketers" tab={tab} />
      <MarketerOverlays />
    </>
  );
}

// ───────────── بانتظار قرار لينكار ─────────────
function PendingCard() {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["marketers", "pending"], queryFn: api.marketers.pending });
  const items = q.data ?? [];
  if (q.isLoading) return <section className="h-[390px] animate-pulse rounded-16 bg-white" />;
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-2.5 rounded-16 bg-white px-4 py-4 sm:px-[18px]">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-16 leading-6 font-bold text-ink">بانتظار قرار لينكار · {num(items.length)}</h2>
        <p className="text-12 leading-5 font-light text-muted">طلبات الانضمام وطلبات المسوّقين</p>
      </div>
      {items.map((it) => (
        <div key={it.id} className="flex min-h-[68px] flex-wrap items-center gap-3 rounded-12 border border-border px-3 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-14 leading-[22px] font-semibold text-ink">{ltrRuns(it.title)}</p>
            <p className="text-12 leading-[18px] font-light text-muted">{it.sub}</p>
          </div>
          <WaitPill>{it.pill}</WaitPill>
          <button
            type="button"
            onClick={() => url.push(it.kind === "join" ? { join: it.id } : { mq: it.id })}
            className="inline-flex h-[46px] shrink-0 items-center rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1"
          >
            مراجعة
          </button>
        </div>
      ))}
    </section>
  );
}

// ───────────── المسوّقون ─────────────
function MarketersTab() {
  const url = useUrlState();
  const [page, setPage] = useState(1);
  const [qs, setQs] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const filtered = !!qs.trim() || status !== "all" || city !== "all";
  const q = useQuery({ queryKey: ["marketers", "list", { page, qs, status, city }], queryFn: () => api.marketers.list({ page, q: qs, status, city }) });
  const clear = () => {
    setQs("");
    setStatus("all");
    setCity("all");
    setPage(1);
  };
  const columns = useMemo<Column<MarketerRow>[]>(
    () => [
      { id: "name", header: "المسوّق", width: 334, cell: (m) => <Two top={m.name} sub={ltrRuns(`${m.id} · منذ ${m.since}`)} /> },
      { id: "city", header: "المدينة", width: 70, cell: (m) => <span className="text-13 leading-[22px] font-light">{m.city}</span> },
      { id: "code", header: "الكود", width: 110, cell: (m) => <Two top={m.code} sub="رابط + QR" /> },
      { id: "oct", header: "أكتوبر", width: 110, cell: (m) => <Two top={`${num(m.octSales)} حجوزات`} /> },
      { id: "commission", header: "العمولة", width: 110, cell: (m) => <Two top={m.octCommission == null ? "—" : sar2(m.octCommission)} sub="عمولة أكتوبر" /> },
      {
        id: "status",
        header: "الحالة",
        width: 170,
        cell: (m) => (
          <div className="flex flex-col items-start gap-0.5">
            <MPill tone={m.status === "active" ? "success" : "danger"}>{m.status === "active" ? "نشط" : "موقوف"}</MPill>
            {m.statusNote ? <span className="text-12 leading-5 font-medium text-muted">{m.statusNote}</span> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: " ",
        width: 110,
        actions: true,
        cell: (m) => (
          <div className="flex items-center gap-1.5">
            <InfoBtn label={`تفاصيل ${m.name}`} onClick={() => url.push({ marketer: m.id })} />
            {m.status === "active" ? (
              <RowBtn danger onClick={() => url.push({ modal: "stop", id: m.id })}>
                إيقاف
              </RowBtn>
            ) : null}
          </div>
        ),
      },
    ],
    [url],
  );
  const total = q.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (q.data?.pageSize ?? 6)));
  const from = total ? (page - 1) * 6 + 1 : 0;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={qs} onChange={(v) => (setQs(v), setPage(1))} placeholder="ابحث بالاسم أو المعرّف" />
        <Select variant="filter" label="المدينة" value={city} options={CITY_FILTER} onChange={(v) => (setCity(v), setPage(1))} />
        <Select variant="filter" label="الحالة" value={status} options={STATUS_FILTER} onChange={(v) => (setStatus(v), setPage(1))} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(m) => m.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={clear}
        empty={{ title: "لا يوجد مسوّقون بعد" }}
        onRowClick={(m) => url.push({ marketer: m.id })}
        rowLabel={(m) => `${m.name} · ${m.id}`}
      />
      {total ? <Pager page={page} pages={pages} onPage={setPage} max={4} label={`عرض ${num(from)} – ${num(Math.min(page * 6, total))} من ${num(total)}`} /> : null}
    </>
  );
}

// ───────────── المبيعات ─────────────
const COMMISSION_TEXT: Record<MarketerSale["commission"], [string, MkTone]> = {
  awaiting: ["بانتظار الدفع", "neutral"],
  pending: ["بانتظار التنفيذ", "neutral"],
  review: ["تحتاج مراجعة", "pending"],
  approved: ["معتمدة", "success"],
  rejected: ["مرفوضة", "danger"],
};
const BOOKING_TEXT: Record<MarketerSale["bookingStatus"], [string, MkTone]> = {
  awaiting: ["بانتظار الدفع", "neutral"],
  done: ["مكتمل", "success"],
  visit: ["بانتظار الزيارة", "pending"],
};
export const commissionLabel = (s: Pick<MarketerSale, "commission" | "amount">) =>
  s.commission === "review" || s.commission === "rejected" ? COMMISSION_TEXT[s.commission][0] : s.commission === "approved" ? `معتمدة · ${num(s.amount, 2)}` : `${COMMISSION_TEXT[s.commission][0]} · ${num(s.amount, 2)}`;

function SalesTab() {
  const url = useUrlState();
  const [page, setPage] = useState(1);
  const [qs, setQs] = useState("");
  const [commission, setCommission] = useState("all");
  const [marketer, setMarketer] = useState("all");
  const filtered = !!qs.trim() || commission !== "all" || marketer !== "all";
  const q = useQuery({ queryKey: ["marketers", "sales", { page, qs, commission, marketer }], queryFn: () => api.marketers.sales({ page, q: qs, commission, marketer }) });
  const open = (s: MarketerSale) => (s.bookingLink ? window.location.assign(`/bookings?booking=${s.id}`) : url.push({ sale: s.id }));
  const columns = useMemo<Column<MarketerSale>[]>(
    () => [
      { id: "id", header: "الحجز", width: 90, cell: (s) => <Two top={s.id} /> },
      { id: "customer", header: "العميل", width: 90, cell: (s) => <span className="text-13 leading-[22px] font-light">{s.customer}</span> },
      { id: "marketer", header: "المسوّق والطريقة", width: 140, cell: (s) => <Two top={s.marketerId} sub={ltrRuns(s.method)} /> },
      { id: "center", header: "المركز والخدمة", width: 135, cell: (s) => <Two top={ltrRuns(s.center)} sub={s.service} /> },
      {
        id: "value",
        header: (
          <>
            القيمة
            <br />
            شامل الضريبة
          </>
        ),
        width: 120,
        cell: (s) => <Two top={`${num(s.value)} ر.س`} sub={s.valueSub ? ltrRuns(s.valueSub) : undefined} />,
      },
      { id: "booking", header: "حالة الحجز", width: 120, cell: (s) => <MPill tone={BOOKING_TEXT[s.bookingStatus][1]}>{BOOKING_TEXT[s.bookingStatus][0]}</MPill> },
      {
        id: "commission",
        header: "العمولة",
        width: 150,
        cell: (s) => (
          <div className="flex flex-col items-start gap-0.5">
            <MPill tone={COMMISSION_TEXT[s.commission][1]}>{commissionLabel(s)}</MPill>
            {s.commissionSub ? <span className="text-12 leading-5 font-medium text-muted">{s.commissionSub}</span> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: " ",
        width: 159,
        actions: true,
        cell: (s) => (
          <div className="flex items-center gap-1.5">
            <InfoBtn label={`تفاصيل ${s.id}`} onClick={() => open(s)} />
            {s.commission === "review" ? (
              <>
                <RowBtn danger onClick={() => url.push({ modal: "commission-reject", id: s.id })}>رفض</RowBtn>
                <RowBtn primary onClick={() => url.push({ modal: "commission-approve", id: s.id })}>
                  اعتماد
                </RowBtn>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url],
  );
  const total = q.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (q.data?.pageSize ?? 6)));
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={qs} onChange={(v) => (setQs(v), setPage(1))} placeholder="ابحث برقم الحجز أو المسوّق" />
        <Select
          variant="filter"
          label="المسوّق"
          value={marketer}
          options={[{ value: "all", label: "الكل" }, ...["SM118", "SM123", "SM140", "SM131", "SM152", "SM104"].map((v) => ({ value: v, label: v }))]}
          onChange={(v) => (setMarketer(v), setPage(1))}
        />
        <Select variant="filter" label="العمولة" value={commission} options={COMMISSION_FILTER} onChange={(v) => (setCommission(v), setPage(1))} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(s) => s.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => (setQs(""), setCommission("all"), setMarketer("all"), setPage(1))}
        empty={{ title: "لا توجد مبيعات بعد" }}
        onRowClick={open}
        rowLabel={(s) => `${s.id} · ${s.marketerId}`}
      />
      {total ? <Pager page={page} pages={pages} onPage={setPage} max={3} label={filtered ? `${num(total)} نتيجة · الأحدث أولاً` : `${num(total)} حجزاً هذا الشهر · الأحدث أولاً`} /> : null}
    </>
  );
}

// ───────────── العمولات (الدفعات الشهرية) ─────────────
function CommissionsTab() {
  const url = useUrlState();
  const [qs, setQs] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = !!qs.trim() || status !== "all";
  const q = useQuery({ queryKey: ["marketers", "payouts", { qs, status }], queryFn: () => api.marketers.payouts({ q: qs, status }) });
  const columns = useMemo<Column<Payout>[]>(
    () => [
      { id: "id", header: "الدفعة", width: 130, cell: (p) => <Two top={p.id} /> },
      { id: "period", header: "الفترة", width: 400, cell: (p) => <Two top={p.period} sub={p.periodSub} /> },
      { id: "marketers", header: "المسوّقون", width: 100, cell: (p) => <span className="text-13 leading-[22px] font-light">{num(p.marketers)}</span> },
      { id: "total", header: "الإجمالي", width: 140, cell: (p) => <Two top={sar2(p.total)} /> },
      {
        id: "status",
        header: "الحالة",
        width: 220,
        cell: (p) => (
          <div className="flex flex-col items-start gap-0.5">
            <MPill tone={p.status === "paid" ? "success" : "neutral"}>{p.status === "paid" ? "مُحوّلة" : "مسودة"}</MPill>
            <span className="text-12 leading-5 font-medium text-muted">{p.statusSub}</span>
          </div>
        ),
      },
      { id: "actions", header: " ", width: 34, actions: true, cell: (p) => <InfoBtn label={`تفاصيل ${p.id}`} onClick={() => url.push({ payout: p.id })} /> },
    ],
    [url],
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={qs} onChange={setQs} placeholder="ابحث برقم الدفعة" />
        <Select variant="filter" label="الحالة" value={status} options={PAYOUT_FILTER} onChange={setStatus} />
      </div>
      <DataTable
        columns={columns}
        data={q.data?.items}
        getRowId={(p) => p.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => (setQs(""), setStatus("all"))}
        empty={{ title: "لا توجد دفعات بعد" }}
        onRowClick={(p) => url.push({ payout: p.id })}
        rowLabel={(p) => `${p.id} · ${p.period}`}
        skeletonRows={3}
      />
    </>
  );
}
