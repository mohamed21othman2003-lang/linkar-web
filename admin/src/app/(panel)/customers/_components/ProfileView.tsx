"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { maskPhone, profileOf, type KV, type ProfileItem } from "@/lib/api/customers";
import { ltrRuns, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { PointsModal } from "./CustomerDrawer";

// CON5-05P · ملف العميل — نظرة عامة (3260-257929) · الحجوزات والقسائم (3260-258298) · المدفوعات والفواتير (3260-258667) · الشكاوى والتقييمات (3260-259036)
// الرابط /customers/<id>?tab=bookings|payments|complaints · «تعديل النقاط» ?modal=points · «اتصال» → النافذة المشتركة ?modal=m00-call
// الدخول: من اسم العميل في رأس درجه (Figma ما فيهوش رابط للصفحة دي)
type Tab = "overview" | "bookings" | "payments" | "complaints";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "نظرة عامة" },
  { key: "bookings", label: "الحجوزات والقسائم" },
  { key: "payments", label: "المدفوعات والفواتير" },
  { key: "complaints", label: "الشكاوى والتقييمات" },
];

export function ProfileView({ id }: { id: string }) {
  const url = useUrlState();
  const canEdit = useCan("customers", "edit");
  const q = useQuery({ queryKey: ["customers", "one", id], queryFn: () => api.customers.get(id) });
  const tab = (TABS.some((t) => t.key === url.get("tab")) ? url.get("tab") : "overview") as Tab;
  const c = q.data;

  if (q.isError)
    return (
      <EmptyState
        title="تعذّر تحميل ملف العميل"
        body="قد يكون العميل غير موجود أو حدث خطأ أثناء التحميل."
        action={
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  if (!c)
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[86px] w-72" />
        <Skeleton className="h-10 w-[560px] max-w-full" />
        <Skeleton className="h-72 w-full rounded-14" />
      </div>
    );
  const p = profileOf(c);
  const d = c.drawer;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <nav aria-label="مسار الصفحة" className="text-12 leading-[22px] font-light text-muted">
            <Link href="/customers" className="hover:text-ink">
              العملاء
            </Link>
            {` ← ${c.name}`}
          </nav>
          <h1 className="text-24 font-bold text-ink">{c.name}</h1>
          <p className="text-13 leading-[22px] font-light text-muted">{ltrRuns(`${maskPhone(c.phone)} · ${c.city}`)}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canEdit ? <HeadBtn onClick={() => url.push({ modal: "points" })}>تعديل النقاط</HeadBtn> : null}
          <HeadBtn onClick={() => url.push({ modal: "m00-call", phone: c.phone.replace(/\s/g, ""), ref: c.name })}>اتصال</HeadBtn>
        </div>
      </div>

      <div role="tablist" aria-label="أقسام ملف العميل" className="flex gap-1.5 overflow-x-auto max-md:pb-1 [scrollbar-width:none] [&>*]:shrink-0">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => url.replace({ tab: t.key === "overview" ? null : t.key })}
              className={`flex h-10 items-center rounded-10 border px-[11px] text-14 leading-[22px] whitespace-nowrap ${on ? "border-ink bg-ink font-bold text-white" : "border-border bg-white font-semibold text-ink hover:bg-surface-1"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {p.stats.map((s) => (
              <div key={s.label} className="flex flex-col rounded-12 bg-surface-1 px-3.5 py-3">
                <span className="num text-[20px] leading-[30px] font-bold text-ink">{s.value}</span>
                <span className="text-12 leading-[18px] font-light text-muted">{s.label}</span>
              </div>
            ))}
          </div>
          <Row>
            <Tile title="البيانات الأساسية">
              {p.basics.map((r) => (
                <KVRow key={r.k} r={r} ltr={r.k === "الجوال"} />
              ))}
            </Tile>
            <Tile title="الاهتمامات">
              {p.interests.map((r) => (
                <KVRow key={r.k} r={r} />
              ))}
            </Tile>
          </Row>
          <Row>
            <Tile title={d.cars.length > 1 ? "السيارات" : "السيارة"}>
              {d.cars.map((car) => (
                <p key={car} className="text-13 leading-[21px] font-normal text-ink">
                  {ltrRuns(car)}
                </p>
              ))}
            </Tile>
            <Tile title="الدعوات والنقاط">
              {p.invitesPoints.map((r) => (
                <KVRow key={r.k} r={r} />
              ))}
            </Tile>
          </Row>
        </div>
      ) : tab === "bookings" ? (
        <div className="flex flex-col gap-4">
          <Row>
            <Tile title="آخر الحجوزات">
              <Items items={p.recentBookings} empty="لا توجد حجوزات بعد" />
            </Tile>
            <Tile title={`القسائم الصالحة (${num(d.vouchers?.length ?? 0)})`}>
              <Items items={(d.vouchers ?? []).map((v) => ({ title: v.title, sub: v.sub }))} empty="لا توجد قسائم صالحة" />
            </Tile>
          </Row>
          <Link href={d.links.at(-1)?.href ?? "/bookings"} className="flex min-h-[46px] items-center gap-2 rounded-12 border border-border bg-white px-3.5 py-3 text-13 leading-5 font-medium text-ink hover:bg-surface-1">
            <span className="min-w-0 flex-1">حجوزات العميل في صفحة الحجوزات</span>
            <Icon name="chevron-left" size={16} className="shrink-0" />
          </Link>
        </div>
      ) : tab === "payments" ? (
        <Row>
          <Tile title="الفواتير">
            <Items items={p.invoices} empty="لا توجد فواتير بعد" />
          </Tile>
          <Tile title="المدفوعات">
            {p.payments.length ? p.payments.map((r) => <KVRow key={r.k} r={r} />) : <EmptyLine>لا توجد مدفوعات بعد</EmptyLine>}
          </Tile>
        </Row>
      ) : (
        <div className="flex flex-col gap-4">
          <Row>
            <Tile title="الشكاوى">
              <Items items={p.complaints} empty="لا توجد شكاوى" />
            </Tile>
            <Tile title="الرسائل والمقترحات">
              <Items items={p.messages} empty="لا توجد رسائل" />
            </Tile>
          </Row>
          <Tile title="التقييمات">
            <Items items={p.reviews} empty="لا توجد تقييمات بعد" />
          </Tile>
        </div>
      )}

      <PointsModal c={c} open={url.get("modal") === "points"} onClose={() => url.replace({ modal: null })} />
    </>
  );
}

function HeadBtn({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[46px] items-center rounded-12 border border-border bg-white px-4 text-14 leading-[22px] font-medium text-ink hover:bg-surface-1">
      {children}
    </button>
  );
}
const Row = ({ children }: { children: ReactNode }) => <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;

// بطاقة: بإطار r14 · حشو 14 · مسافة 6 · العنوان 14/22 SemiBold
function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-1.5 rounded-14 border border-border bg-white p-3.5">
      <h2 className="text-14 leading-[22px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
function KVRow({ r, ltr }: { r: KV; ltr?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="shrink-0 text-13 leading-5 font-light text-muted">{ltrRuns(r.k)}</span>
      <span className="num min-w-0 flex-1 text-end text-13 leading-5 font-medium text-ink">{ltr ? <bdi dir="ltr">{r.v}</bdi> : ltrRuns(r.v)}</span>
    </div>
  );
}
function Items({ items, empty }: { items: ProfileItem[]; empty: string }) {
  if (!items.length) return <EmptyLine>{empty}</EmptyLine>;
  return (
    <>
      {items.map((it) => {
        const body = (
          <>
            <p className="text-13 leading-5 font-semibold text-ink">{ltrRuns(it.title)}</p>
            <p className="text-12 leading-[18px] font-light text-muted">{ltrRuns(it.sub)}</p>
          </>
        );
        return it.href ? (
          <Link key={it.title} href={it.href} className="flex flex-col hover:[&>p:first-child]:underline">
            {body}
          </Link>
        ) : (
          <div key={it.title} className="flex flex-col">
            {body}
          </div>
        );
      })}
    </>
  );
}
const EmptyLine = ({ children }: { children: ReactNode }) => <p className="py-0.5 text-14 leading-[27px] font-normal text-[#6b7573]">{children}</p>;
