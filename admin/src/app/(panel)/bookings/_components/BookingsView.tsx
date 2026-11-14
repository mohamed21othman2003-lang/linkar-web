"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { FilterBar, SearchInput } from "@/components/panel/FilterBar";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { BOOKING_TABS, BRANCH_OPTS, CATEGORIES, CHANNELS, PAGE_SIZE, PERIODS, PROVIDER_OPTS, STATUS_PILL, type Booking, type BookingTab, type ContactRow } from "@/lib/api/bookings";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { BookingDrawer } from "./BookingDrawer";
import { BookingOverlays } from "./BookingOverlays";
import { Done, DotsBtn, Money, Pagination, Plain, SquareBtn, StatusPill, TwoLine } from "./bits";

// CON5-04 · الحجوزات (3114-33571) وتبويباته: بانتظار الزيارة (3114-33657) · مكتملة (3114-33711) · ملغاة ومستردة (3114-33765)
// · بانتظار قرار لينكار (3114-33819) · معتمدة (3248-93610) · الحجز اليدوي (3248-104148 · بعد الحجز 3248-104956)
// الرابط: /bookings?tab=&q=&provider=&branch=&category=&period=&channel=&page= · الدرج ?booking=BK-… · النوافذ ?modal=…&b=BK-…
const TAB_LABEL: Record<BookingTab, string> = {
  all: "الكل",
  "awaiting-visit": "بانتظار الزيارة",
  completed: "مكتملة",
  approved: "معتمدة",
  cancelled: "ملغاة",
  linkar: "بانتظار قرار لينكار",
  manual: "الحجز اليدوي",
};

const all = (opts: readonly { value: string; label: string }[]) => [{ value: "", label: "الكل" }, ...opts];
const PROVIDERS = all(PROVIDER_OPTS);
const BRANCHES = all(BRANCH_OPTS);
const SERVICES = all(CATEGORIES.map((c) => ({ value: c, label: c })));
const CHANNEL_OPTS = all(CHANNELS);
// قيمة القائمة 13 SemiBold وحشو 12 يمين و10 شمال ومسافة 4 (نفس CON5-07)
const FILTER = "gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold";

