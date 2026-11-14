"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  Cell,
  ExportBtn,
  FinKpi,
  Head2,
  Pill,
  RoundBtn,
  StartCell,
} from "@/components/finance/bits";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { KpiRow } from "@/components/panel/Kpi";
import { EmptyState, PageHead } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import {
  CLAIM_STATUS,
  type ClaimRow,
  type DueRow,
  type DuesTab,
  type TransferRow,
  type Two,
} from "@/lib/api/dues";
import { useUrlState } from "@/lib/use-url-state";
import { ClaimDrawer, StatementDrawer, TransferDrawer } from "./DuesDrawers";
import { DuesModals } from "./DuesModals";

// CON5-14 · مستحقات المزوّدين (3114:71708) · التحويلات (3114:71988) · المطالبات المالية (3114:74438) · بعد اعتماد CL-2026-0010 (3114:74638)
// الرابط: /dues?tab=transfers|claims · كشف المزوّد ?provider=<lk-…> (CON5-14D كشف) · ?transfer=TRF-… (CON5-14D) · ?claim=CL-… (CON5-14C)
// · ?modal=preview (معاينة دفعة 1 نوفمبر) | deduction&provider= (إضافة خصم أو تسوية) | transfer&provider= (تحويل …) | claim-edit|claim-reject&claim= · ?modal=export
// مدخل الصفحة: بطاقة «مستحقات اليوم» وتنبيه المطالبات في الرئيسية، و«كشف جونسون · أكتوبر» في درج الحجز (?provider=lk-jn-001&period=2026-10).
// ملاحظات Figma: سطور البطاقات أطول من البطاقة (النص بيخرج براها) → سطر واحد بـ«…» · جدول المستحقات auto-layout (عمود المزوّد «fill»)
// فالصفوف اللي فيها زر «تحويل» بتزق الأعمدة — متطبّق زي ما هو (جدول flex مش DataTable).
const TABS: { key: DuesTab; label: string }[] = [
  { key: "dues", label: "مستحقات أكتوبر" },
  { key: "claims", label: "المطالبات المالية" },
  { key: "transfers", label: "التحويلات" },
];
const FOOT = "text-12 leading-5 font-light text-muted";

export function DuesView() {
  const url = useUrlState();
  const raw = url.get("tab");
  const tab: DuesTab = raw === "transfers" || raw === "claims" ? raw : "dues";
  const kpis = useQuery({
    queryKey: ["dues", "kpis"],
    queryFn: () => api.dues.kpis(),
  });
  const counts = useQuery({
    queryKey: ["dues", "counts"],
    queryFn: () => api.dues.counts(),
  });
  const k = kpis.data;

  return (
    <>
      <PageHead
        title="مستحقات المزوّدين"
        description="ما تحوّله لينكار لكل مقدّم خدمة عن الحجوزات المنفّذة بسعر التكلفة المتفق عليه، بعد أي خصم."
        actions={
          <>
            <ExportBtn onClick={() => url.push({ modal: "export" })} />
            <button
              type="button"
              onClick={() => url.push({ modal: "preview" })}
              className="flex h-11 items-center gap-1.5 rounded-12 bg-lime px-4 text-14 font-medium text-ink hover:bg-lime/85"
            >
              معاينة دفعة 1 نوفمبر 2026
              <Icon name="calendar" size={16} />
            </button>
          </>
        }
      />
      <KpiRow>
        <FinKpi
          label="مستحق أكتوبر · يُحوَّل 1 نوفمبر 2026"
          icon="calendar"
          value={k?.due.value}
          hint={k?.due.hint}
          hintClassName="text-muted"
          loading={kpis.isLoading}
        />
        <FinKpi
          label="آخر دفعة تحويل"
          icon="card"
          value={k?.last.value}
          hint={k?.last.hint}
          hintClassName="text-muted"
          loading={kpis.isLoading}
        />
        <FinKpi
          label="خصومات أكتوبر"
          icon="alert"
          value={k?.deductions.value}
          hint={k?.deductions.hint}
          hintClassName="text-warning"
          loading={kpis.isLoading}
        />
        <FinKpi
          label="حسابات بانتظار التحقق"
          icon="clock"
          value={k?.pending.value}
          hint={k?.pending.hint}
          hintClassName="text-warning"
          loading={kpis.isLoading}
        />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-12 bg-lime-tint px-4 py-3">
        <p className="min-w-0 flex-1 text-13 leading-[21px] font-normal text-ink">
          دفعة 1 نوفمبر 2026 · الدورة التالية 1 – 15 نوفمبر 2026 تُحوَّل 16 نوفمبر
          2026
        </p>
        <Link
          href="/system/policies"
          className="flex items-center gap-2.5 text-13 leading-[21px] font-semibold text-success hover:underline"
        >
          إعدادات التسوية
          <Icon name="calendar" size={16} className="text-ink" />
        </Link>
      </div>
      <section className="flex flex-col gap-3.5 rounded-16 bg-white px-4 pt-5 pb-4 sm:px-5">
        <Tabs3
          tab={tab}
          counts={counts.data}
          onChange={(t) => url.replace({ tab: t === "dues" ? null : t })}
        />
        {tab === "dues" ? (
          <DuesTable />
        ) : tab === "transfers" ? (
          <TransfersTable />
        ) : (
          <ClaimsTable />
        )}
      </section>
      <StatementDrawer />
      <TransferDrawer />
      <ClaimDrawer />
      <DuesModals />
      <ExportModal
        open={url.get("modal") === "export"}
        onOpenChange={(o) => !o && url.replace({ modal: null })}
        module="dues"
        tab={tab}
      />
    </>
  );
}

