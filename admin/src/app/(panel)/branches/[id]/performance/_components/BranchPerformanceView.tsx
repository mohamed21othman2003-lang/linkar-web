"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { EmptyState } from "@/components/panel/PageHead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api, isApiError } from "@/lib/api";
import { dayLabel, type PerfBooking, type PerfOffer, type PerfService } from "@/lib/api/branches";
import { num, sar } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { BranchOverlays } from "../../../_components/BranchOverlays";

// CON5-08X · أداء الفرع والمستحقات — الزهراء LK-JN-ZH-001 (3114-60556) · الحمراء (3114-60914) · المحمدية (3114-61283)
// يفتح من «الأداء والمستحقات» في ملف الفرع (CON5-08P). الرابط: /branches/<id>/performance
const OFFERS_HREF = "/coming-soon?s=offers";

export function BranchPerformanceView({ id }: { id: string }) {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const q = useQuery({ queryKey: ["branches", "performance", id], queryFn: () => api.branches.performance(id), retry: (n, e) => !isApiError(e, 404) && n < 2 });
  const data = q.data;

  const serviceCols = useMemo<Column<PerfService>[]>(
    () => [
      { id: "name", header: "الخدمة", width: 300, cell: (s) => <span className="text-13 leading-5 font-semibold text-ink">{s.name}</span> },
      { id: "cost", header: "التكلفة", width: 200, cell: (s) => <Num>{s.cost}</Num> },
      { id: "sale", header: "سعر البيع", width: 200, cell: (s) => <Num>{s.sale}</Num> },
      { id: "margin", header: "الهامش", width: 90, cell: (s) => <Num>{s.margin}</Num> },
      { id: "bookings", header: "حجوزات 2026", width: 100, cell: (s) => <Num>{num(s.bookings)}</Num> },
      { id: "status", header: "الحالة", width: 150, cell: (s) => <Tag tone={s.paused ? "warning" : "success"}>{s.status}</Tag> },
      {
        id: "edit",
        header: " ",
        width: 32,
        actions: true,
        cell: (s) => (canEdit && data ? <IconLink href={`/providers/${data.branch.provider.id}?tab=services`} icon="edit" label={`تعديل ${s.name}`} /> : null),
      },
    ],
    [canEdit, data],
  );
  const offerCols = useMemo<Column<PerfOffer>[]>(
    () => [
      {
        id: "name",
        header: "العرض أو الباقة",
        width: 330,
        cell: (o) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{o.name}</span>
            <span className="text-12 leading-[18px] font-light text-muted">{o.kind}</span>
          </div>
        ),
      },
      { id: "cost", header: "تكلفة المزوّد", width: 220, cell: (o) => <Num>{o.cost}</Num> },
      { id: "sale", header: "سعر البيع", width: 220, cell: (o) => <Num>{o.sale}</Num> },
      { id: "status", header: "الحالة", width: 230, cell: (o) => <Tag tone={o.tone}>{o.status}</Tag> },
      {
        id: "actions",
        header: " ",
        width: 72,
        actions: true,
        cell: (o) =>
          canEdit ? (
            <>
              <IconLink href={OFFERS_HREF} icon="info" label={`تفاصيل ${o.name}`} />
              <IconLink href={OFFERS_HREF} icon="trash" label={`حذف ${o.name}`} />
            </>
          ) : null,
      },
    ],
    [canEdit],
  );
  const bookingCols = useMemo<Column<PerfBooking>[]>(
    () => [
      {
        id: "code",
        header: "الحجز · العميل",
        width: 180,
        cell: (b) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{b.code}</span>
            <span className="text-12 leading-[18px] font-light text-muted">{b.customer}</span>
          </div>
        ),
      },
      { id: "service", header: "الخدمة", width: 260, cell: (b) => <span className="text-13 leading-5 font-normal">{b.service}</span> },
      { id: "reason", header: "من اعتذر ولماذا", width: 330, cell: (b) => <span className="text-13 leading-5 font-normal">{b.reason}</span> },
      { id: "date", header: "التاريخ", width: 150, cell: (b) => <span className="text-13 leading-5 font-normal">{b.date}</span> },
      { id: "status", header: "الحالة", width: 152, cell: (b) => <Tag tone={b.status === "لدى لينكار" ? "warning" : b.status === "تم التحويل" ? "info" : "neutral"}>{b.status}</Tag> },
    ],
    [],
  );

  if (q.isError)
    return isApiError(q.error, 404) ? (
      <EmptyState title="لا توجد بيانات أداء لهذا الفرع" body="تظهر الأرقام بعد أول حجز منفّذ في الفرع." action={<ButtonLink href={`/branches/${id}`} variant="secondary" size="S">ملف الفرع</ButtonLink>} />
    ) : (
      <EmptyState title="تعذّر تحميل البيانات" body="حدث خطأ أثناء التحميل. حاول مرة أخرى." action={<Button variant="secondary" size="S" onClick={() => q.refetch()}>إعادة المحاولة</Button>} />
    );

  const b = data?.branch;
  const p = data?.perf;
  const tableProps = { gap: 0, edge: 12, headRadius: 10 as const, rowPadY: 12, rowClassName: "border-divider", skeletonRows: 4, loading: !data } as const;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-3">
        <div className="flex max-w-[684px] min-w-0 flex-col gap-0.5">
          <nav aria-label="مسار الصفحة" className="text-12 leading-[18px] font-light text-muted">
            <Link href="/branches" className="hover:text-ink">
              الفروع
            </Link>{" "}
            ←{" "}
            {b ? (
              <>
                <Link href={`/providers/${b.provider.id}`} className="hover:text-ink">
                  {b.provider.label}
                </Link>{" "}
                ←{" "}
                <Link href={`/branches/${b.id}`} className="hover:text-ink">
                  {b.name}
                </Link>
              </>
            ) : (
              "…"
            )}
          </nav>
          {b ? <h1 className="text-24 font-bold text-ink">{b.name} · الأداء والمستحقات</h1> : <Skeleton className="my-1.5 h-7 w-72" />}
          <p className="text-13 font-light text-muted">
            ‏{b?.code ?? "…"} · {data?.providerName ?? ""} · كل ما يخص الفرع: الخدمات والعروض والباقات، والمنفّذ والمعتذر عنه، والشكاوى والتقييمات، والمستحقات.
          </p>
        </div>
        <div className="flex max-w-full flex-wrap items-end gap-2.5">
          <ButtonLink href={`/branches/${id}`} variant="secondary" className="h-[46px]">
            ملف الفرع
            <Icon name="store" size={16} />
          </ButtonLink>
          {canEdit ? (
            <>
              <Button variant="secondary" className="h-[46px]" onClick={() => url.push({ modal: "add-service", b: id })}>
                إضافة خدمة للفرع
                <Icon name="plus" size={16} />
              </Button>
              <ButtonLink href={OFFERS_HREF} variant="accent" className="h-11">
                عرض أو باقة
                <Icon name="gift" size={16} />
              </ButtonLink>
            </>
          ) : null}
        </div>
      </div>
      <KpiRow>
        <KpiCard label="منفّذ اليوم" icon="check" loading={!p} value={p ? num(p.kpis.today) : "—"} hint={p ? `${sar(p.kpis.todayCost)} تكلفة · 14 أكتوبر 2026` : " "} hintClassName={HINT} />
        <KpiCard label="منفّذ في أكتوبر" icon="chart" loading={!p} value={p ? num(p.kpis.month) : "—"} hint={p ? `مبيعات ${num(p.kpis.sales)} · تكلفة ${num(p.kpis.cost)}` : " "} hintClassName={HINT} />
        <KpiCard
          label="تقييم العملاء"
          icon="star"
          loading={!p}
          value={p ? <>★ {num(p.kpis.rating, 1)}</> : "—"}
          hint={p ? `${num(p.kpis.reviews)} تقييماً · شكاوى مفتوحة ${num(p.kpis.complaints)}` : " "}
          hintClassName={`${HINT} ${p?.kpis.complaints ? "text-danger!" : "text-success!"}`}
        />
        <KpiCard label="مستحقات لم تُحوَّل" icon="card" loading={!p} value={p ? sar(p.kpis.unpaid) : "—"} hint={p ? `تُحوَّل ${dayLabel(p.kpis.payout)}` : " "} hintClassName={`${HINT} text-warning!`} />
      </KpiRow>

      <Section
        title="الخدمات في الفرع"
        sub="تكلفة المزوّد وسعر البيع (سيدان · متوسط · كبير). المزوّد يرى التكلفة، ويرى سعر البيع والهامش داخل «طلب التعديل» فقط."
        action={
          canEdit ? (
            <Button variant="secondary" className="h-[46px]" onClick={() => url.push({ modal: "add-service", b: id })}>
              إضافة خدمة
              <Icon name="plus" size={16} />
            </Button>
          ) : null
        }
      >
        <DataTable columns={serviceCols} data={p?.services} getRowId={(s) => s.name} empty={{ title: "لا توجد خدمات منشورة في الفرع بعد" }} {...tableProps} />
        {p?.serviceNote ? (
          <p className="flex items-start gap-2 rounded-12 bg-[#fdf3e1] p-3 text-13 leading-[21px] font-light text-warning">
            <span className="min-w-0 flex-1">{p.serviceNote}</span>
            <Icon name="alert" size={16} className="mt-[2.5px] shrink-0 text-ink" />
          </p>
        ) : null}
      </Section>

      <Section
        title="العروض والباقات في الفرع"
        sub="أنشأتها لينكار. تعديل أو إيقاف أو حذف من هنا."
        action={
          canEdit ? (
            <div className="flex flex-wrap gap-2.5">
              <ButtonLink href={OFFERS_HREF} variant="secondary" className="h-[46px]">
                عرض جديد
                <Icon name="plus" size={16} />
              </ButtonLink>
              <ButtonLink href={OFFERS_HREF} variant="secondary" className="h-[46px]">
                باقة جديدة
                <Icon name="plus" size={16} />
              </ButtonLink>
            </div>
          ) : null
        }
      >
        <DataTable columns={offerCols} data={p?.offers} getRowId={(o) => o.name} empty={{ title: "لا توجد عروض أو باقات للفرع" }} {...tableProps} />
      </Section>

      <Section
        title="الحجوزات المنفّذة والمعتذر عنها"
        sub="المنفّذ يُضاف لمستحقات المزوّد. المعتذر عنه (من الفرع أو من لينكار) لا يُحتسب."
        action={
          b ? (
            <ButtonLink href={`/providers/${b.provider.id}?tab=bookings&branch=${b.code}`} variant="secondary" className="h-[46px]">
              كل الحجوزات المنفّذة
              <Icon name="calendar" size={16} />
            </ButtonLink>
          ) : null
        }
      >
        <DataTable columns={bookingCols} data={p?.bookings} getRowId={(x) => x.code} empty={{ title: "لا توجد حجوزات معتذر عنها" }} {...tableProps} />
      </Section>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-16 bg-white px-5 pt-5 pb-4">
          <h2 className="text-18 leading-7 font-bold text-ink">مستحقات الفرع</h2>
          <div className="flex flex-col">
            {p ? p.dues.map(([k, v]) => <KV key={k} k={k}>{v}</KV>) : <Skeleton className="h-32 w-full" />}
          </div>
          {b ? (
            <ButtonLink href={`/providers/${b.provider.id}?tab=dues`} variant="secondary" className="h-[46px] w-fit">
              كشف {b.provider.label} · أكتوبر
              <Icon name="file" size={16} />
            </ButtonLink>
          ) : null}
        </section>
        <section className="flex flex-col gap-3 rounded-16 bg-white px-5 pt-5 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-18 leading-7 font-bold text-ink">الشكاوى والتقييمات</h2>
            <p className="text-13 leading-5 font-light text-muted">{p ? `★ ${num(p.kpis.rating, 1)} · ${num(p.kpis.reviews)} تقييماً` : "…"}</p>
          </div>
          {p ? (
            <>
              <p className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[21px] font-light ${p.complaintNote.tone === "success" ? "bg-success-tint text-success" : "bg-[#fbeaea] text-danger"}`}>
                <span className="min-w-0 flex-1">{p.complaintNote.text}</span>
                <Icon name="alert" size={16} className="mt-[2.5px] shrink-0 text-ink" />
              </p>
              <div className="flex flex-col">
                {p.reviews.map(([k, v]) => (
                  <KV key={k} k={k}>
                    {v}
                  </KV>
                ))}
              </div>
            </>
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </section>
      </div>
      <BranchOverlays />
    </>
  );
}

const HINT = "text-13 leading-[22px] font-light text-muted";

/** بطاقة قسم (CON5-08X Card): بيضا r16 · حشو 20·20·16·20 · مسافة 12 · العنوان 18 Bold + سطر 13 Light · زر على الشمال */
function Section({ title, sub, action, children }: { title: string; sub: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-16 bg-white px-5 pt-5 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-18 leading-7 font-bold text-ink">{title}</h2>
          <p className="text-13 leading-5 font-light text-muted">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Num({ children }: { children: ReactNode }) {
  return (
    <span className="num block text-13 leading-5 font-normal whitespace-nowrap">
      <bdi dir="ltr">{children}</bdi>
    </span>
  );
}

const TAG = { success: "bg-success-tint text-success", warning: "bg-[#fdf3e1] text-warning", info: "bg-info-tint text-info", neutral: "bg-surface-2 text-[#5a635e]" };
function Tag({ tone, children }: { tone: keyof typeof TAG; children: ReactNode }) {
  return <span className={`inline-flex min-h-6 w-fit items-center rounded-full px-2.5 py-0.5 text-12 leading-[18px] font-medium ${TAG[tone]}`}>{children}</span>;
}

function IconLink({ href, icon, label }: { href: string; icon: UiGlyph; label: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name={icon} size={16} />
    </Link>
  );
}

function KV({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}
