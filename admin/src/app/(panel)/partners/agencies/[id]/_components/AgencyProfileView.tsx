"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { SearchInput } from "@/components/panel/FilterBar";
import { EmptyState } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { PurchaseOrder } from "@/lib/api/agencies";
import type { AgencyProfile, Branch, Member, ProfileStatement } from "@/lib/api/agency-profile";
import type { Voucher } from "@/lib/api/agency-vouchers";
import { useUrlState } from "@/lib/use-url-state";
import { AgencyModals } from "../../_components/AgencyModals";
import { APill, DKV, InfoBtn, KpiS, RowBtn } from "../../_components/bits";
import { DecisionModals } from "../../_components/DecisionModals";
import { PoDrawer } from "../../_components/PoDrawer";
import { DqDrawer } from "../../_components/RequestDrawers";
import { StatementDrawer } from "../../_components/StatementDrawer";
import { VoucherDrawer } from "../../_components/VoucherDrawer";
import { ProfileModals } from "./ProfileModals";

// CON5-09P · الريادة للسيارات — ملف الوكالة /partners/agencies/<DL>?tab=…
//   نظرة عامة (3114:4312) · طلبات الشراء (4460) · القسائم والعملاء (4762 · &seg=expiring 5129 · &seg=used 5462)
//   · الفروع والفريق (5737) · الكشوف والمدفوعات (5973) · طلبات التعديل (6157)
// رأس الملف: تعديل الحد (ag-limit) · تسجيل سداد (ag-pay على الكشف المستحق) · إجراءات (CON5-09A · ag-actions)
type Tab = "overview" | "orders" | "vouchers" | "branches" | "statements" | "requests";
const TABS: Tab[] = ["overview", "orders", "vouchers", "branches", "statements", "requests"];
const PILL_TONE = { success: "success", neutral: "neutral", warning: "pending" } as const;
const opts = (l: string[]) => l.map((x) => ({ value: x, label: x }));
/** خلية سطرين في جداول الملف: 13 Medium + 12 Light رمادي */
const Two = ({ a, b }: { a: ReactNode; b?: ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-13 leading-[22px] font-medium text-ink">{a}</span>
    {b ? <span className="text-12 leading-5 font-light text-muted">{b}</span> : null}
  </div>
);
const WARN = "inline-flex h-[22px] shrink-0 items-center rounded-8 bg-warning-tint px-2 text-12 font-medium whitespace-nowrap text-[#9a6b00]";

export function AgencyProfileView({ id }: { id: string }) {
  const url = useUrlState();
  const t = url.get("tab") as Tab | null;
  const tab: Tab = t && TABS.includes(t) ? t : "overview";
  const q = useQuery({ queryKey: ["agencies", "profile", id], queryFn: () => api.agencyProfile.get(id), retry: false });
  const pend = useQuery({ queryKey: ["agencies", "pending"], queryFn: () => api.agencyExtra.pending() });
  const p = q.data?.profile;
  const reqCount = pend.data?.items.filter((x) => x.agencyId === id).length ?? p?.counts.requests;

  if (q.isError)
    return (
      <EmptyState
        title="تعذّر تحميل ملف الوكالة"
        body="تأكد من رقم الوكالة أو حاول مرة أخرى."
        action={
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );

  return (
    <>
      <nav aria-label="مسار الصفحة" className="flex items-center gap-1.5 text-13 leading-[22px] font-medium">
        <Link href="/partners/agencies" className="text-muted hover:text-ink">
          الوكالات
        </Link>
        <Icon name="chevron-left" size={14} className="text-muted" />
        <span className="text-ink">{p?.name ?? "…"}</span>
      </nav>
      {p ? <Head p={p} reqCount={reqCount ?? 0} /> : <Skeleton className="h-[132px] w-full rounded-16" />}
      <section className="flex flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs
          variant="pill"
          label="أقسام ملف الوكالة"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "overview" ? null : k, seg: null, q: null, st: null, br: null, rep: null, pv: null })}
          items={[
            { key: "overview", label: "نظرة عامة" },
            { key: "orders", label: "طلبات الشراء", count: p?.counts.orders },
            { key: "vouchers", label: "القسائم والعملاء", count: p?.counts.vouchers },
            { key: "branches", label: "الفروع والفريق", count: p?.counts.branches },
            { key: "statements", label: "الكشوف والمدفوعات", count: p?.counts.statements },
            { key: "requests", label: "طلبات التعديل", count: reqCount },
          ]}
        />
        {!p ? (
          <Skeleton className="h-[400px] w-full rounded-16" />
        ) : tab === "overview" ? (
          <Overview p={p} />
        ) : tab === "orders" ? (
          <Orders id={id} />
        ) : tab === "vouchers" ? (
          <Vouchers id={id} />
        ) : tab === "branches" ? (
          <Branches p={p} />
        ) : tab === "statements" ? (
          <Statements p={p} />
        ) : (
          <Requests id={id} />
        )}
      </section>
      <PoDrawer />
      <StatementDrawer />
      <VoucherDrawer />
      <DqDrawer />
      <DecisionModals />
      <AgencyModals />
      {p ? <ProfileModals p={p} /> : null}
    </>
  );
}

