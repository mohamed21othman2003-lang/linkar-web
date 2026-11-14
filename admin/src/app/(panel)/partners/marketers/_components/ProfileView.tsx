"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { SearchInput } from "@/components/panel/FilterBar";
import { EmptyState } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { METHOD_FILTER, PERIOD_FILTER, PROFILE_STATUS_FILTER, type MarketerRequest, type MkPayoutRow, type MkProfileSale, type MkTone } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { Hero, InfoBtn, KpiBox, MKV, MPill, MTile, RowBtn } from "./bits";
import { MarketerModals } from "./Modals";
import { RequestDrawer } from "./Overlays";

// CON5-10P · ملف المسوّق — نظرة عامة (تركي الحارثي 3114:11435 · رنا 12920 · دانة 13517 · سعد 14114 · ياسر 14711 · منصور 15308)
// · المبيعات (11571 …) · الدفعات (11837 …) · طلبات التعديل (11948 …).
// الرابط: /partners/marketers/<SM>?tab=sales|payouts|requests & sale=BK-… | payout=PY-… | mq=MQ-… & modal=actions|edit|balance|stop|reactivate|mq-reject
type Tab = "overview" | "sales" | "payouts" | "requests";
const TABS: Tab[] = ["overview", "sales", "payouts", "requests"];
const HEAD_BTN = "inline-flex h-[50px] shrink-0 items-center justify-center gap-1.5 rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1";

export const SALE_STATUS: Record<MkProfileSale["status"], [string, MkTone]> = {
  awaiting: ["بانتظار الدفع", "neutral"],
  pending: ["بانتظار التنفيذ", "warning"],
  approved: ["معتمدة", "success"],
  cancelled: ["ملغاة", "danger"],
  paid: ["مدفوعة", "paid"],
};

export function ProfileView({ id }: { id: string }) {
  const url = useUrlState();
  const t = url.get("tab");
  const tab: Tab = (TABS as string[]).includes(t ?? "") ? (t as Tab) : "overview";
  const q = useQuery({ queryKey: ["marketers", "profile", id], queryFn: () => api.marketers.profile(id), retry: false });
  const m = q.data;
  const p = m?.profile;
  const active = m?.status === "active";

  if (q.isError)
    return (
      <EmptyState
        title="المسوّق غير موجود"
        body="ربما تغيّر المعرّف أو لا يوجد ملف لهذا المسوّق."
        action={
          <Link href="/partners/marketers" className={HEAD_BTN}>
            رجوع إلى المسوّقين
          </Link>
        }
      />
    );

  return (
    <>
      <nav aria-label="مسار الصفحة" className="flex items-center gap-1.5 text-13 leading-[22px] font-medium">
        <Link href="/partners/marketers" className="text-muted hover:text-ink">
          المسوّقون
        </Link>
        <Icon name="chevron-left" size={16} className="text-muted" />
        <span className="text-ink">{m?.name ?? "…"}</span>
      </nav>
      <section className="flex flex-wrap items-center gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-14 bg-lime text-ink">
          <Icon name="share" size={28} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {m && p ? (
            <>
              <h1 className="text-24 leading-[38px] font-bold text-ink">{ltrRuns(`${m.name} · ${m.id}`)}</h1>
              <p className="text-13 leading-[22px] font-light text-muted">{p.headSub}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <MPill tone={active ? "success" : "danger"}>{active ? "نشط" : "موقوف"}</MPill>
                <MPill tone="neutral">الجوال موثّق</MPill>
                {m.openRequests ? <MPill tone="warning">{m.openRequests === 1 ? "طلب تعديل" : m.openRequests === 2 ? "طلبا تعديل" : `${m.openRequests} طلبات تعديل`}</MPill> : null}
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </>
          )}
        </div>
        {p?.head === "actions" ? (
          <div className="flex flex-wrap gap-4">
            <button type="button" className={HEAD_BTN} onClick={() => url.push({ modal: "balance", id })}>
              رصيد كود العميل
              <Icon name="gift" size={18} />
            </button>
            <button type="button" className={HEAD_BTN} onClick={() => url.push({ modal: "actions", id })}>
              إجراءات
              <Icon name="chevron-down" size={18} />
            </button>
          </div>
        ) : p ? (
          <button type="button" className={HEAD_BTN} onClick={() => url.push({ modal: active ? "stop" : "reactivate", id })}>
            {active ? "إيقاف المسوّق" : "إعادة التفعيل"}
            {active ? <Icon name="chevron-down" size={18} /> : null}
          </button>
        ) : null}
      </section>
      <section className="flex min-w-0 flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs
          variant="pill"
          label="ملف المسوّق"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "overview" ? null : k })}
          items={[
            { key: "overview", label: "نظرة عامة" },
            { key: "sales", label: "المبيعات", count: p?.sales.length },
            { key: "payouts", label: "الدفعات", count: p?.payouts.length },
            { key: "requests", label: "طلبات التعديل", count: m?.openRequests },
          ]}
        />
        {!m || !p ? (
          <Skeleton className="h-[420px] w-full rounded-12" />
        ) : tab === "overview" ? (
          <Overview m={m} />
        ) : tab === "sales" ? (
          <SalesTab sales={p.sales} />
        ) : tab === "payouts" ? (
          <PayoutsTab rows={p.payouts} note={p.payoutsNote} />
        ) : (
          <RequestsTab id={id} />
        )}
      </section>
      {m && p ? <ProfileOverlays m={m} /> : null}
      <MarketerModals />
    </>
  );
}

