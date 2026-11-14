"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { dayLabel, slotLabel, type Branch } from "@/lib/api/branches";
import { TIER_LABEL } from "@/lib/api/providers";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { StatusPill, codeLabel } from "./bits";

// CON5-08D · درج الفرع — LK-JN-ZH-001 (3114-55442) · HM-002 (3114-55534) · MH-003 (3114-55591) · LM-RD-001 (3114-55648) · XP-OL-001 (3114-55705) · RM-SM-001 (3114-55762)
// يفتح بالضغط على صف في CON5-08 · الرابط ?branch=<id> · 600 عرض: بطاقة كحلي (الحالة + الفئة) ثم «الفرع» و«سجل التقييمات»
// الأزرار: «إيقاف الفرع» (CON5-08M 3114-55503) و«جدولة زيارة مفاجئة» (CON5-08M 3114-57808)
const SHORT: Record<string, string> = { "نانو سيراميك": "نانو", "حماية PPF": "PPF" };

export function BranchDrawer() {
  const url = useUrlState();
  const id = url.get("branch");
  const canEdit = useCan("providers", "edit");
  const q = useQuery({ queryKey: ["branches", "one", id], queryFn: () => api.branches.get(id!), enabled: !!id });
  const b = q.data;
  const close = () => url.replace({ branch: null });
  const openModal = (m: string) => url.push({ branch: null, modal: m, b: id });
  const approved = b && (b.status === "approved" || b.status === "new");
  return (
    <Drawer tight
      open={!!id}
      onOpenChange={(o) => !o && close()}
      title={b ? `${b.name} · ${codeLabel(b)}` : "…"}
      subtitle={b ? `${b.provider.label} · ${b.address}` : undefined}
      footer={
        b && canEdit ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {approved ? (
              <>
                <Button variant="accent" className="h-11" onClick={() => openModal(b.status === "approved" ? "surprise" : "add-service")}>
                  {b.status === "approved" ? "جدولة زيارة مفاجئة" : "إضافة خدمة للفرع"}
                  <Icon name={b.status === "approved" ? "calendar" : "plus"} size={16} />
                </Button>
                <Button variant="secondary" className="h-[46px]" onClick={() => openModal("suspend")}>
                  إيقاف الفرع
                  <Icon name="lock" size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button variant="accent" className="h-11" onClick={() => openModal(b.status === "rejected" ? "second-visit" : b.status === "request" ? "schedule" : "reschedule")}>
                  {b.status === "rejected" ? "جدولة زيارة ثانية" : b.status === "request" ? "جدولة الزيارة الميدانية" : "إعادة جدولة الزيارة"}
                  <Icon name="calendar" size={16} />
                </Button>
                <ButtonLink href={`/branches/${b.id}`} variant="secondary" className="h-[46px]">
                  عرض ملف الفرع
                  <Icon name="chevron-left" size={16} />
                </ButtonLink>
              </>
            )}
          </div>
        ) : null
      }
    >
      {!b ? (
        q.isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-13 text-muted">
            تعذّر تحميل البيانات
            <Button variant="secondary" size="S" onClick={() => q.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <>
            <Skeleton className="h-28 w-full rounded-16" />
            <Skeleton className="h-60 w-full rounded-14" />
            <Skeleton className="h-52 w-full rounded-14" />
          </>
        )
      ) : (
        <Body b={b} />
      )}
    </Drawer>
  );
}

function Body({ b }: { b: Branch }) {
  const approved = b.status === "approved" || b.status === "new";
  const pending = b.status === "pending-visit" || b.status === "request";
  const services = b.services.filter((s) => s.state === "approved" || s.state === "paused");
  return (
    <>
      <div className="flex flex-col gap-2 rounded-16 bg-ink px-[18px] py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-16 leading-6 font-bold text-white">
            {approved && b.tier ? `${TIER_LABEL[b.tier]}${b.score != null ? ` ${b.score}` : ""} · تقييم لينكار ${b.linkarRating != null ? num(b.linkarRating, 1) : "—"}` : b.status === "rejected" ? `نتيجة الزيارة ${b.result ?? "—"}` : "الفئة بعد الزيارة"}
          </p>
          <StatusPill status={b.status} small />
        </div>
        <p className="text-13 leading-5 font-light text-[#c9d1cd]">
          {pending
            ? `الزيارة الميدانية: ${b.visitAt ? slotLabel(b.visitAt) : "—"} · ${b.assessor ?? "—"}`
            : `آخر زيارة: ${b.status === "rejected" ? "أولية" : "أولية"} · ${b.lastReview ? dayLabel(b.lastReview) : "—"} · ${b.assessor ?? "لينا الحربي"}`}
        </p>
        <p className="text-13 leading-5 font-light text-[#c9d1cd]">{b.nextReview ? `التقييم الدوري القادم: ${dayLabel(b.nextReview)}` : b.statusLine ?? (pending ? "لا يظهر للعملاء قبل الزيارة" : "—")}</p>
      </div>
      <Tile title="الفرع">
        <KV k="مدير الفرع">{b.manager}</KV>
        <KV k="الساعات">{b.hours}</KV>
        <KV k="الطاقة">{/^\d+$/.test(b.technicians) ? `${num(+b.technicians)} فنياً · ${b.slots} فتحات عمل` : `${b.technicians} · ${b.slots}`}</KV>
        <KV k={approved ? "الخدمات المعتمدة" : "الخدمات"}>{`${services.length || b.services.length} · ${(services.length ? services : b.services).slice(0, 4).map((s) => SHORT[s.type] ?? s.type).join(" · ")}`}</KV>
        {approved ? <KV k="أداء أكتوبر">{`${num(b.month ?? 0)} حجزاً · ★ ${b.rating != null ? num(b.rating, 1) : "—"} · ${num(b.complaints)} شكاوى مفتوحة`}</KV> : null}
      </Tile>
      <Tile title="سجل التقييمات">
        {b.visits.map(([text, date], i) => (
          <KV key={i} k={date}>
            {text}
          </KV>
        ))}
      </Tile>
    </>
  );
}

/** بلوك بإطار r14 · حشو 14 · مسافة 6 · عنوان 14 SemiBold كحلي */
function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-14 border border-border p-3.5">
      <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
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