// ───────────── رأس الملف ─────────────
function Head({ p, reqCount }: { p: AgencyProfile; reqCount: number }) {
  const url = useUrlState();
  const due = p.statements.find((s) => s.state === "due");
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-16 border border-border bg-white p-5">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-14 bg-lime text-ink">
        <Icon name="car" size={28} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-24 leading-[38px] font-bold text-ink">
          {p.name} · {p.id}
        </h1>
        <p className="text-13 leading-[22px] font-light text-muted">{p.line}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {p.pills.map((x) =>
            x.tone === "warning" ? (
              reqCount ? (
                <span key={x.label} className={WARN}>
                  {reqCount === 1 ? "طلب تعديل واحد" : reqCount === 2 ? "طلبا تعديل" : `${reqCount} طلبات تعديل`}
                </span>
              ) : null
            ) : (
              <APill key={x.label} tone={PILL_TONE[x.tone]}>
                {x.label}
              </APill>
            ),
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button onClick={() => url.push({ modal: "ag-limit", ref: p.id })}>تعديل الحد</Button>
        {due?.id ? (
          <Button variant="secondary" className="h-[50px]!" icon={<Icon name="receipt" size={18} />} onClick={() => url.push({ modal: "ag-pay", ref: due.id! })}>
            تسجيل سداد
          </Button>
        ) : null}
        <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "ag-actions", ref: p.id })}>
          إجراءات
          <Icon name="chevron-down" size={18} />
        </Button>
      </div>
    </section>
  );
}