type Profiled = Awaited<ReturnType<typeof api.marketers.profile>>;

// ───────────── نظرة عامة ─────────────
function Overview({ m }: { m: Profiled }) {
  const p = m.profile!;
  const k = p.kpis;
  const kpi = (label: string, icon: UiGlyph, [v, hint]: [string, string], green?: boolean) => <KpiBox small label={label} icon={icon} value={v} hint={hint} hintClass={green ? "text-success" : undefined} />;
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpi("مبيعات أكتوبر", "calendar", k.sales)}
        {kpi("بانتظار التنفيذ", "clock", k.pending)}
        {kpi("عمولة معتمدة", "check", k.approved, true)}
        {kpi("المحوّل منذ الانضمام", "wallet", k.transferred)}
      </div>
      <div className="grid items-start gap-3 lg:grid-cols-2">
        <Card title="البيانات الشخصية" sub="الجوال موثّق برمز التحقق">
          <MKV b k="الاسم">
            {m.name}
          </MKV>
          <MKV b k="المعرّف">
            {m.id}
          </MKV>
          <MKV b k="الجوال">
            <bdi>{p.phone}</bdi>
          </MKV>
          <MKV b k="البريد">
            <bdi>{p.email}</bdi>
          </MKV>
          <MKV b k="المدينة">
            {m.city}
          </MKV>
          <MKV b k="قناة الترويج">
            {p.channel}
          </MKV>
          <MKV b k="الانضمام">
            {p.joined}
          </MKV>
        </Card>
        <Card title="أدوات البيع" sub="الرابط والكود">
          <MKV b k="كود العميل">
            {m.code}
          </MKV>
          <MKV b k="رصيد العميل">
            {ltrRuns(`${num(m.balance.value)} ر.س على الخدمات المؤهلة من ${num(m.balance.min)} ر.س`)}
          </MKV>
          <MKV b k="روابط الخدمات">
            {ltrRuns(p.links)}
          </MKV>
          <MKV b k="العمولة">
            حسب كل خدمة · نسبة أو مبلغ ثابت
          </MKV>
        </Card>
      </div>
      <Card title="حسابات الاستلام">
        <DataTable
          columns={[
            {
              id: "acc",
              header: "الحساب",
              width: 740,
              cell: (a) => (
                <div className="flex flex-col">
                  <span className="text-13 leading-5 font-semibold text-ink">{a.name}</span>
                  <span className="text-12 leading-5 font-light text-muted">{ltrRuns(a.masked)}</span>
                </div>
              ),
            },
            { id: "type", header: "النوع", width: 160, cell: (a) => <span className="text-13 leading-5 font-normal">{a.type}</span> },
            { id: "status", header: "الحالة", width: 110, cell: (a) => <MPill tone={a.pill === "default" ? "paid" : "success"}>{a.pill === "default" ? "افتراضي" : "معتمدة"}</MPill> },
          ]}
          data={p.accounts}
          getRowId={(a) => a.name}
          headRadius={10}
          edge={12}
          rowPadY={12}
          rowClassName="border-divider"
          empty={{ title: "لا توجد حسابات استلام" }}
        />
      </Card>
    </>
  );
}
function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-16 border border-border bg-white px-4 pt-5 pb-[18px] sm:px-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] leading-7 font-bold text-ink">{title}</h2>
        {sub ? <p className="text-13 leading-5 font-light text-muted">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

// ───────────── المبيعات ─────────────
function SalesTab({ sales }: { sales: MkProfileSale[] }) {
  const url = useUrlState();
  const [qs, setQs] = useState("");
  const [method, setMethod] = useState("الكل");
  const [period, setPeriod] = useState("أكتوبر 2026");
  const [status, setStatus] = useState("all");
  const filtered = !!qs.trim() || method !== "الكل" || status !== "all";
  const items = sales.filter(
    (s) => (method === "الكل" || s.method === method) && (status === "all" || s.status === status) && (!qs.trim() || s.id.toLowerCase().includes(qs.trim().toLowerCase()) || s.customer.includes(qs.trim())),
  );
  const open = (s: MkProfileSale) => (s.status === "awaiting" ? window.location.assign(`/bookings?booking=${s.id}`) : url.push({ sale: s.id }));
  const columns = useMemo<Column<MkProfileSale>[]>(
    () => [
      { id: "id", header: "الحجز", width: 150, cell: (s) => <Stack top={s.id} sub={s.date} /> },
      { id: "customer", header: "العميل", width: 110, cell: (s) => <span className="text-13 leading-5 font-normal">{s.customer}</span> },
      { id: "service", header: "الخدمة والمركز", width: 268, cell: (s) => <Stack top={s.service} sub={ltrRuns(s.center)} /> },
      { id: "method", header: "الطريقة", width: 100, cell: (s) => <span className="text-13 leading-5 font-normal">{s.method}</span> },
      { id: "paid", header: "دفع العميل · ر.س", width: 110, cell: (s) => <span className="num text-13 leading-5 font-normal">{num(s.paid, 2)}</span> },
      { id: "commission", header: "العمولة · ر.س", width: 100, cell: (s) => <Stack top={num(s.commission, 2)} sub={s.rate} /> },
      { id: "status", header: "الحالة", width: 120, cell: (s) => <MPill tone={SALE_STATUS[s.status][1]}>{SALE_STATUS[s.status][0]}</MPill> },
      { id: "actions", header: " ", width: 44, actions: true, cell: (s) => <InfoBtn label={`تفاصيل ${s.id}`} onClick={() => open(s)} /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url],
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={qs} onChange={setQs} placeholder="ابحث برقم الحجز أو اسم العميل" />
        <Select variant="filter" label="الحالة" value={status} options={PROFILE_STATUS_FILTER} onChange={setStatus} />
        <Select variant="filter" label="الفترة" value={period} options={PERIOD_FILTER} onChange={setPeriod} />
        <Select variant="filter" label="الطريقة" value={method} options={METHOD_FILTER} onChange={setMethod} />
      </div>
      <DataTable
        columns={columns}
        data={items}
        getRowId={(s) => s.id}
        filtered={filtered}
        onClearFilters={() => (setQs(""), setMethod("الكل"), setStatus("all"))}
        empty={{ title: "لا توجد مبيعات بعد" }}
        onRowClick={open}
        rowLabel={(s) => `${s.id} · ${s.customer}`}
        headRadius={10}
        edge={12}
        rowPadY={12}
        rowClassName="border-divider"
      />
      <p className="text-12 leading-5 font-light text-muted">عرض {num(items.length)} مبيعات · الأحدث أولاً</p>
    </>
  );
}
function Stack({ top, sub }: { top: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-13 leading-5 font-semibold text-ink">{top}</span>
      {sub ? <span className="text-12 leading-5 font-light text-muted">{sub}</span> : null}
    </div>
  );
}

// ───────────── الدفعات ─────────────
function PayoutsTab({ rows, note }: { rows: MkPayoutRow[]; note: string }) {
  const url = useUrlState();
  const columns = useMemo<Column<MkPayoutRow>[]>(
    () => [
      { id: "id", header: "الدفعة", width: 170, cell: (r) => <Stack top={r.id} sub={r.period} /> },
      { id: "range", header: "الفترة", width: 258, cell: (r) => <span className="text-13 leading-5 font-normal">{ltrRuns(r.range)}</span> },
      { id: "count", header: "العمولات", width: 100, cell: (r) => <span className="text-13 leading-5 font-normal">{r.count}</span> },
      { id: "amount", header: "المبلغ · ر.س", width: 110, cell: (r) => <span className="num text-13 leading-5 font-normal">{num(r.amount, 2)}</span> },
      { id: "account", header: "حساب الاستلام", width: 160, cell: (r) => <span className="text-13 leading-5 font-normal">{r.account}</span> },
      {
        id: "status",
        header: "الحالة",
        width: 170,
        cell: (r) => (
          <div className="flex flex-col items-start gap-0.5">
            <MPill tone={r.status === "paid" ? "success" : "neutral"}>{r.status === "paid" ? "مدفوعة" : "مسودة"}</MPill>
            <span className="text-12 leading-5 font-light text-muted">{r.statusSub}</span>
          </div>
        ),
      },
      { id: "actions", header: " ", width: 44, actions: true, cell: (r) => <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => url.push({ payout: r.id })} /> },
    ],
    [url],
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        empty={{ title: "لا دفعات بعد" }}
        onRowClick={(r) => url.push({ payout: r.id })}
        rowLabel={(r) => `${r.id} · ${r.period}`}
        headRadius={10}
        edge={12}
        rowPadY={12}
        rowClassName="border-divider"
      />
      <p className="text-12 leading-5 font-light text-muted">{ltrRuns(note)}</p>
    </>
  );
}

// ───────────── طلبات التعديل ─────────────
function RequestsTab({ id }: { id: string }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["marketers", "requests-of", id], queryFn: () => api.marketers.requestsOf(id) });
  const items = q.data ?? [];
  const columns = useMemo<Column<MarketerRequest>[]>(
    () => [
      { id: "id", header: "الطلب", width: 150, cell: (r) => <Stack top={r.id} sub="بوابة المسوّقين" /> },
      { id: "type", header: "النوع", width: 150, cell: (r) => <span className="text-13 leading-5 font-normal">{r.type}</span> },
      { id: "detail", header: "التفاصيل", width: 442, cell: (r) => <Stack top={ltrRuns(r.detail)} sub={ltrRuns(r.current)} /> },
      { id: "date", header: "التاريخ", width: 80, cell: () => <span className="text-13 leading-5 font-normal">اليوم</span> },
      { id: "status", header: "الحالة", width: 120, cell: () => <MPill tone="warning">بانتظار القرار</MPill> },
      { id: "actions", header: " ", width: 80, actions: true, cell: (r) => <RowBtn onClick={() => url.push({ mq: r.id })}>مراجعة</RowBtn> },
    ],
    [url],
  );
  if (q.isLoading) return <Skeleton className="h-40 w-full rounded-12" />;
  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        emptyNode={<span className="sr-only">لا توجد طلبات تعديل</span>}
        getRowId={(r) => r.id}
        error={q.isError}
        onRetry={() => q.refetch()}
        onRowClick={(r) => url.push({ mq: r.id })}
        rowLabel={(r) => `${r.id} · ${r.type}`}
        headRadius={10}
        edge={12}
        rowPadY={12}
        rowClassName="border-divider"
      />
      <p className="text-12 leading-5 font-light text-muted">{!items.length ? "لا توجد طلبات تعديل" : items.length === 1 ? "طلب واحد بانتظار القرار" : items.length === 2 ? "طلبان بانتظار القرار" : `${num(items.length)} طلبات بانتظار القرار`}</p>
    </>
  );
}

