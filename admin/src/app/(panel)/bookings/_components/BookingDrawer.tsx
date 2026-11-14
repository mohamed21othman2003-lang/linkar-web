"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { DrawerHero, KV, Tile as OldTile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button, ButtonLink } from "@/components/ui/Button";
import { keepFocusQuiet } from "@/components/ui/focus";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { STATUS_PILL, type Booking, type DrawerBlock, type TileRow, type Tone } from "@/lib/api/bookings";
import { ltrRuns, margin, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { DotsBtn, StatusPill } from "./bits";

// CON5-04D · درج الحجز — BK-21475 (3114-35301) · BK-21474 (3114-35389) · BK-21473 (3114-35485 · بعد تواصل لينكار راضٍ 3411-242824
// · غير راضٍ 3411-242965) · BK-21472 (3114-35581) · BK-21471 (3114-35682) · BK-21470 (3114-35748) · BK-21468 (3114-35845)
// · BK-21459 (3114-35948) · BK-21452 (3114-36057) · BK-21447 (3114-36153) · BK-21476 بانتظار الدفع (3114-37017) · BK-21476 (3114-37087)
// · BK-21414 (3114-37162) · BK-21438 … BK-21398 (3114-37601 … 3114-38357) · BK-21466 … BK-21460 (3114-39411 … 3114-39701)
// · BK-21490 من المسوّق (3114-39882). الرابط ?booking=BK-…
// الشكل: 600 · رأس حشو 24·28·12 (العنوان 18/30 Bold + سطر 13/20 Light · إغلاق 40 r12 + ⋯) · المحتوى حشو 4·28·20 مسافة 12
// · رأس كحلي r16 حشو 14·16 · بطاقات r14 حشو 12·14 مسافة 4 وصفوف 30 · الأزرار تحت بخط فاصل حشو 14·28·22
const TONE: Record<Tone, string> = { success: "text-[#3bb34b]", danger: "text-danger", muted: "text-muted" };

export function BookingDrawer() {
  const url = useUrlState();
  const id = url.get("booking");
  const canEdit = useCan("bookings", "edit");
  const q = useQuery({ queryKey: ["bookings", "one", id], queryFn: () => api.bookings.get(id!), enabled: !!id });
  const b = q.data;
  const close = () => url.replace({ booking: null });
  const open = (modal: string) => url.push({ modal, b: id, booking: null });
  const roomy = !!b?.drawer.roomy;
  const legacy = !!b?.drawer.legacy;

  return (
    <Dialog.Root open={!!id} onOpenChange={(o) => !o && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content dir="rtl" onOpenAutoFocus={keepFocusQuiet} className="fixed inset-y-0 right-0 z-50 flex w-[600px] max-w-full flex-col bg-white shadow-drawer focus:outline-none">
          <div className={`flex gap-2.5 px-5 sm:px-7 ${roomy ? "pt-7 pb-3.5" : "pt-6 pb-3"} ${legacy ? "items-center" : "items-start"}`}>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Dialog.Title className="text-18 leading-[30px] font-bold text-ink">{b ? (b.drawer.legacy ? <bdi>{b.id}</bdi> : <>الحجز <bdi>{b.id}</bdi></>) : id ? <>الحجز <bdi>{id}</bdi></> : "الحجز"}</Dialog.Title>
              <Dialog.Description className={`text-13 font-light text-muted ${legacy ? "leading-[22px]" : "leading-5"}`}>{b ? ltrRuns(b.drawer.sub ?? `${b.customer.name} · ${b.provider} · فرع ${b.branch}`) : " "}</Dialog.Description>
            </div>
            {b?.drawer.menu && canEdit ? <DotsBtn label={`إجراءات ${b.id}`} onClick={() => open("actions")} /> : null}
            <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-12 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-1 sm:px-7 ${roomy ? "gap-3.5 pb-6" : "gap-3 pb-5"}`}>
            {q.isLoading ? (
              <>
                <Skeleton className="h-[104px] rounded-16" />
                <Skeleton className="h-[240px] rounded-14" />
                <Skeleton className="h-[94px] rounded-14" />
              </>
            ) : q.isError || !b ? (
              <Note tone="neutral">لم يعد هذا الحجز موجوداً.</Note>
            ) : (
              <>
                <Hero b={b} />
                {b.drawer.blocks.map((blk, i) => (
                  <Block key={i} blk={blk} b={b} open={open} />
                ))}
              </>
            )}
          </div>
          {legacy ? null : (
          <div className={`flex flex-wrap items-center gap-2.5 border-t border-border px-5 sm:px-7 ${roomy ? "pt-4 pb-6" : "pt-3.5 pb-[22px]"}`}>
            {/* Figma: «اعتماد» على اليمين وجنبه «إغلاق» (3114-39411) · غير كده «إغلاق» على الشمال و«فتح الطلب» على اليمين (3114-35301) */}
            {b?.drawer.footer.includes("approve") && canEdit ? (
              <Button variant="accent" className="h-11! px-4!" onClick={() => open("approve")}>
                <Icon name="check" size={16} />
                اعتماد
              </Button>
            ) : (
              <>
                {b?.drawer.footer.includes("request") && b.request ? (
                  <ButtonLink href={`/requests?request=${b.request.id}`} variant="secondary" className="h-[46px]! px-4!">
                    فتح الطلب
                  </ButtonLink>
                ) : null}
                <span className="flex-1" />
              </>
            )}
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-[46px]! px-4!">
                إغلاق
              </Button>
            </Dialog.Close>
          </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Hero({ b }: { b: Booking }) {
  if (b.drawer.legacy)
    return (
      <DrawerHero
        icon="calendar"
        title={b.drawer.legacy.title}
        subtitle={b.drawer.legacy.line}
        aside={
          <Pill size="S" tone="pending">
            {STATUS_PILL[b.status].label}
          </Pill>
        }
      />
    );
  const pill = b.drawer.hero.pill ?? STATUS_PILL[b.status];
  return (
    <div className={`flex flex-col rounded-16 bg-ink ${b.drawer.roomy ? "gap-2 px-[18px] py-4" : "gap-1.5 px-4 py-3.5"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-16 leading-6 font-bold text-white">{ltrRuns(b.drawer.hero.title)}</p>
        <StatusPill kind={"kind" in pill ? pill.kind : pill.tone}>{pill.label}</StatusPill>
      </div>
      {b.drawer.hero.lines.map((l) => (
        <p key={l} className="text-13 leading-5 font-light text-[#c9d1cd]">
          {ltrRuns(l)}
        </p>
      ))}
    </div>
  );
}

// loose = بطاقات الدرج الأوسع بعد الأولى (3114-39411: حشو 14 · مسافة 6 · صفوف 32)
function Tile({ title, children, empty, loose }: { title: string; children?: ReactNode; empty?: boolean; loose?: boolean }) {
  return (
    <section className={`group/tile flex flex-col rounded-14 border border-border bg-white px-3.5 ${empty || loose ? "py-3.5" : "py-3"} ${loose ? "loose gap-1.5" : "gap-1"}`}>
      <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[30px] items-start justify-between gap-3 py-[5px] text-13 leading-5 group-[.loose]/tile:py-1.5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

function Sub({ label, divider }: { label: string; divider?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 ${divider ? "pt-1.5" : "pt-1"}`}>
      {divider ? <span className="h-px bg-divider" /> : null}
      <span className="text-13 leading-5 font-semibold text-ink">{label}</span>
    </div>
  );
}

function TileRows({ rows, b, open }: { rows: TileRow[]; b: Booking; open: (m: string) => void }) {
  return (
    <>
      {rows.map((r, i) => {
        if ("sub" in r) return <Sub key={i} label={r.sub} divider={r.divider} />;
        if ("link" in r) {
          const cls = "flex h-5 w-fit items-center gap-1.5 text-13 font-semibold text-success hover:underline";
          const body = (
            <>
              {r.link}
              <Icon name="chevron-left" size={14} />
            </>
          );
          return r.href ? (
            <Link key={i} href={r.href} className={cls}>
              {body}
            </Link>
          ) : (
            <button key={i} type="button" className={cls} onClick={() => open(r.modal!)}>
              {body}
            </button>
          );
        }
        return (
          <Row key={i} k={r.k}>
            {r.call && r.v ? (
              <button type="button" onClick={() => open("call")} className="hover:underline" title="اتصال بالعميل">
                <bdi dir="ltr" className="num">
                  {r.v}
                </bdi>
              </button>
            ) : (
              <span className={r.tone ? TONE[r.tone] : undefined}>{ltrRuns(r.v)}</span>
            )}
          </Row>
        );
      })}
      {void b}
    </>
  );
}

function Block({ blk, b, open }: { blk: DrawerBlock; b: Booking; open: (m: string) => void }) {
  const loose = !!b.drawer.roomy;
  switch (blk.kind) {
    case "tile":
      // الدرج الأقدم (3114-37162): بطاقات CON5-23D — عنوان 12 Medium رمادي ومسافة 8
      if (b.drawer.legacy && blk.title === "تفاصيل الحجز")
        return (
          <OldTile title={blk.title}>
            {blk.rows.map((r, i) => ("k" in r ? <KV key={i} k={r.k}>{ltrRuns(r.v)}</KV> : null))}
          </OldTile>
        );
      return (
        <Tile title={blk.title} empty={!blk.rows.length} loose={loose && (blk.title !== "الخدمة والمنتج" || !!b.drawer.legacy)}>
          {blk.rows.length ? <TileRows rows={blk.rows} b={b} open={open} /> : null}
        </Tile>
      );
    case "contact": {
      const p = b.providerContact ?? { done: false };
      const l = b.linkar ?? { done: false };
      const rows: TileRow[] = [
        { sub: "المزوّد" },
        { k: "الحالة", v: p.done ? "تم التواصل" : "لم يتم", tone: p.done ? "success" : "muted" },
        ...(p.done ? ([{ k: "التاريخ", v: p.date ?? "—" }, { k: "بواسطة", v: p.by ?? "—" }] as TileRow[]) : []),
        { sub: "لينكار (CRM)", divider: true },
        { k: "الحالة", v: l.done ? "تم التواصل" : "لم يتم", tone: l.done ? "success" : "muted" },
        ...(l.done
          ? ([
              { k: "الموظف", v: l.employee ?? "—" },
              { k: "التاريخ", v: l.date ?? "—" },
              { k: "العميل راضٍ؟", v: l.satisfied ? "راضٍ" : "غير راضٍ", tone: l.satisfied ? "success" : "danger" },
              { k: "الملاحظات", v: l.notes || "—" },
            ] as TileRow[])
          : []),
      ];
      return (
        <Tile title="التواصل مع العميل">
          <TileRows rows={rows} b={b} open={open} />
        </Tile>
      );
    }
    case "prices": {
      const m = margin(b.sale, b.cost);
      const items: [string, string][] = [
        ["سعر البيع", blk.sale ?? `${num(b.sale)} ر.س`],
        ["سعر التكلفة", `${num(b.cost)} ر.س`],
        ["الهامش", blk.margin ?? `${num(m.value)} ر.س (${num(m.percent, m.percent % 1 ? 1 : 0)}%)`],
      ];
      return (
        <Tile title="الأسعار · شاملة الضريبة" loose={loose}>
          <div className="grid grid-cols-3 gap-3">
            {items.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="text-13 leading-5 font-light text-muted">{k}</span>
                <span className="num text-[15px] leading-5 font-semibold text-ink">{ltrRuns(v)}</span>
              </div>
            ))}
          </div>
        </Tile>
      );
    }
    case "link":
      return (
        <Link href={blk.href} className="flex min-h-[46px] items-center justify-between gap-2 rounded-12 border border-border bg-white px-3.5 py-3 text-13 font-medium text-ink hover:bg-surface-1">
          <span>{ltrRuns(blk.label)}</span>
          <Icon name="chevron-left" size={16} className="shrink-0" />
        </Link>
      );
    case "timeline":
      return (
        <div className="grid grid-cols-3 rounded-14 bg-surface-1 p-3.5">
          {blk.steps.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
              <span className={`flex size-[22px] items-center justify-center rounded-full ${s.done ? "bg-ink text-white" : "border border-border bg-white"}`}>{s.done ? <Icon name="check" size={12} /> : null}</span>
              <span className={`text-13 font-medium ${s.done ? "text-ink" : "text-muted"}`}>{s.label}</span>
              <span className="text-12 font-medium text-muted">{ltrRuns(s.sub)}</span>
            </div>
          ))}
        </div>
      );
    case "note":
      return <Note tone="info">{ltrRuns(blk.text)}</Note>;
  }
}