// ───────────── نظرة عامة (3114:4312) ─────────────
function InfoCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-16 border border-border bg-white px-5 pt-5 pb-[18px]">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] leading-7 font-bold text-ink">{title}</h2>
        {sub ? <p className="text-13 leading-5 font-light text-muted">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Overview({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {p.kpis.map((k) => (
          <KpiS key={k.label} {...k} />
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <InfoCard title="بيانات الوكالة" sub="موثّقة">
          <div className="flex flex-col gap-3">
            {p.data.map((x) => (
              <DKV key={x.k} k={x.k} pad>
                {x.v}
              </DKV>
            ))}
          </div>
        </InfoCard>
        <InfoCard title="الترتيب المالي" sub="ائتمان شهري · صافي 30 يوماً">
          <div className="flex flex-col gap-3">
            {p.finance.map((x) => (
              <DKV key={x.k} k={x.k} pad>
                {x.v}
              </DKV>
            ))}
          </div>
        </InfoCard>
      </div>
      <InfoCard title="آخر النشاط">
        <ul className="flex flex-col gap-3">
          {p.activity.map((x) => (
            <li key={x.text} className="flex items-center gap-3 border-b border-divider py-2.5">
              <span className="min-w-0 flex-1 text-13 leading-[22px] font-medium text-ink">{x.text}</span>
              <span className="shrink-0 text-12 leading-5 font-light text-muted">{x.date}</span>
              <InfoBtn label="التفاصيل" onClick={() => url.push(x.open)} />
            </li>
          ))}
        </ul>
      </InfoCard>
    </>
  );
}

const BRANCHES = ["الكل", "جدة · التحلية", "جدة · الشاطئ", "الرياض · العليا", "الرياض · الملقا"];

// ───────────── طلبات الشراء (3114:4460) ─────────────
function Orders({ id }: { id: string }) {
  const url = useUrlState();
  const search = url.get("q") ?? "";
  const br = url.get("br") ?? "الكل";
  const rep = url.get("rep") ?? "الكل";
  const st = url.get("st") ?? "الكل";
  const q = useQuery({ queryKey: ["agencies", "ordersOf", id], queryFn: () => api.agencies.ordersOf(id) });
  const all = useMemo(() => [...(q.data ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [q.data]);
  const reps = useMemo(() => ["الكل", ...new Set(all.map((o) => o.branchRep?.split(" · ")[2]).filter(Boolean) as string[])], [all]);
  const rows = all.filter(
    (o) =>
      (!search.trim() || o.id.includes(search.trim()) || !!o.list?.some((v) => v.customer.includes(search.trim()))) &&
      (br === "الكل" || o.branchRep?.startsWith(br)) &&
      (rep === "الكل" || o.branchRep?.endsWith(rep)) &&
      (st === "الكل" || (st === "نشط" ? o.list?.some((v) => !v.used) : !o.list?.some((v) => !v.used))),
  );
  const filtered = !!search || br !== "الكل" || rep !== "الكل" || st !== "الكل";
  const columns = useMemo<Column<PurchaseOrder>[]>(
    () => [
      { id: "id", header: "الطلب", width: 170, cell: (o) => <Two a={o.id} b={o.dateLabel} /> },
      { id: "svc", header: "الباقة وموقع الخدمة", width: 228, cell: (o) => <Two a={o.service} b={o.hero.sub} /> },
      { id: "rep", header: "فرع الوكالة والمندوب", width: 160, cell: (o) => <Two a={o.branchRep?.split(" · ").slice(0, 2).join(" · ")} b={o.branchRep?.split(" · ")[2]} /> },
      { id: "v", header: "القسائم", width: 100, cell: (o) => <Two a={o.vouchers === 1 ? "قسيمة واحدة" : `‏${o.vouchers} قسائم`} b={`‏${o.list?.filter((x) => x.used).length ?? 0} مستخدمة`} /> },
      {
        id: "val",
        header: (
          <>
            القيمة · ر.س
            <br />
            شامل الضريبة
          </>
        ),
        width: 90,
        cell: (o) => o.value.toLocaleString("en-US"),
      },
      { id: "inv", header: "الفاتورة", width: 140, cell: (o) => <Two a={o.payment?.includes("INV-") ? o.payment.split(" · ")[1] : "فاتورة أكتوبر"} b={o.payment?.includes("INV-") ? "مستحقة" : "لم تصدر"} /> },
      { id: "st", header: "الحالة", width: 70, cell: (o) => (o.list?.some((x) => !x.used) ? <APill tone="success">نشط</APill> : <APill tone="neutral">مكتمل</APill>) },
      { id: "a", header: " ", width: 48, actions: true, cell: (o) => <span className="flex w-full justify-start"><InfoBtn label={`تفاصيل ${o.id}`} onClick={() => url.push({ po: o.id })} /></span> },
    ],
    [url],
  );
  const set = (x: Record<string, string | null>) => url.replace(x);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={(v) => set({ q: v || null })} placeholder="ابحث برقم الطلب أو اسم العميل" />
        <Select variant="filter" label="الحالة" value={st} onChange={(v) => set({ st: v === "الكل" ? null : v })} options={opts(["الكل", "نشط", "مكتمل"])} />
        <Select variant="filter" label="فرع الوكالة" value={br} onChange={(v) => set({ br: v === "الكل" ? null : v })} options={opts(BRANCHES)} />
        <Select variant="filter" label="المندوب" value={rep} onChange={(v) => set({ rep: v === "الكل" ? null : v })} options={opts(reps)} />
      </div>
      <DataTable
        columns={columns}
        data={q.isLoading ? undefined : rows.slice(0, 8)}
        getRowId={(o) => o.id}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => set({ q: null, br: null, rep: null, st: null })}
        empty={{ title: "لا توجد طلبات شراء بعد" }}
        onRowClick={(o) => url.push({ po: o.id })}
        rowLabel={(o) => o.id}
      />
      {q.data ? <p className="text-12 leading-5 font-light text-muted">{filtered ? `${rows.length} من 22 طلباً` : `عرض ${Math.min(8, rows.length)} من 22 طلباً · الأحدث أولاً`}</p> : null}
    </>
  );
}

// ───────────── القسائم والعملاء (3114:4762 · 5129 · 5462) ─────────────
type Seg = "all" | "expiring" | "used";
function Vouchers({ id }: { id: string }) {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const s = url.get("seg");
  const seg: Seg = s === "expiring" || s === "used" ? s : "all";
  const search = url.get("q") ?? "";
  const br = url.get("br") ?? "الكل";
  const pv = url.get("pv") ?? "الكل";
  const q = useQuery({ queryKey: ["agencies", "vouchersOf", id, seg], queryFn: () => api.agencyVouchers.ofAgency(id, seg) });
  const remind = useMutation({
    mutationFn: (k: string) => api.agencyVouchers.remind(k),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("تذكير", r.toast);
    },
  });
  const providers = useMemo(() => ["الكل", ...new Set((q.data?.items ?? []).map((v) => v.center.replace("‏", "").split(" · ")[0]))], [q.data]);
  const rows = (q.data?.items ?? []).filter(
    (v) => (!search.trim() || v.code.includes(search.trim()) || v.customer.includes(search.trim()) || !!v.booking?.includes(search.trim())) && (br === "الكل" || v.rep.startsWith(br)) && (pv === "الكل" || v.center.includes(pv)),
  );
  const shown = seg === "all" ? rows.slice(0, 10) : rows.slice(0, 8);
  const filtered = !!search || br !== "الكل" || pv !== "الكل";
  const c = q.data?.counts;
  const columns = useMemo<Column<Voucher>[]>(() => {
    const base: Column<Voucher>[] = [
      { id: "code", header: "القسيمة", width: 140, cell: (v) => <Two a={v.code} b={v.booking ?? "—"} /> },
      { id: "cust", header: "العميل", width: 140, cell: (v) => <Two a={<span className="font-semibold">{v.customer}</span>} b={<bdi>{v.phone}</bdi>} /> },
      { id: "svc", header: "الباقة وموقع الخدمة", width: seg === "used" ? 358 : seg === "expiring" ? 192 : 258, cell: (v) => <Two a={v.title} b={v.center} /> },
      { id: "po", header: "الطلب وفرع الوكالة", width: 170, cell: (v) => <Two a={v.po} b={v.rep} /> },
    ];
    if (seg === "used")
      return [
        ...base,
        {
          id: "use",
          header: "الاستخدام",
          width: 170,
          cell: (v) => (
            <div className="flex flex-col items-start gap-0.5">
              <APill tone="success">مستخدمة</APill>
              <span className="text-12 leading-5 font-light text-muted">{v.usage ? `${v.usage.date} · ${v.usage.branch.replace("‏", "")}` : ""}</span>
            </div>
          ),
        },
        { id: "a", header: " ", width: 44, actions: true, cell: (v) => <span className="flex w-full justify-start"><InfoBtn label={`قسيمة ${v.code}`} onClick={() => url.push({ voucher: v.key })} /></span> },
      ];
    return [
      ...base,
      { id: "msg", header: "الرسالة", width: 110, cell: (v) => (v.message.startsWith("أُرسلت") ? <Two a="أُرسلت" b={v.message.split(" · ")[1]} /> : <span className="text-13 font-medium">{v.message}</span>) },
      {
        id: "st",
        header: "الحالة",
        width: 150,
        cell: (v) => (
          <div className="flex flex-col items-start gap-0.5">
            {v.state === "used" ? <APill tone="success">مستخدمة</APill> : v.state === "cancelled" ? <APill tone="danger">ملغاة</APill> : <span className={WARN}>{v.state === "expiring" ? "تنتهي قريباً" : "بانتظار الزيارة"}</span>}
            <span className="text-12 leading-5 font-light text-muted">{v.state === "used" && v.usage ? v.usage.date : `حتى ${v.validUntil.split(" · ")[0]}`}</span>
          </div>
        ),
      },
      {
        id: "a",
        header: " ",
        width: seg === "expiring" ? 110 : 48,
        actions: true,
        cell: (v) => (
          <span className="flex w-full justify-start gap-1.5">
            <InfoBtn label={`قسيمة ${v.code}`} onClick={() => url.push({ voucher: v.key })} />
            {v.state === "expiring" ? (
              <RowBtn onClick={() => remind.mutate(v.key)} loading={remind.isPending && remind.variables === v.key}>
                تذكير
              </RowBtn>
            ) : null}
          </span>
        ),
      },
    ];
  }, [seg, url, remind]);
  const SEGS: { k: Seg; label: string; n?: number }[] = [
    { k: "all", label: "الكل", n: c?.all },
    { k: "expiring", label: "تنتهي خلال 30 يوماً", n: c?.expiring },
    { k: "used", label: "مستخدمة", n: c?.used },
  ];
  const total = seg === "all" ? c?.all : seg === "expiring" ? c?.expiring : c?.used;
  return (
    <>
      <div role="tablist" aria-label="حالة القسيمة" className="flex flex-wrap items-center gap-2">
        {SEGS.map((x) => {
          const on = x.k === seg;
          return (
            <button
              key={x.k}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => url.replace({ seg: x.k === "all" ? null : x.k })}
              className={`flex h-[38px] items-center gap-1.5 rounded-full px-3 text-13 whitespace-nowrap ${on ? "bg-ink font-semibold text-white" : "border border-border bg-white font-medium text-ink hover:bg-surface-1"}`}
            >
              {x.label}
              {x.n != null ? <span className={`num inline-flex h-5 min-w-[21px] items-center justify-center rounded-full px-[7px] text-12 font-medium ${on ? "bg-lime text-ink" : "bg-surface-2 text-ink"}`}>{x.n}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={(v) => url.replace({ q: v || null })} placeholder="ابحث بالقسيمة أو العميل" />
        <Select variant="filter" label="فرع الوكالة" value={br} onChange={(v) => url.replace({ br: v === "الكل" ? null : v })} options={opts(BRANCHES)} />
        <Select variant="filter" label="مقدّم الخدمة" value={pv} onChange={(v) => url.replace({ pv: v === "الكل" ? null : v })} options={opts(providers)} />
      </div>
      <DataTable
        columns={columns}
        data={q.isLoading ? undefined : shown}
        getRowId={(v) => v.key}
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        filtered={filtered}
        onClearFilters={() => url.replace({ q: null, br: null, pv: null })}
        empty={{ title: seg === "expiring" ? "لا توجد قسائم تنتهي خلال 30 يوماً" : "لا توجد قسائم" }}
        onRowClick={(v) => url.push({ voucher: v.key })}
        rowLabel={(v) => `${v.code} · ${v.customer}`}
        rowPadY={11}
      />
      {q.data && shown.length ? (
        <p className="text-12 leading-5 font-light text-muted">
          {seg === "all"
            ? `عرض ${shown.length} من ${total} قسيمة · الأحدث إصداراً أولاً`
            : seg === "expiring"
              ? `عرض ${shown.length} من ${total} قسائم · الأقرب انتهاءً أولاً`
              : `عرض ${shown.length} من ${total} قسيمة مستخدمة · الأحدث استخداماً أولاً`}
        </p>
      ) : null}
    </>
  );
}

// ───────────── الفروع والفريق (3114:5737) ─────────────
function SectionHead({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-16 leading-[26px] font-bold text-ink">{title}</h2>
        <p className="text-12 leading-5 font-light text-muted">{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Branches({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const bcols = useMemo<Column<Branch>[]>(
    () => [
      { id: "n", header: "الفرع", width: 432, cell: (b) => <Two a={b.name} b={b.address} /> },
      { id: "ph", header: "الهاتف", width: 130, cell: (b) => <bdi className="font-medium">{b.phone}</bdi> },
      { id: "m", header: "مدير الفرع", width: 150, cell: (b) => <span className={b.manager === "بدون مدير" ? "text-muted" : "font-medium"}>{b.manager}</span> },
      { id: "t", header: "الفريق", width: 120, cell: (b) => <span className="font-medium">{b.team}</span> },
      { id: "o", header: "طلبات أكتوبر", width: 110, cell: (b) => <span className="num font-medium">{b.orders}</span> },
      { id: "s", header: "الحالة", width: 80, cell: () => <APill tone="success">نشط</APill> },
    ],
    [],
  );
  const mcols = useMemo<Column<Member>[]>(
    () => [
      { id: "n", header: "العضو", width: 472, cell: (m) => <Two a={m.name} b={<bdi>{m.phone}</bdi>} /> },
      { id: "r", header: "الدور", width: 200, cell: (m) => <span className="font-medium">{m.role}</span> },
      { id: "b", header: "الفرع", width: 140, cell: (m) => <span className="font-medium">{m.branch}</span> },
      { id: "o", header: "طلبات أكتوبر", width: 110, cell: (m) => <span className="num font-medium">{m.orders}</span> },
      { id: "s", header: "الحالة", width: 110, cell: (m) => (m.pending ? <span className={WARN}>دعوة معلّقة</span> : <APill tone="success">نشط</APill>) },
    ],
    [],
  );
  return (
    <>
      <SectionHead title="الفروع" sub={`‏${p.branches.length} فروع نشطة`} />
      <DataTable columns={bcols} data={p.branches} getRowId={(b) => b.name} />
      <SectionHead
        title="الفريق"
        sub={p.teamSub}
        action={
          <Button variant="secondary" size="S" className="h-[34px]! text-13!" onClick={() => url.push({ modal: "ag-contact", ref: p.id })}>
            تغيير المفوّض الرئيسي
          </Button>
        }
      />
      <DataTable columns={mcols} data={p.team} getRowId={(m) => m.name} />
    </>
  );
}

// ───────────── الكشوف والمدفوعات (3114:5973) ─────────────
function Statements({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const st = useQuery({ queryKey: ["agencies", "statementsOf", p.id], queryFn: () => api.agencies.statementsOf(p.id) });
  const paid = (id?: string) => !!id && st.data?.find((s) => s.id === id)?.state === "paid";
  const remind = useMutation({
    mutationFn: (id: string) => api.agencies.remind(id),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("تذكير", r.toast);
    },
  });
  const cols = useMemo<Column<ProfileStatement>[]>(
    () => [
      { id: "t", header: "الكشف", width: 170, cell: (s) => <Two a={s.title} b={s.sub} /> },
      { id: "p", header: "الفترة", width: 142, cell: (s) => <Two a={s.period} b={s.periodSub} /> },
      { id: "o", header: "الطلبات والقسائم", width: 120, cell: (s) => <Two a={s.orders} b={s.vouchers} /> },
      {
        id: "a",
        header: (
          <>
            المبلغ · ر.س
            <br />
            شامل الضريبة
          </>
        ),
        width: 110,
        cell: (s) => <span className="font-medium">{s.amount}</span>,
      },
      { id: "d", header: "الاستحقاق", width: 150, cell: (s) => <Two a={s.due} b={s.dueSub} /> },
      {
        id: "s",
        header: "الحالة",
        width: 130,
        cell: (s) => (s.state === "open" ? <APill tone="neutral">مفتوح</APill> : s.state === "paid" || paid(s.id) ? <APill tone="success">{s.paidLabel ?? "مدفوعة · 14 أكتوبر 2026"}</APill> : <span className={WARN}>مستحقة</span>),
      },
      {
        id: "x",
        header: " ",
        width: 190,
        actions: true,
        cell: (s) =>
          s.id ? (
            <>
              <InfoBtn label={`تفاصيل ${s.id}`} onClick={() => url.push({ inv: s.id })} />
              {s.state === "due" && !paid(s.id) ? (
                <>
                  <RowBtn primary onClick={() => url.push({ modal: "ag-pay", ref: s.id })}>
                    تسجيل سداد
                  </RowBtn>
                  <RowBtn onClick={() => remind.mutate(s.id!)} loading={remind.isPending}>
                    تذكير
                  </RowBtn>
                </>
              ) : null}
            </>
          ) : null,
      },
    ],
    [url, remind, st.data], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const pcols = useMemo<Column<AgencyProfile["payments"][number]>[]>(
    () => [
      { id: "d", header: "التاريخ", width: 170, cell: (x) => <span className="font-medium">{x.date}</span> },
      { id: "i", header: "الكشف", width: 170, cell: (x) => <span className="font-medium">{x.invoice}</span> },
      { id: "m", header: "الطريقة", width: 572, cell: (x) => <span className="font-medium">{x.method}</span> },
      {
        id: "a",
        header: (
          <>
            المبلغ · ر.س
            <br />
            شامل الضريبة
          </>
        ),
        width: 130,
        cell: (x) => <span className="font-medium">{x.amount}</span>,
      },
    ],
    [],
  );
  const extra = (st.data ?? []).filter((s) => s.state === "paid" && s.paid && !p.payments.some((x) => x.invoice === s.id) && s.paid.by === "نوف القحطاني");
  const payments = [...extra.map((s) => ({ date: "14 أكتوبر 2026", invoice: s.id, method: s.paid!.method, amount: s.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) })), ...p.payments];
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {p.stmtKpis.map((k) => (
          <KpiS key={k.label} {...k} />
        ))}
      </div>
      <SectionHead title="الكشوف الشهرية" sub="كشفان منذ بدء الحساب في أغسطس 2026" />
      <DataTable columns={cols} data={p.statements} getRowId={(s) => s.title} onRowClick={(s) => s.id && url.push({ inv: s.id })} />
      <SectionHead title="المدفوعات المسجّلة" sub={payments.length === 1 ? "دفعة واحدة" : payments.length === 2 ? "دفعتان" : `${payments.length} دفعات`} />
      <DataTable columns={pcols} data={payments} getRowId={(x) => x.invoice} />
    </>
  );
}

// ───────────── طلبات التعديل (3114:6157) ─────────────
const REQ_ROWS: Record<string, { type: string; d1: string; d2: string; by: string; role: string; tall?: boolean }> = {
  "DQ-2026-0012": { type: "رفع حد الائتمان", d1: "من 300,000 إلى 400,000 ر.س", d2: "زيادة طلبات الربع الأخير", by: "سامي الغامدي", role: "مدير الحساب" },
  "DQ-2026-0013": { type: "تعديل البيانات", d1: "العنوان: طريق الملك، حي الشاطئ، جدة", d2: "الحالي: شارع التحلية، حي الأندلس، جدة", by: "سامي الغامدي", role: "مدير الحساب" },
  "DQ-2026-0014": { type: "تغيير عميل القسيمة", d1: "‏BK-21414 · محمد سالم ← يزن الحربي", d2: "Johnson Ceramic Pro", by: "فيصل الشهري", role: "مندوب مبيعات · جدة · التحلية" },
  "DQ-2026-0015": { type: "إلغاء قسيمة", d1: "‏BK-21411 · إبراهيم القرشي", d2: "1,300 ر.س · تلميع خارجي + طبقة طاردة للماء", by: "فيصل الشهري", role: "مندوب مبيعات · جدة · التحلية" },
};
type ReqRow = { id: string } & (typeof REQ_ROWS)[string];
function Requests({ id }: { id: string }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["agencies", "pending"], queryFn: () => api.agencyExtra.pending() });
  const rows: ReqRow[] = (q.data?.items ?? []).filter((x) => x.agencyId === id && REQ_ROWS[x.id]).map((x) => ({ id: x.id, ...REQ_ROWS[x.id] }));
  const cols = useMemo<Column<ReqRow>[]>(
    () => [
      { id: "id", header: "الطلب", width: 150, cell: (r) => <Two a={r.id} b="بوابة الوكالات" /> },
      { id: "t", header: "النوع", width: 130, cell: (r) => <span className="font-medium">{r.type}</span> },
      { id: "d", header: "التفاصيل", width: 312, cell: (r) => <Two a={r.d1} b={r.d2} /> },
      { id: "b", header: "قدّمه", width: 140, cell: (r) => <Two a={r.by} b={r.role} /> },
      { id: "dt", header: "التاريخ", width: 80, cell: () => <span className="font-medium">اليوم</span> },
      { id: "s", header: "الحالة", width: 120, cell: () => <span className={WARN}>بانتظار القرار</span> },
      {
        id: "a",
        header: " ",
        width: 80,
        actions: true,
        cell: (r) => <RowBtn onClick={() => url.push({ dq: r.id })}>مراجعة</RowBtn>,
      },
    ],
    [url],
  );
  return (
    <>
      <DataTable columns={cols} data={q.isLoading ? undefined : rows} getRowId={(r) => r.id} loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} empty={{ title: "لا توجد طلبات تعديل بانتظار القرار" }} onRowClick={(r) => url.push({ dq: r.id })} rowLabel={(r) => r.id} />
      {rows.length ? <p className="text-12 leading-5 font-light text-muted">{rows.length === 1 ? "طلب واحد بانتظار القرار" : rows.length === 2 ? "طلبان بانتظار القرار" : `${rows.length} طلبات بانتظار القرار`}</p> : null}
    </>
  );
}
