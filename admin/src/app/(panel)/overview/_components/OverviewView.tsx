"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { DecisionTone, NewBookingsRow, OverviewData } from "@/lib/api/overview";
import { arDate, num, sar } from "@/lib/format";

// CON5-01 · نظرة عامة (3114-65057)
// رأس «صباح الخير، نوف» 24 Bold · بطاقة «حجوزات جديدة بانتظار التواصل» (بيضا r16 بلا إطار · حشو 18·20 · مسافة 14) وجدول المزوّدين
// · 5 بطاقات أرقام (بيضا r16 · حشو 16 · مسافة 6: أيقونة 32 ثم الرقم 26 SemiBold ثم العنوان 14 Medium)
// · صف: «تحتاج قرارك» (700) يمين و«الشبكة» + «المبيعات والهامش حسب النوع» (420) شمال — بطاقات بإطار r16 حشو 18·18·16·18 مسافة 10.
// الروابط من نموذج Figma: «عرض الحجوزات» → الحجوزات (بانتظار الزيارة) · «تنبيه المزوّدين» و«تنبيه موظف CRM» → نوافذ CON5-04M في الحجوزات (?modal=notify-providers / notify-crm — صفحة الحجوزات).
export function OverviewView() {
  const q = useQuery({ queryKey: ["overview"], queryFn: api.overview.get });
  const d = q.data;

  if (q.isError)
    return (
      <>
        <Head name="" />
        <section className="rounded-16 bg-white">
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        </section>
      </>
    );

  return (
    <>
      <Head name={d?.greetingName} />
      <NewBookingsCard data={d?.newBookings} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {/* RTL: أول بطاقة على اليمين */}
        <KpiLink href="/analytics?tab=demand" icon="card" label="مبيعات اليوم" value={d && sar(d.kpis.salesToday)} />
        <KpiLink href="/analytics?tab=margin" icon="chart" label="هامش الربح اليوم" value={d && sar(d.kpis.marginToday)} />
        <KpiLink href="/dues" icon="package" label="مستحقات اليوم" value={d && sar(d.kpis.duesToday)} />
        <KpiLink href="/requests" icon="edit" label="تنتظر قرارك" value={d && num(d.kpis.awaitingDecision)} />
        <KpiLink href="/invoices?tab=vouchers" icon="qr" label="قسائم تنتهي قريباً" value={d && num(d.kpis.vouchersExpiring)} />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <DecisionsCard items={d?.decisions} />
        <div className="flex flex-col gap-4 lg:w-[420px] lg:shrink-0">
          <BorderCard title="الشبكة" sub="اليوم">
            {d ? (
              <>
                <KV k="منشآت نشطة" v={d.network.active} />
                <KV k="فروع معتمدة" v={d.network.branches} />
                <KV k="خدمات منشورة" v={d.network.services} />
              </>
            ) : (
              <Rows n={3} cls="h-8" />
            )}
          </BorderCard>
          <BorderCard title="المبيعات والهامش حسب النوع" sub="أكتوبر حتى اليوم · على الحجوزات المكتملة">
            {d ? d.salesByType.map((r) => <SalesRow key={r.type} {...r} />) : <Rows n={5} cls="h-9" />}
          </BorderCard>
        </div>
      </div>
    </>
  );
}

function Head({ name }: { name?: string }) {
  return (
    <div className="-mt-2">
      <h1 className="text-24 font-bold text-ink">{name === undefined ? <Skeleton className="h-[38px] w-48" /> : `صباح الخير، ${name || "—"}`}</h1>
    </div>
  );
}

// ───────────── CON7 · حجوزات جديدة بانتظار التواصل ─────────────
const COLS = "md:grid-cols-[190fr_290fr_140fr_150fr_150fr_152fr]";

function NewBookingsCard({ data }: { data?: OverviewData["newBookings"] }) {
  return (
    <section aria-labelledby="ov-new" className="flex flex-col gap-3.5 rounded-16 bg-white px-4 py-[18px] sm:px-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id="ov-new" className="text-16 font-semibold text-ink">
              حجوزات جديدة بانتظار التواصل
            </h2>
            {data ? (
              <p className="text-13 leading-5 text-muted">
                {num(data.total)} حجزاً جديداً · {num(data.branches)} فرعاً · {num(data.providers)} مزوّداً · تم التواصل مع {num(data.contacted)}
              </p>
            ) : (
              <Skeleton className="h-5 w-64" />
            )}
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
            <Icon name="phone" size={16} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/bookings?modal=notify-crm" className="inline-flex h-[42px] items-center gap-1.5 rounded-12 border border-border bg-white px-3.5 text-14 font-medium text-ink hover:bg-surface-1">
            <Icon name="user" size={16} />
            تنبيه موظف <span dir="ltr">CRM</span>
          </Link>
          <Link href="/bookings?modal=notify-providers" className="inline-flex h-[42px] items-center gap-1.5 rounded-12 border border-border bg-white px-3.5 text-14 font-medium text-ink hover:bg-surface-1">
            <Icon name="bell" size={16} />
            تنبيه المزوّدين
          </Link>
          <Link href="/bookings?tab=awaiting-visit" className="inline-flex h-10 items-center px-1.5 text-14 leading-[22px] font-semibold text-ink hover:underline">
            عرض الحجوزات
          </Link>
        </div>
      </div>
      <div role="table" aria-label="حجوزات جديدة حسب المزوّد" className="flex flex-col">
        <div role="row" className={`hidden rounded-10 bg-surface-1 px-3 py-[9px] text-12 font-medium text-muted md:grid ${COLS}`}>
          {["المزوّد", "الفروع", "حجوزات جديدة", "تواصل المزوّد", "تواصل لينكار", "أقرب موعد"].map((h) => (
            <span key={h} role="columnheader">
              {h}
            </span>
          ))}
        </div>
        {data ? data.rows.map((r) => <BreakdownRow key={r.provider} r={r} />) : <Rows n={4} cls="h-[61px]" />}
      </div>
    </section>
  );
}