// ───────────── أدراج الملف ─────────────
function ProfileOverlays({ m }: { m: Profiled }) {
  const url = useUrlState();
  const s = url.get("sale");
  const p = url.get("payout");
  const q = url.get("mq");
  const close = (k: string) => () => url.replace({ [k]: null, modal: null, id: null });
  const sale = s ? m.profile!.sales.find((x) => x.id === s) : undefined;
  const payout = p ? m.profile!.payouts.find((x) => x.id === p) : undefined;
  return (
    <>
      {sale ? <ProfileSaleDrawer m={m} s={sale} onClose={close("sale")} /> : null}
      {payout ? <ProfilePayoutDrawer m={m} p={payout} onClose={close("payout")} /> : null}
      {q ? <RequestDrawer id={q} onClose={close("mq")} /> : null}
    </>
  );
}

// CON5-10D · BK-… · تركي الحارثي (BK-21489 3114:12262 · BK-21455 12322 · BK-21433 12382 · BK-21422 12442 · BK-21415 12496 · BK-21329 12556)
function ProfileSaleDrawer({ m, s, onClose }: { m: Profiled; s: MkProfileSale; onClose: () => void }) {
  const code = m.code;
  // باقي المسوّقين: نفس الدرج من بيانات الصف (Figma رسم أدراج تركي الحارثي بس)
  const d = s.detail ?? {
    price: `${num(s.paid + (s.paid >= 1000 ? 300 : 0), 2)} ر.س`,
    balance: s.paid >= 1000 ? "300.00 ر.س" : "لا ينطبق",
    paidLabel: s.status === "cancelled" ? "دفعه العميل ثم استُرد" : undefined,
    commissionLabel: s.status === "cancelled" ? "العمولة · أُلغيت" : undefined,
    methodText: s.method === "الكود" ? `كود العميل ${code}` : s.method === "حجز المسوّق" ? "حجز المسوّق" : "رابط المسوّق",
    stages:
      s.status === "cancelled"
        ? ([["الدفع", s.date], ["إلغاء الحجز واسترداد المبلغ", s.date]] as [string, string][])
        : ([
            ["الدفع", s.date],
            ["تنفيذ الخدمة", s.status === "pending" ? "بانتظار الزيارة" : s.date],
            ["اعتماد العمولة", s.status === "pending" ? "بعد تنفيذ الخدمة" : s.date],
            ["الصرف", s.status === "paid" ? "مدفوعة" : "1 نوفمبر 2026"],
          ] as [string, string][]),
  };
  const [label, tone] = SALE_STATUS[s.status];
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={<bdi>{s.id}</bdi>} subtitle={ltrRuns(`بيع مسوّق · ${m.name} · ${m.id}`)}>
      <Hero b icon="share" title={s.service} sub={ltrRuns(s.center)} pill={<MPill tone={tone}>{label}</MPill>} />
      <MTile b title="البيع">
        <MKV b k="العميل">
          {s.customer}
        </MKV>
        <MKV b k="التاريخ">
          {s.date}
        </MKV>
        <MKV b k="الطريقة">
          {ltrRuns(d.methodText)}
        </MKV>
      </MTile>
      <MTile b title="المبلغ والعمولة">
        <MKV b k="سعر البيع شامل الضريبة">
          <bdi>{d.price}</bdi>
        </MKV>
        <MKV b k={ltrRuns(`رصيد العميل · ${code}`)}>
          <bdi>{d.balance}</bdi>
        </MKV>
        <MKV b k={d.paidLabel ?? "دفع العميل"}>
          <bdi>{num(s.paid, 2)} ر.س</bdi>
        </MKV>
        <MKV b k={d.commissionLabel ?? `العمولة · ${s.rate}`}>
          <bdi>{num(s.commission, 2)} ر.س</bdi>
        </MKV>
      </MTile>
      <MTile b title="المراحل">
        {d.stages.map(([k, v]) => (
          <MKV key={k} b k={k}>
            {ltrRuns(v)}
          </MKV>
        ))}
      </MTile>
    </Drawer>
  );
}