function Tabs3({
  tab,
  counts,
  onChange,
}: {
  tab: DuesTab;
  counts?: Record<DuesTab, number>;
  onChange: (t: DuesTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="مستحقات المزوّدين"
      className="flex items-center gap-2 max-md:overflow-x-auto max-md:pb-1 [&>*]:shrink-0"
    >
      {TABS.map((t) => {
        const on = t.key === tab;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={`flex h-10 items-center gap-1.5 rounded-10 px-3.5 text-14 ${on ? "bg-ink font-semibold text-white" : "border border-border bg-white font-medium text-ink hover:bg-surface-1"}`}
          >
            <span>{t.label}</span>
            {counts ? (
              <span
                className={`num inline-flex h-5 min-w-[21px] items-center justify-center rounded-full px-[7px] text-12 font-semibold ${on ? "bg-lime text-ink" : "bg-surface-2 text-ink"}`}
              >
                {counts[t.key]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function TwoLine({ v, strong }: { v: Two; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-13 leading-5 text-ink ${strong || v.sub ? "font-semibold" : "font-normal"}`}
      >
        {v.main}
      </span>
      {v.sub ? (
        <span className="text-12 leading-[18px] font-light text-muted">
          {v.sub}
        </span>
      ) : null}
    </div>
  );
}

// ───────────── مستحقات أكتوبر (جدول flex زي auto-layout في Figma) ─────────────
const W = {
  bookings: 100,
  cost: 110,
  ded: 110,
  net: 100,
  account: 150,
  status: 120,
};
function DuesTable() {
  const url = useUrlState();
  const q = useQuery({
    queryKey: ["dues", "list"],
    queryFn: () => api.dues.list(),
  });
  const open = (r: DueRow) => url.push({ provider: r.providerId });
  const transfer = (r: DueRow) =>
    url.push({ modal: "transfer", provider: r.providerId });
  const head = (
    <div className="flex items-center rounded-10 bg-surface-1 px-3 py-[9px] text-12 leading-5 font-medium text-muted">
      <span className="min-w-0 flex-1">مقدّم الخدمة</span>
      <span style={{ width: W.bookings }}>حجوزات منفّذة</span>
      <span style={{ width: W.cost }}>
        <Head2 a="بسعر التكلفة" b="شامل الضريبة" />
      </span>
      <span style={{ width: W.ded }}>الخصومات</span>
      <span style={{ width: W.net }}>
        <Head2 a="الصافي" b="شامل الضريبة" />
      </span>
      <span style={{ width: W.account }}>حساب التحويل</span>
      <span style={{ width: W.status }}>الحالة</span>
    </div>
  );
  const actions = (r: DueRow) => (
    <div
      className="flex shrink-0 items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <RoundBtn
        label={`كشف ${r.name}`}
        onClick={() => open(r)}
        className="rounded-8!"
      />
      {r.canTransfer ? (
        <button
          type="button"
          onClick={() => transfer(r)}
          className="h-6 rounded-full bg-ink px-2.5 text-12 leading-[18px] font-medium text-white hover:bg-ink/90"
        >
          تحويل
        </button>
      ) : null}
    </div>
  );
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[1040px]">
          {head}
          {q.isLoading ? (
            Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="my-4 h-8 w-full" />
            ))
          ) : q.isError ? (
            <EmptyState
              title="تعذّر تحميل البيانات"
              body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
              action={
                <Button
                  variant="secondary"
                  size="S"
                  onClick={() => q.refetch()}
                >
                  إعادة المحاولة
                </Button>
              }
            />
          ) : !q.data?.items.length ? (
            <EmptyState title="لا توجد مستحقات بعد" />
          ) : (
            q.data.items.map((r) => (
              <div
                key={r.providerId}
                role="button"
                tabIndex={0}
                aria-label={`كشف ${r.name}`}
                onClick={() => open(r)}
                onKeyDown={(e) =>
                  e.key === "Enter" && e.target === e.currentTarget && open(r)
                }
                className="flex cursor-pointer items-center border-b border-divider p-3 hover:bg-surface-1/60 focus-visible:bg-surface-1"
              >
                <div className="min-w-0 flex-1">
                  <TwoLine v={{ main: r.name, sub: r.sub }} strong />
                </div>
                <Cell className="shrink-0">
                  <span className="block" style={{ width: W.bookings }}>
                    {r.bookings}
                  </span>
                </Cell>
                <Cell className="shrink-0">
                  <span className="block" style={{ width: W.cost }}>
                    {r.cost}
                  </span>
                </Cell>
                <div className="shrink-0" style={{ width: W.ded }}>
                  <TwoLine v={r.deductions} />
                </div>
                <Cell className="shrink-0">
                  <span className="block" style={{ width: W.net }}>
                    {r.net}
                  </span>
                </Cell>
                <div className="shrink-0" style={{ width: W.account }}>
                  <TwoLine v={r.account} strong />
                </div>
                <div className="shrink-0" style={{ width: W.status }}>
                  <Pill tone={r.tone}>{r.status}</Pill>
                </div>
                {actions(r)}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 md:hidden">
        {q.isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-12" />
            ))
          : q.data?.items.map((r) => (
              <div
                key={r.providerId}
                role="button"
                tabIndex={0}
                onClick={() => open(r)}
                className="flex flex-col gap-2.5 rounded-12 border border-border bg-white p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <TwoLine v={{ main: r.name, sub: r.sub }} strong />
                  <Pill tone={r.tone}>{r.status}</Pill>
                </div>
                <dl className="flex flex-col gap-1.5 border-t border-divider pt-2.5 text-13">
                  <MRow k="حجوزات منفّذة">{r.bookings}</MRow>
                  <MRow k="بسعر التكلفة · شامل الضريبة">{r.cost}</MRow>
                  <MRow k="الخصومات">
                    {r.deductions.sub
                      ? `${r.deductions.main} · ${r.deductions.sub}`
                      : r.deductions.main}
                  </MRow>
                  <MRow k="الصافي · شامل الضريبة">{r.net}</MRow>
                  <MRow k="حساب التحويل">
                    {r.account.sub
                      ? `${r.account.main} · ${r.account.sub}`
                      : r.account.main}
                  </MRow>
                </dl>
                <div className="flex justify-end border-t border-divider pt-2.5">
                  {actions(r)}
                </div>
              </div>
            ))}
      </div>
      <p className={FOOT}>عرض 1–8 من 21 مقدّم خدمة</p>
    </>
  );
}

function MRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 font-light text-muted">{k}</dt>
      <dd className="min-w-0 text-end font-light text-ink">{children}</dd>
    </div>
  );
}

const TABLE = {
  gap: 0,
  edge: 12,
  headRadius: 10 as const,
  rowPadY: 12,
  rowClassName: "border-divider",
};

// ───────────── التحويلات ─────────────
function TransfersTable() {
  const url = useUrlState();
  const q = useQuery({
    queryKey: ["dues", "transfers"],
    queryFn: () => api.dues.transfers(),
  });
  const cols = useMemo<Column<TransferRow>[]>(
    () => [
      {
        id: "id",
        header: "رقم التحويل",
        width: 150,
        cell: (r) => <Cell>{r.id}</Cell>,
      },
      {
        id: "provider",
        header: "مقدّم الخدمة",
        width: 232,
        cell: (r) => <Cell>{r.provider}</Cell>,
      },
      {
        id: "period",
        header: "عن فترة",
        width: 110,
        cell: (r) => <Cell>{r.period}</Cell>,
      },
      {
        id: "bookings",
        header: "الحجوزات",
        width: 80,
        cell: (r) => <Cell>{r.bookings}</Cell>,
      },
      {
        id: "amount",
        header: <Head2 a="المبلغ" b="شامل الضريبة" />,
        width: 100,
        cell: (r) => <Cell>{r.amount}</Cell>,
      },
      {
        id: "account",
        header: "الحساب",
        width: 150,
        cell: (r) => <Cell>{r.account}</Cell>,
      },
      {
        id: "date",
        header: "تاريخ التحويل",
        width: 130,
        cell: (r) => <Cell>{r.date}</Cell>,
      },
      {
        id: "status",
        header: "الحالة",
        width: 80,
        cell: (r) => <Pill tone="success">{r.status}</Pill>,
      },
      {
        id: "actions",
        header: " ",
        width: 40,
        actions: true,
        cell: (r) => (
          <StartCell width={40}>
            <RoundBtn
              label={`تفاصيل ${r.id}`}
              onClick={() => url.push({ transfer: r.id })}
              className="rounded-8!"
            />
          </StartCell>
        ),
      },
    ],
    [url],
  );
  return (
    <>
      <DataTable
        columns={cols}
        data={q.data?.items}
        getRowId={(r) => r.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={{ title: "لا توجد تحويلات بعد" }}
        onRowClick={(r) => url.push({ transfer: r.id })}
        rowLabel={(r) => `تفاصيل ${r.id}`}
        skeletonRows={7}
        {...TABLE}
      />
      <p className={FOOT}>عرض 1–7 من {q.data?.total ?? 42} تحويلاً</p>
    </>
  );
}

// ───────────── المطالبات المالية ─────────────
const HAS_DRAWER = ["CL-2026-0010", "CL-2026-0013"];
function ClaimsTable() {
  const url = useUrlState();
  const q = useQuery({
    queryKey: ["dues", "claims"],
    queryFn: () => api.dues.claims(),
  });
  const cols = useMemo<Column<ClaimRow>[]>(() => {
    const act = (r: ClaimRow) => {
      if (r.status === "transferred")
        return (
          <span className="text-13 leading-5 font-normal text-muted">
            {r.transfer}
          </span>
        );
      if (r.status === "approved")
        return (
          <button
            type="button"
            onClick={() =>
              url.push({ modal: "transfer", provider: r.providerId })
            }
            className="flex h-11 items-center rounded-12 bg-ink px-4 text-14 font-medium text-white hover:bg-ink/90"
          >
            تحويل
          </button>
        );
      if (r.status === "review")
        return (
          <button
            type="button"
            onClick={() => url.push({ claim: r.id })}
            className="flex h-[46px] items-center rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1"
          >
            مراجعة
          </button>
        );
      return null;
    };
    return [
      {
        id: "id",
        header: "رقم المطالبة",
        width: 130,
        cell: (r) => <Cell>{r.id}</Cell>,
      },
      {
        id: "provider",
        header: "مقدّم الخدمة",
        width: 72,
        cell: (r) => <TwoLine v={{ main: r.provider, sub: r.code }} strong />,
      },
      {
        id: "scope",
        header: "النطاق",
        width: 100,
        cell: (r) => <Cell>{r.scope}</Cell>,
      },
      {
        id: "date",
        header: "تاريخ الرفع",
        width: 140,
        cell: (r) => <Cell>{r.date}</Cell>,
      },
      {
        id: "bookings",
        header: "الحجوزات",
        width: 80,
        cell: (r) => <Cell>{r.bookings}</Cell>,
      },
      {
        id: "amount",
        header: <Head2 a="المبلغ" b="شامل الضريبة" />,
        width: 110,
        cell: (r) => <Cell>{r.amount}</Cell>,
      },
      {
        id: "invoice",
        header: "الفاتورة",
        width: 150,
        cell: (r) => <Cell>{r.invoice}</Cell>,
      },
      {
        id: "status",
        header: "الحالة",
        width: 170,
        cell: (r) => (
          <Pill tone={CLAIM_STATUS[r.status].tone}>
            {CLAIM_STATUS[r.status].label}
          </Pill>
        ),
      },
      {
        id: "actions",
        header: " ",
        width: 120,
        actions: true,
        cell: (r) => <StartCell width={120}>{act(r)}</StartCell>,
      },
    ];
  }, [url]);
  const rowClick = (r: ClaimRow) => {
    if (HAS_DRAWER.includes(r.id) && r.status !== "transferred")
      url.push({ claim: r.id });
    else if (r.status === "approved")
      url.push({ modal: "transfer", provider: r.providerId });
    else if (r.transfer) url.push({ transfer: r.transfer });
  };
  return (
    <>
      <p className={FOOT}>عرض 5 مطالبات · الأحدث أولاً</p>
      <DataTable
        columns={cols}
        data={q.data?.items}
        getRowId={(r) => r.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={{ title: "لا توجد مطالبات" }}
        onRowClick={rowClick}
        rowLabel={(r) => `المطالبة ${r.id}`}
        skeletonRows={5}
        {...TABLE}
      />
    </>
  );
}
