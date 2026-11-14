"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api, isApiError } from "@/lib/api";
import { BASE_QUALITY, type Branch } from "@/lib/api/branches";
import { TIER_LABEL } from "@/lib/api/providers";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { BranchOverlays, branchActions } from "../../_components/BranchOverlays";
import { CriteriaLink, MapBox, ServiceStatePill, StatusPill, TierPill, codeLabel } from "../../_components/bits";

// CON5-08P · ملف الفرع — فرع الزهراء LK-JN-ZH-001 (3114-56007) · الحمراء (3114-56224) · المحمدية (3114-56436) · الروضة (3114-56648)
// · العليا (3114-56790) · السامر (3114-56932) · أبحر الشمالية (3114-57066) · الصفا (3114-57206) · النسيم (3114-57328) · الحمدانية (3114-57462)
// الرابط: /branches/<id> · النوافذ ?modal=…&b=<id> (نفس نوافذ القائمة)
export function BranchProfile({ id }: { id: string }) {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const q = useQuery({ queryKey: ["branches", "one", id], queryFn: () => api.branches.get(id), retry: (n, e) => !isApiError(e, 404) && n < 2 });
  const b = q.data;
  const open = (m: string) => url.push({ modal: m, b: id });

  if (q.isError)
    return isApiError(q.error, 404) ? (
      <EmptyState title="الفرع غير موجود" body="ربما حُذف الفرع أو تغيّر رابطه." action={<ButtonLink href="/branches" variant="secondary" size="S">العودة إلى الفروع</ButtonLink>} />
    ) : (
      <EmptyState title="تعذّر تحميل البيانات" body="حدث خطأ أثناء التحميل. حاول مرة أخرى." action={<Button variant="secondary" size="S" onClick={() => q.refetch()}>إعادة المحاولة</Button>} />
    );
  if (!b) return <ProfileSkeleton />;

  const pending = b.status === "pending-visit" || b.status === "request";
  const third =
    b.status === "rejected"
      ? { label: "جدولة زيارة ثانية", modal: "second-visit", icon: "calendar" as const }
      : pending
        ? { label: b.status === "request" ? "جدولة الزيارة الميدانية" : "إعادة جدولة الزيارة", modal: b.status === "request" ? "schedule" : "reschedule", icon: "calendar" as const }
        : { label: "إضافة نوع خدمة", modal: "add-service", icon: "plus" as const };

  return (
    <>
      {/* رأس الصفحة: المسار + الاسم والشارات + الكود · وأزرار الصفحة على الشمال (CON5-08P Page head 1136×86) */}
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <nav aria-label="مسار الصفحة" className="text-12 leading-[18px] font-light text-muted">
            <Link href="/branches" className="hover:text-ink">
              الفروع
            </Link>{" "}
            ← {b.name}
          </nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-24 font-bold text-ink">{b.name}</h1>
            <StatusPill status={b.status} small />
            {b.tier && !pending && b.status !== "rejected" ? (
              <TierPill tier={b.tier} profile />
            ) : (
              <span className="inline-flex h-6 items-center rounded-full bg-surface-2 px-2.5 text-12 leading-[18px] font-medium text-muted">{b.status === "rejected" ? "—" : "الفئة بعد الزيارة"}</span>
            )}
          </div>
          <p className="text-13 font-light text-muted">
            ‏{b.code} · {b.provider.label} · {b.provider.code} · {b.city}
          </p>
        </div>
        {canEdit ? (
          <div className="flex max-w-full flex-wrap items-end gap-3">
            <Button variant="accent" className="h-[42px] px-4" onClick={() => open(third.modal)}>
              {third.label}
              <Icon name={third.icon} size={16} />
            </Button>
            <Button variant="secondary" className="h-11 px-4" onClick={() => open("edit")}>
              تعديل بيانات الفرع
              <Icon name="edit" size={16} />
            </Button>
            {b.hasPerformance ? (
              <ButtonLink href={`/branches/${b.id}/performance`} variant="accent" className="h-11 px-4">
                الأداء والمستحقات
                <Icon name="chart" size={16} />
              </ButtonLink>
            ) : null}
            <ActionsMenu b={b} onPick={open} />
          </div>
        ) : null}
      </div>

      {b.note ? (
        <p className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 leading-[21px] font-light text-info">
          <span className="min-w-0 flex-1">{b.note}</span>
          <Icon name="info" size={16} className="mt-[2.5px] shrink-0 text-ink" />
        </p>
      ) : null}
      {
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="شكاوى مفتوحة" value={num(b.complaints)} />
          {b.result ? <Stat label="نتيجة الزيارة" value={b.result} /> : <Stat label="الفئة · تقييم لينكار" value={b.tier ? `${TIER_LABEL[b.tier]} · ${b.linkarRating != null ? num(b.linkarRating, 1) : "—"}` : "—"} />}
          <Stat
            label="تقييم العملاء"
            value={
              b.rating != null ? (
                <>
                  <span className="text-star">★</span> {num(b.rating, 1)}
                </>
              ) : (
                "—"
              )
            }
          />
          <Stat label="حجوزات أكتوبر" value={b.month != null ? num(b.month) : "—"} />
        </div>
      }

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="بيانات الفرع">
            <KV k="الاسم على لينكار">{b.displayName}</KV>
            <KV k="الكود">{codeLabel(b)}</KV>
            <KV k="مقدّم الخدمة">
              {b.provider.full} · {b.provider.code}
            </KV>
            <KV k="الفرع الرئيسي">{b.main ? "نعم" : "لا"}</KV>
            <KV k="السجل والرقم الضريبي">نفس بيانات المنشأة</KV>
            <KV k="الحالة">{b.status === "approved" ? `معتمد · ${b.disabled ? "معطّل" : b.pausedUntil ? "موقوف مؤقتاً" : "نشط"}` : b.status === "new" ? "معتمد جديد" : b.status === "rejected" ? "مرفوض" : "بانتظار الزيارة الميدانية"}</KV>
          </Card>
          <Card title="الموقع">
            <KV k="المدينة">{b.city}</KV>
            <KV k="الحي">{b.district}</KV>
            <KV k="العنوان">{b.address}</KV>
            {/* TODO(map provider): خريطة حقيقية لموقع الفرع لما يتحدد مزوّد الخرائط (القسم 18.1) */}
            <MapBox />
          </Card>
          <Card title="التواصل والتشغيل">
            <KV k="مدير الفرع">{b.managerPhone ? `${b.manager} · ‎${b.managerPhone}` : b.manager}</KV>
            {b.email ? <KV k="بريد الفرع">{b.email}</KV> : null}
            {b.phone ? <KV k="الجوال">‎{b.phone}</KV> : null}
            {b.capacity ? <KV k="قدرة الاستيعاب">{b.capacity}</KV> : null}
            {b.liaison ? <KV k="مسؤول التواصل مع لينكار">{b.liaison}</KV> : null}
            <KV k="ساعات العمل">{b.hours}</KV>
            <KV k="فتحات العمل">{b.slots}</KV>
            <KV k="الفنيون">{b.technicians}</KV>
          </Card>
          {b.durations ? (
            <section className="flex flex-col gap-3 rounded-16 border border-border bg-white px-5 pt-5 pb-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-18 leading-7 font-bold text-ink">مدة التنفيذ في الفرع</h2>
                <p className="text-13 leading-5 font-light text-muted">لكل خدمة منشورة في الفرع</p>
              </div>
              <div className="flex flex-col">
                {b.durations.map(([k, v]) => (
                  <KV key={k} k={k} pad={6}>
                    {v}
                  </KV>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="الخدمات ومعايير قبولها">
            {b.services.map((s) => (
              <div key={s.type} className="flex items-center gap-2.5 rounded-12 border border-border px-3 py-2.5">
                <div className="flex w-[104px] shrink-0 flex-col gap-0.5">
                  <span className="text-14 leading-[22px] font-semibold whitespace-nowrap text-ink">{s.type}</span>
                  <span className="text-12 leading-[18px] font-light text-muted">مدة التنفيذ: {s.duration}</span>
                </div>
                <span className="flex-1" />
                <ServiceStatePill state={s.state} />
                <CriteriaLink>المعايير ↗</CriteriaLink>
              </div>
            ))}
            {b.baseQuality ? <CriteriaLink className="w-full! rounded-10! px-3! py-2!">ويُقيَّم الفرع بـ«الجودة الأساسية» · {BASE_QUALITY} ↗</CriteriaLink> : null}
          </Card>
          <Card title={b.visitsTitle ?? "الزيارات والتقييم"}>
            {b.visits.map(([text, date], i) => (
              <KV key={i} k={date}>
                {text}
              </KV>
            ))}
          </Card>
          <Card title="المستندات">
            {b.docs.map(([k, v]) => (
              <KV key={k} k={k}>
                {v}
              </KV>
            ))}
          </Card>
          {b.bookings ? (
            <Card title="آخر الحجوزات في الفرع">
              {b.bookings.map(([code, text]) => (
                <Link key={code} href={`/coming-soon?s=bookings&id=${code}`} className="flex items-center gap-2.5 rounded-10 border border-border px-2.5 py-2 hover:bg-surface-1">
                  <span className="text-13 leading-5 font-semibold text-ink">{code}</span>
                  <span className="min-w-0 flex-1 truncate text-13 leading-5 font-light text-muted">{text}</span>
                  <Icon name="chevron-left" size={14} className="shrink-0 text-ink" />
                </Link>
              ))}
              <Link href={`/providers/${b.provider.id}?tab=bookings&branch=${b.code}`} className="flex items-center gap-2.5 rounded-12 border border-ink bg-lime-tint px-3.5 py-3 hover:bg-lime-tint/70">
                <span className="min-w-0 flex-1 text-13 leading-5 font-semibold text-ink">كل الحجوزات المنفّذة في الفرع · المبيعات والتكلفة والهامش</span>
                <Icon name="chevron-left" size={14} className="shrink-0 text-ink" />
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
      <BranchOverlays />
    </>
  );
}

/** بطاقة رقم (CON5-08P KPIs): 275×86 · r14 · حشو 14·16 · مسافة 4 · العنوان 13 Medium رمادي · الرقم 24 Bold */
function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <section className="flex flex-col gap-1 rounded-14 bg-white px-4 py-3.5">
      <h3 className="text-13 leading-5 font-medium text-muted">{label}</h3>
      <p className="num text-24 leading-[34px] font-bold text-ink">{value}</p>
    </section>
  );
}

/** بطاقة بإطار (CON5-08P Card): r16 · حشو 18 · مسافة 8 · العنوان 15 Bold */
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-16 border border-border bg-white p-[18px]">
      <h2 className="text-[15px] leading-6 font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** مفتاح 13 Light رمادي يمين · قيمة 13 Medium كحلي شمال · حشو 5 (6 في «مدة التنفيذ») · مسافة 12 */
function KV({ k, children, pad = 5 }: { k: ReactNode; children: ReactNode; pad?: number }) {
  return (
    <div className="flex items-start justify-between gap-3 text-13 leading-5" style={{ paddingBlock: pad }}>
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

/** «إجراءات ⌄» (Row menu في رأس الملف): 86×35 r8 · نفس قائمة CON5-08A */
function ActionsMenu({ b, onPick }: { b: Branch; onPick: (m: string) => void }) {
  const router = useRouter();
  const [top, bottom] = branchActions(b);
  const items = [...top, ...bottom.map((a, i) => ({ ...a, dividerBefore: i === 0 }))] as (ReturnType<typeof branchActions>[0][number] & { dividerBefore?: boolean })[];
  return (
    <Menu.Root dir="rtl" modal={false}>
      <Menu.Trigger className="flex h-[35px] items-center gap-1.5 rounded-8 border border-border bg-white ps-3 pe-2.5 text-13 leading-[21px] font-medium text-ink hover:bg-surface-1 data-[state=open]:border-ink">
        إجراءات
        <Icon name="chevron-down" size={14} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={6} collisionPadding={16} className="z-[70] flex w-[242px] flex-col gap-0.5 rounded-12 border border-border bg-white p-1.5 shadow-menu">
          {items.map((it) => (
            <Fragment key={it.key}>
              {it.dividerBefore ? <Menu.Separator className="h-px bg-divider" /> : null}
              <Menu.Item
                onSelect={() => (it.href ? (it.href === `/branches/${b.id}` ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push(it.href)) : onPick(it.key))}
                className={`flex h-[37px] cursor-pointer items-center gap-2.5 rounded-8 px-2.5 text-13 font-medium outline-none data-highlighted:bg-surface-1 ${it.danger ? "text-danger" : "text-ink"}`}
              >
                <Icon name={it.icon} size={16} className={`shrink-0 ${it.danger ? "text-danger" : "text-ink"}`} />
                {it.label}
              </Menu.Item>
            </Fragment>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      <Skeleton className="h-[86px] w-full rounded-16" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[86px] rounded-14" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[540px] rounded-16" />
        <Skeleton className="h-[540px] rounded-16" />
      </div>
    </div>
  );
}