// CON5-10D · PY-… · SM123 (PY-2026-11-001 3114:12616 · PY-2026-10-001 12690 · PY-2026-09-001 12818)
function ProfilePayoutDrawer({ m, p, onClose }: { m: Profiled; p: MkPayoutRow; onClose: () => void }) {
  const toast = useToast();
  const acc = m.profile!.accounts[0];
  const last4 = acc.masked.match(/(\d{4}) ·/)?.[1] ?? "";
  const accountFull = p.accountFull ?? `${acc.name} · SA•• ${last4}`;
  const heroSub = p.heroSub ?? `${p.count} عمولة · ${acc.name} · ${last4}`;
  const items = p.items ?? m.profile!.sales.filter((s) => (p.status === "draft" ? s.status === "approved" : s.status === "paid")).map((s) => ({ bk: s.id, service: s.service, paid: s.paid, commission: s.commission }));
  const draft = p.status === "draft";
  const dl = useMutation({ mutationFn: () => api.marketers.statement(p.id, m.id), onSuccess: () => toast("جارٍ تنزيل كشف الدفعة", "جارٍ تنزيل كشف الدفعة بصيغة PDF") });
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={<bdi>{`${p.id} · ${m.id}`}</bdi>}
      subtitle={`${m.name} · ${p.period}`}
      footer={
        <Button variant="secondary" icon={<Icon name="download" size={18} />} loading={dl.isPending} onClick={() => dl.mutate()}>
          تنزيل كشف الدفعة
        </Button>
      }
    >
      <Hero b icon="wallet" title={<bdi>{num(p.amount, 2)} ر.س</bdi>} sub={ltrRuns(heroSub)} pill={<MPill tone={draft ? "neutral" : "success"}>{draft ? "مسودة" : "مدفوعة"}</MPill>} />
      <MTile b title="التحويل">
        <MKV b k="الحالة">
          {p.transferStatus ?? p.statusSub}
        </MKV>
        <MKV b k="الحساب">
          {ltrRuns(accountFull)}
        </MKV>
      </MTile>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-16 leading-6 font-bold text-ink">العمولات</h3>
        <p className="text-12 leading-5 font-light text-muted">{p.count}</p>
      </div>
      <DataTable
        columns={[
          { id: "bk", header: "الحجز", width: 110, cell: (r) => <span className="text-13 leading-5 font-normal">{r.bk}</span> },
          { id: "svc", header: "الخدمة", width: 190, cell: (r) => <span className="text-13 leading-5 font-normal">{ltrRuns(r.service)}</span> },
          { id: "paid", header: "دفع العميل", width: 100, cell: (r) => <span className="num text-13 leading-5 font-normal">{num(r.paid, 2)}</span> },
          { id: "c", header: "العمولة", width: 90, cell: (r) => <span className="num text-13 leading-5 font-normal">{num(r.commission, 2)}</span> },
        ]}
        data={items}
        getRowId={(r) => r.bk}
        headRadius={10}
        edge={12}
        rowPadY={12}
        rowClassName="border-divider"
        empty={{ title: "لا توجد عمولات في هذه الدفعة" }}
      />
    </Drawer>
  );
}