export function BookingsView() {
  const url = useUrlState();
  const canEdit = useCan("bookings", "edit");
  const tab = (BOOKING_TABS as readonly string[]).includes(url.get("tab") ?? "") ? (url.get("tab") as BookingTab) : "all";
  const provider = url.get("provider") ?? "";
  const branch = url.get("branch") ?? "";
  const category = url.get("category") ?? "";
  const period = url.get("period") ?? "2026-10";
  const channel = url.get("channel") ?? "";
  const q = url.get("q") ?? "";
  const page = Math.max(1, Number(url.get("page")) || 1);

  // البحث يتكتب محلياً ويتحدّث في الرابط بعد توقف الكتابة
  const [search, setSearch] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setSearch(q);
  }
  const { replace } = url;
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => replace({ q: search.trim() || null, page: null }), 300);
    return () => clearTimeout(t);
  }, [search, q, replace]);

  const filters = { tab, q, provider, branch, category, period, channel, page };
  const list = useQuery({ queryKey: ["bookings", "list", filters], queryFn: () => api.bookings.list(filters) });
  const kpis = useQuery({ queryKey: ["bookings", "kpis"], queryFn: api.bookings.kpis });
  const counts = list.data?.counts;
  const filtered = !!(q || provider || branch || category || channel || period !== "2026-10");
  const clear = () => {
    setSearch("");
    url.replace({ q: null, provider: null, branch: null, category: null, period: null, channel: null, page: null });
  };
  const set = (k: string) => (v: string) => url.replace({ [k]: v || null, page: null });

  const openDrawer = (b: Booking) => url.push({ booking: b.id, modal: null, b: null });
  const openActions = (b: Booking) => url.push({ modal: "actions", b: b.id, booking: null });
  const open = (modal: string, b: Booking) => url.push({ modal, b: b.id, booking: null });

  const columns = useMemo(() => columnsFor(tab, { openDrawer, openActions, open, canEdit }), [tab, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.ceil((list.data?.total ?? 0) / PAGE_SIZE);

  return (
    <>
      <div className="-mt-2">
        <PageHead
          title="الحجوزات"
          description="كل حجوزات العملاء على لينكار بكل مقدّمي الخدمة."
          actions={
            canEdit ? (
              <ButtonLink href="/bookings/new?step=1" variant="accent" className="h-11! gap-1.5">
                <Icon name="plus" size={16} />
                حجز يدوي
              </ButtonLink>
            ) : null
          }
        />
      </div>
      <ContactCard canEdit={canEdit} onNotify={(m) => url.push({ modal: m })} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="حجوزات اليوم" icon="calendar" value={kpis.data?.today} />
        <Kpi label="بانتظار الزيارة" icon="clock" value={kpis.data?.awaitingVisit} />
        <Kpi label="بانتظار قرار لينكار" icon="alert" value={kpis.data?.linkar} />
        <Kpi label="ملغاة" icon="x" value={kpis.data?.cancelled} />
      </div>
      <section className="flex flex-col gap-4 rounded-16 bg-white p-5">
        <Tabs
          variant="pill"
          label="تبويبات الحجوزات"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "all" ? null : k, page: null })}
          items={BOOKING_TABS.map((k) => ({ key: k, label: TAB_LABEL[k], count: counts?.[k] }))}
        />
        <FilterBar className="gap-2!" onClear={clear} canClear={filtered}>
          <Select variant="filter" label="مقدّم الخدمة" value={provider} options={PROVIDERS} onChange={set("provider")} className={FILTER} />
          <Select variant="filter" label="الفرع" value={branch} options={BRANCHES} onChange={set("branch")} className={FILTER} />
          <Select variant="filter" label="الخدمة" value={category} options={SERVICES} onChange={set("category")} className={FILTER} />
          <Select variant="filter" label="الفترة" value={period} options={PERIODS} onChange={(v) => url.replace({ period: v === "2026-10" ? null : v, page: null })} className={FILTER} />
          <Select variant="filter" label="القناة" value={channel} options={CHANNEL_OPTS} onChange={set("channel")} className={FILTER} />
          <span className="hidden flex-1 lg:block" />
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث برقم الحجز أو الجوال" className="h-[38px]! w-full lg:w-[260px] [&_input]:text-end [&_svg]:text-muted" iconEnd />
        </FilterBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(b) => b.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={{ title: "لا توجد حجوزات في هذا التبويب" }}
          emptyNode={tab === "manual" ? <p className="px-3 py-11 text-center text-14 text-muted">لا توجد حجوزات يدوية بانتظار الدفع</p> : undefined}
          onRowClick={openDrawer}
          rowLabel={(b) => `تفاصيل ${b.id}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
        <Pagination page={page} pages={pages} onPage={(p) => url.replace({ page: p === 1 ? null : String(p) })} />
      </section>
      <BookingDrawer />
      <BookingOverlays />
    </>
  );
}

// ───────────── أعمدة كل تبويب (عرض كل عمود من Figma) ─────────────
type Ctx = { openDrawer: (b: Booking) => void; openActions: (b: Booking) => void; open: (m: string, b: Booking) => void; canEdit: boolean };
const head2 = (a: string) => (
  <span className="block leading-5 whitespace-normal">
    {a}
    <br />
    شامل الضريبة
  </span>
);

function columnsFor(tab: BookingTab, c: Ctx): Column<Booking>[] {
  const W: Record<string, number[]> = {
    // رقم · العميل · المزوّد · الخدمة · بيع · تكلفة · (أعمدة التبويب) · الإجراءات
    all: [100, 120, 110, 152, 100, 100, 130, 160, 100],
    manual: [100, 120, 110, 152, 100, 100, 130, 160, 100],
    "awaiting-visit": [88, 112, 118, 152, 82, 80, 112, 126, 116, 88],
    completed: [100, 130, 130, 202, 100, 100, 130, 180],
    approved: [100, 130, 130, 202, 100, 100, 130, 180],
    cancelled: [100, 130, 130, 282, 100, 100, 130, 100],
    linkar: [100, 120, 110, 152, 100, 100, 130, 130, 130],
  };
  const w = W[tab];
  const withBranch = !["all", "manual", "linkar"].includes(tab);
  const base: Column<Booking>[] = [
    { id: "id", header: "رقم الحجز", width: w[0], cell: (b) => <Plain>{b.id}</Plain> },
    { id: "customer", header: "العميل", width: w[1], cell: (b) => <TwoLine top={b.customer.name} bottom={b.customer.phone} ltrBottom /> },
    { id: "provider", header: withBranch ? "مقدّم الخدمة · الفرع" : "مقدّم الخدمة", width: w[2], cell: (b) => <TwoLine top={b.provider} bottom={b.branch} /> },
    { id: "service", header: "الخدمة", width: w[3], cell: (b) => <TwoLine top={b.service} bottom={b.size} /> },
    { id: "sale", header: head2("سعر البيع"), width: w[4], cell: (b) => <Money v={b.sale} /> },
    { id: "cost", header: head2("سعر التكلفة"), width: w[5], cell: (b) => <Money v={b.cost} /> },
  ];
  const details = (b: Booking) => <SquareBtn icon="info" label={`تفاصيل ${b.id}`} onClick={() => c.openDrawer(b)} />;
  const dots = (b: Booking) => (c.canEdit ? <DotsBtn label={`إجراءات ${b.id}`} onClick={() => c.openActions(b)} /> : null);
  const actions = (width: number, extra?: (b: Booking) => ReactNode): Column<Booking> => ({
    id: "actions",
    header: " ",
    width,
    // في Figma الأزرار على يمين العمود (مش آخره) — فمش عمود actions بتاع الجدول، والضغط جواه ما يفتحش الصف
    cell: (b) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {details(b)}
        {b.status === "cancelled" ? null : dots(b)}
        {extra?.(b)}
      </div>
    ),
  });

  switch (tab) {
    case "awaiting-visit":
      return [
        ...base,
        {
          id: "pc",
          header: "تواصل المزوّد",
          width: w[6],
          cell: (b) =>
            b.providerContact?.done ? (
              <div className="flex flex-col gap-0.5">
                <Done label="تم" />
                <span className="text-12 leading-[18px] font-light text-muted">{b.providerContact.date}</span>
              </div>
            ) : (
              <span className="text-13 leading-5 font-normal text-muted">لم يتم</span>
            ),
        },
        {
          id: "lc",
          header: "تواصل لينكار",
          width: w[7],
          cell: (b) =>
            b.linkar?.done ? (
              <Done label={b.linkar.satisfied ? "راضٍ" : "غير راضٍ"} tone={b.linkar.satisfied ? "ok" : "bad"} />
            ) : c.canEdit ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  c.open("contact-log", b);
                }}
                className="flex h-[34px] items-center gap-1.5 rounded-8 border border-ink bg-white ps-3 pe-2.5 text-13 font-semibold text-ink hover:bg-surface-1"
              >
                تم التواصل
                <Icon name="phone" size={14} />
              </button>
            ) : (
              <span className="text-13 text-muted">لم يتم</span>
            ),
        },
        { id: "visit", header: "موعد الزيارة", width: w[8], cell: (b) => <Plain>{b.visitDate ?? "—"}</Plain> },
        actions(w[9]),
      ];
    case "completed":
      return [
        ...base,
        { id: "rating", header: "التقييم والشكاوى", width: w[6], cell: () => null },
        actions(w[7], (b) =>
          c.canEdit ? (
            <button type="button" onClick={() => c.open("approve", b)} className="flex h-[37px] items-center gap-1.5 rounded-8 bg-ink px-3 text-13 font-semibold text-white hover:bg-ink/90">
              <Icon name="check" size={14} />
              اعتماد
            </button>
          ) : null,
        ),
      ];
    case "approved":
      return [
        ...base,
        {
          id: "rating",
          header: "التقييم والشكاوى",
          width: w[6],
          cell: (b) =>
            b.rating ? (
              <span className="flex gap-0.5" aria-label={`التقييم ${b.rating} من 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star-filled" size={14} className={i <= b.rating! ? "text-star" : "text-border"} />
                ))}
              </span>
            ) : null,
        },
        actions(w[7]),
      ];
    case "cancelled":
      return [...base, { id: "cancelled", header: "تاريخ الإلغاء", width: w[6], cell: (b) => <Plain>{b.cancelledAt ?? "—"}</Plain> }, actions(w[7])];
    case "linkar":
      return [
        ...base,
        { id: "request", header: "الطلب", width: w[6], cell: (b) => <Plain>{b.request?.label ?? "—"}</Plain> },
        { id: "voucher", header: "القسيمة", width: w[7], cell: (b) => <Plain>{b.voucher}</Plain> },
        actions(w[8]),
      ];
    default:
      return [
        ...base,
        { id: "status", header: "الحالة", width: w[6], cell: (b) => <StatusPill kind={STATUS_PILL[b.status].kind}>{b.status === "approved" ? "معتمد" : STATUS_PILL[b.status].label}</StatusPill> },
        { id: "voucher", header: "القسيمة", width: w[7], cell: (b) => <Plain>{b.voucher}</Plain> },
        actions(w[8]),
      ];
  }
}

