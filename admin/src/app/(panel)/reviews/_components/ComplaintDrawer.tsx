"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { KV, Tile } from "@/components/panel/KV";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Message, QualityTone } from "@/lib/api/reviews";
import { useUrlState } from "@/lib/use-url-state";
import { EndNote, SPill } from "../../field-evaluation/_components/bits";

// CON5-18D · CM-… (600 · رأس كحلي r18 بأيقونة 48 خضراء + الحالة + شارة التصنيف · «الحجز» · «الشكوى» · «المحادثة»):
//   CM-3352 بانتظار رد المركز (3114:458) → «تذكير المركز» CON5-T1801
//   CM-3349 لدى لينكار (3114:520) → «إغلاق بنتيجة» / «مراسلة المركز» / «رسالة للعميل» (CON5-18M)
//   CM-3340 بانتظار رد العميل (3114:601) → «إغلاق بنتيجة» / «تذكير العميل» CON5-T1806
//   مغلقة: CM-3351 (666) · CM-3348 (706) · CM-3347 (746) · CM-3345 (786) — «النتيجة» + ملاحظة، بدون أزرار

/** رأس الدرج الكحلي (r18 · حشو 18 · مسافة 14): أيقونة 48 خضراء يمين · العنوان 18 Bold + سطر 13 Light أبيض · شارة شمال */
export function QualityHero({ icon, title, sub, pill }: { icon: UiGlyph; title: ReactNode; sub?: string; pill?: { label: string; tone: QualityTone } }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-ink p-[18px]">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-lime text-ink">
        <Icon name={icon} size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-18 font-bold text-white">{title}</p>
        <p className="min-h-[22px] text-13 leading-[22px] font-light text-white">{sub}</p>
      </div>
      {pill ? <SPill tone={pill.tone}>{pill.label}</SPill> : null}
    </div>
  );
}

const MSG_BG: Record<Message["kind"], string> = {
  customer: "bg-surface-1",
  system: "bg-pending-tint",
  linkar: "bg-success-tint",
  center: "bg-info-tint",
};

export function ComplaintDrawer() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const id = url.get("complaint");
  const modal = url.get("modal");
  const q = useQuery({ queryKey: ["quality", "complaint", id], queryFn: () => api.quality.complaint(id!), enabled: !!id, retry: false });
  const c = q.data;
  const close = () => url.replace({ complaint: null, modal: null });
  const remind = useMutation({
    mutationFn: () => (c?.stage === "customer" ? api.quality.remindCustomer(id!) : api.quality.remindCenter(id!)),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["quality"] });
      toast("تذكير", r.toast);
    },
  });

  const footer = !c ? undefined : c.stage === "center" ? (
    <Button loading={remind.isPending} onClick={() => remind.mutate()}>
      تذكير المركز
    </Button>
  ) : c.stage === "linkar" ? (
    <>
      <Button onClick={() => url.push({ modal: "rv-close" })}>إغلاق بنتيجة</Button>
      <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "rv-center" })}>
        مراسلة المركز
      </Button>
      <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "rv-customer" })}>
        رسالة للعميل
      </Button>
    </>
  ) : c.stage === "customer" ? (
    <>
      <Button onClick={() => url.push({ modal: "rv-close" })}>إغلاق بنتيجة</Button>
      <Button variant="secondary" className="h-[50px]!" loading={remind.isPending} onClick={() => remind.mutate()}>
        تذكير العميل
      </Button>
    </>
  ) : undefined;

  return (
    <Drawer open={!!id && !modal} onOpenChange={(o) => !o && close()} title={c?.title ?? (q.isError ? "الشكوى غير موجودة" : "…")} subtitle={c?.subtitle} footer={footer}>
      {q.isLoading ? (
        <>
          <Skeleton className="h-[90px] w-full rounded-[18px]" />
          <Skeleton className="h-40 w-full rounded-14" />
        </>
      ) : q.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-13 text-muted">تعذّر تحميل الشكوى.</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : c ? (
        <>
          <QualityHero icon={c.stage === "closed" ? "check" : "message"} title={c.hero.title} sub={c.hero.sub} pill={{ label: c.hero.pill, tone: c.hero.tone }} />
          {c.result ? (
            <Tile title="النتيجة">
              {c.result.map(([k, v]) => (
                <KV key={k} k={k}>
                  {v}
                </KV>
              ))}
            </Tile>
          ) : null}
          {c.booking_.length ? (
            <Tile title="الحجز">
              {c.booking_.map(([k, v]) => (
                <KV key={k} k={k}>
                  {v}
                </KV>
              ))}
            </Tile>
          ) : null}
          {c.complaint ? (
            <Tile title="الشكوى">
              <p className="text-13 leading-[22px] font-light text-ink">{c.complaint.text}</p>
              <KV k="الحل المفضّل">{c.complaint.preferred}</KV>
            </Tile>
          ) : null}
          {c.messages.length ? (
            <Tile title="المحادثة">
              {c.messages.map((m, i) => (
                <div key={i} className={`flex flex-col gap-1 rounded-12 p-3 ${MSG_BG[m.kind]}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-13 leading-[22px] font-medium text-ink">{m.author}</span>
                    <span className="num text-12 leading-5 font-medium text-muted">{m.at}</span>
                  </div>
                  <p className="text-13 leading-[22px] font-light text-ink">{m.text}</p>
                </div>
              ))}
            </Tile>
          ) : null}
          {c.note ? (
            <EndNote start tone={c.stage === "closed" ? "neutral" : "trial"}>
              {c.note}
            </EndNote>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