function BreakdownRow({ r }: { r: NewBookingsRow }) {
  const cells: [string, ReactNode][] = [
    ["الفروع", <span key="b"><span className="num">{num(r.branches)}</span>{r.branchNames ? <span className="mt-0.5 block text-12 leading-[18px] font-light text-muted">{r.branchNames}</span> : null}</span>],
    ["حجوزات جديدة", <span key="f" className="num">{num(r.fresh)}</span>],
    ["تواصل المزوّد", <span key="p" className="num">{num(r.providerContacted)} من {num(r.fresh)}</span>],
    ["تواصل لينكار", <span key="l" className="num">{num(r.linkarContacted)} من {num(r.fresh)}</span>],
    ["أقرب موعد", r.nearest ? arDate(r.nearest) : "—"],
  ];
  const name = r.providerId ? (
    <Link href={`/providers/${r.providerId}`} className="hover:underline">
      {r.provider}
    </Link>
  ) : (
    r.provider
  );
  return (
    <div role="row" className={`grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-b border-divider px-3 py-2.5 text-13 leading-5 text-ink md:gap-0 ${COLS}`}>
      <span role="cell" className="col-span-2 font-medium md:col-span-1">
        {name}
      </span>
      {cells.map(([k, v]) => (
        <span key={k} role="cell" className="flex flex-col max-md:gap-0.5">
          <span className="text-12 font-medium text-muted md:hidden">{k}</span>
          <span>{v}</span>
        </span>
      ))}
    </div>
  );
}

// ───────────── بطاقات الأرقام ─────────────
function KpiLink({ href, icon, label, value }: { href: string; icon: UiGlyph; label: string; value?: string }) {
  return (
    <Link href={href} className="flex flex-col gap-1.5 rounded-16 bg-white p-4 transition-shadow hover:shadow-menu">
      <span className="flex size-8 items-center justify-center rounded-8 bg-surface-2 text-ink">
        <Icon name={icon} size={16} />
      </span>
      {value === undefined ? <Skeleton className="my-1.5 h-[30px] w-24" /> : <span className="num text-[26px] leading-[42px] font-semibold whitespace-nowrap text-ink">{value}</span>}
      <span className="text-14 font-medium text-ink">{label}</span>
    </Link>
  );
}

// ───────────── البطاقات بإطار ─────────────
function BorderCard({ title, sub, children, className }: { title: string; sub: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-2.5 rounded-16 border border-border bg-white px-[18px] pt-[18px] pb-4 ${className ?? ""}`}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] leading-[26px] font-bold text-ink">{title}</h2>
        <p className="text-12 leading-[18px] font-light text-muted">{sub}</p>
      </div>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2.5 py-1.5 text-13 leading-5">
      <span className="font-light text-muted">{k}</span>
      <span className="num text-end font-medium text-ink">{v}</span>
    </div>
  );
}

function SalesRow({ type, sales, marginPct }: { type: string; sales: number; marginPct: number }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-13 leading-5">
      <span className="min-w-0 flex-1 font-medium text-ink">{type}</span>
      <span className="num text-muted">{sar(sales)}</span>
      <span className="inline-flex h-6 w-[85px] shrink-0 items-center justify-center rounded-full bg-success-tint text-12 leading-[18px] font-medium text-success">هامش {marginPct}%</span>
    </div>
  );
}

const DOT: Record<DecisionTone, string> = { warning: "bg-warning", danger: "bg-danger", info: "bg-info", neutral: "bg-[#4a5550]" };

function DecisionsCard({ items }: { items?: OverviewData["decisions"] }) {
  return (
    <BorderCard title="تحتاج قرارك" sub="مرتبة حسب المهلة" className="min-w-0 flex-1">
      {items
        ? items.map((it) => (
            <Link key={it.id} href={it.href} className="flex min-h-[66px] items-center gap-2.5 rounded-12 bg-surface-1 p-3 hover:bg-surface-2">
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[it.tone]}`} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-14 leading-[22px] font-semibold text-ink">{it.title}</span>
                <span className="text-12 leading-[18px] font-light text-muted">{it.sub}</span>
              </span>
              <Icon name="chevron-left" size={14} className="shrink-0 text-ink" />
            </Link>
          ))
        : <Rows n={8} cls="h-[66px] rounded-12" />}
    </BorderCard>
  );
}

function Rows({ n, cls }: { n: number; cls: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className={`w-full ${cls}`} />
      ))}
    </>
  );
}