// ───────────── «حجوزات جديدة بانتظار التواصل» (CON7 · 3114:33571) ─────────────
function ContactCard({ canEdit, onNotify }: { canEdit: boolean; onNotify: (m: string) => void }) {
  const q = useQuery({ queryKey: ["bookings", "contact"], queryFn: api.bookings.contactSummary });
  const d = q.data;
  const cols: Column<ContactRow>[] = [
    { id: "p", header: "المزوّد", width: 190, cell: (r) => <span className="text-13 leading-5 font-medium text-ink">{r.provider}</span> },
    {
      id: "b",
      header: "الفروع",
      width: 290,
      cell: (r) => (
        <div className="flex flex-col gap-0.5">
          <Plain>{num(r.branches)}</Plain>
          {r.branchLine ? <span className="text-12 leading-[18px] font-light text-muted">{r.branchLine}</span> : null}
        </div>
      ),
    },
    { id: "n", header: "حجوزات جديدة", width: 140, cell: (r) => <Plain>{num(r.fresh)}</Plain> },
    { id: "pc", header: "تواصل المزوّد", width: 150, cell: (r) => <Plain>{`${num(r.providerContacted)} من ${num(r.fresh)}`}</Plain> },
    { id: "lc", header: "تواصل لينكار", width: 150, cell: (r) => <Plain>{`${num(r.linkarContacted)} من ${num(r.fresh)}`}</Plain> },
    { id: "d", header: "أقرب موعد", width: 152, cell: (r) => <Plain>{r.nearest}</Plain> },
  ];
  return (
    <section className="flex flex-col gap-3.5 rounded-16 bg-white px-5 py-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-16 leading-6 font-semibold text-ink">حجوزات جديدة بانتظار التواصل</h2>
          {d ? (
            <p className="num text-13 leading-5 text-muted">{`${num(d.fresh)} حجزاً جديداً · ${num(d.branches)} فرعاً · ${num(d.providers)} مزوّداً · تم التواصل مع ${num(d.contacted)}`}</p>
          ) : (
            <Skeleton className="h-4 w-72" />
          )}
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name="phone" size={16} />
        </span>
        <span className="flex-1" />
        {canEdit ? (
          <div className="flex gap-2.5">
            <NotifyBtn icon="user" onClick={() => onNotify("notify-crm")}>
              تنبيه موظف CRM
            </NotifyBtn>
            <NotifyBtn icon="bell" onClick={() => onNotify("notify-providers")}>
              تنبيه المزوّدين
            </NotifyBtn>
          </div>
        ) : null}
      </div>
      <DataTable columns={cols} data={d?.rows} getRowId={(r) => r.provider} loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} gap={0} edge={12} headRadius={10} rowPadY={10} rowClassName="border-divider" skeletonRows={4} />
    </section>
  );
}

function NotifyBtn({ icon, onClick, children }: { icon: UiGlyph; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[42px] items-center gap-1.5 rounded-12 border border-border bg-white px-3.5 text-14 font-medium text-ink hover:bg-surface-1">
      <Icon name={icon} size={16} />
      {children}
    </button>
  );
}

// بطاقة رقم (CON5-04 · KPIs): بيضا r16 · حشو 16 · مسافة 6 · العنوان 14 Medium + أيقونة 32 · الرقم 26 SemiBold
function Kpi({ label, icon, value }: { label: string; icon: UiGlyph; value: number | undefined }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-16 bg-white p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-14 font-medium text-ink">{label}</h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {value == null ? <Skeleton className="my-2 h-[30px] w-16" /> : <p className="num text-[26px] leading-[44px] font-semibold text-ink">{num(value)}</p>}
    </section>
  );
}
