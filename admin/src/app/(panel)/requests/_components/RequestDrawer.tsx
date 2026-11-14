"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { DrawerHero, KV, Tile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import type { Act, Block, DecisionOption, FooterBtn, HeroTone, ProposalRow, RequestDetail } from "@/lib/api/requests";
import { ltr, ltrRuns, margin, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { DateField } from "../../providers/_components/form-bits";
import { FIELD, HeroPill, LinkRow, RKV, RTile } from "./bits";

// CON5-03D · درج قرار الطلب — 29 إطار بنفس المكوّن، والمحتوى بلوكات من الخادم (requests.ts):
// 0417 (3114:30051) · 0414 (3114:30210) · 0420 (3114:30405) · 0422 (3114:30462) · 0424 (3114:31589) · 0425 (3114:31633)
// · 0426 (3114:31677) · 0427 (3114:31812) · 0428 (3114:31888) · 0429 (3114:31947) · 0430 (3114:31999) · 0431 (3114:32058)
// · 0432 (3114:32120) · 0433 (3114:32172) · 0402 (3114:32223) · 0418 (3114:32277) · 0434 (3114:32373) · 0421 (3114:32469)
// · 0435 (3114:32515) · 0436 (3260:193238) · 0438 (3312:210571) · 0437 (3312:210636)
// والدرج القديم: 0439 (3114:32577) · 0440 (3114:32650) · 0441 (3114:32723) · 0410 (3114:32799) · 0408 (3114:32853) · 0407 (3114:32907) · 0406 (3114:32961)
// الرابط: ?request=<REQ> · النوافذ ?modal=req-approve|req-reject|req-complete (+ m00-call / m00-preview المشتركة)
export function RequestDrawer() {
  const url = useUrlState();
  const id = url.get("request");
  const q = useQuery({ queryKey: ["requests", "one", id], queryFn: () => api.requests.get(id!), enabled: !!id, retry: false });
  const r = q.data;
  const close = () => url.replace({ request: null });
  const old = r?.drawer.style === "old";
  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && close()}
      tight={!old}
      footerClassName={old ? undefined : "sm:pb-6!"}
      title={r ? ltrRuns(r.drawer.title) : q.isError ? "الطلب" : "…"}
      subtitle={r?.drawer.subtitle}
      footer={r ? <Footer key={r.id} r={r} /> : undefined}
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[112px] rounded-16" />
          <Skeleton className="h-[200px] rounded-14" />
          <Skeleton className="h-[160px] rounded-14" />
        </>
      ) : q.isError || !r ? (
        <Note tone="neutral">{isApiError(q.error, 404) ? "لم يعد هذا الطلب موجوداً." : "تعذّر تحميل الطلب."}</Note>
      ) : (
        <Body key={r.id} r={r} />
      )}
    </Drawer>
  );
}

// اختيارات الدرج (القرار · التاريخ · الأسعار المعدّلة · الإشعار) محفوظة لكل طلب لحد ما الدرج يتقفل — الزر في الذيل بيقراها
type Draft = { option?: string; date?: string; prices?: { newCost: number; newSale: number }[]; notify: boolean; field?: string };
const drafts = new Map<string, Draft>();
function useDraft(r: RequestDetail) {
  const [, force] = useState(0);
  if (!drafts.has(r.id)) {
    const dec = r.drawer.blocks.find((b) => b.kind === "decision");
    const opt = dec?.kind === "decision" ? dec.options[0] : undefined;
    const prop = r.drawer.blocks.find((b) => b.kind === "proposal");
    drafts.set(r.id, { option: opt?.key, date: opt?.field?.date, prices: prop?.kind === "proposal" ? prop.rows.map((x) => ({ newCost: x.newCost, newSale: x.newSale })) : undefined, notify: true });
  }
  const d = drafts.get(r.id)!;
  const set = (patch: Partial<Draft>) => {
    drafts.set(r.id, { ...d, ...patch });
    force((n) => n + 1);
  };
  return [d, set] as const;
}

const decided = (r: RequestDetail) => r.status === "approved" || r.status === "rejected";
const PILL_FOR: Partial<Record<RequestDetail["status"], { label: string; tone: HeroTone }>> = {
  approved: { label: "معتمد", tone: "approved" },
  rejected: { label: "مرفوض", tone: "rejected" },
  waiting: { label: "بانتظار المزوّد", tone: "pending" },
};

function Body({ r }: { r: RequestDetail }) {
  const [d, set] = useDraft(r);
  const run = useAct(r);
  const h = r.drawer.hero;
  const pill = PILL_FOR[r.status] ?? h.pill;
  const done = decided(r);
  const blocks = r.drawer.blocks.filter((b) => !(done && (b.kind === "decision" || b.kind === "toggle" || b.kind === "field")));

  if (r.drawer.style === "old")
    return (
      <>
        <DrawerHero
          icon={h.icon ?? "edit"}
          title={ltrRuns(h.title)}
          subtitle={h.lines[0]}
          aside={
            <HeroPill small tone={pill.tone}>
              {pill.label}
            </HeroPill>
          }
        />
        {blocks.map((b, i) => (
          <OldBlock key={i} b={b} run={run} />
        ))}
      </>
    );

  return (
    <>
      <div className="flex flex-col gap-2 rounded-16 bg-ink px-[18px] py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-16 leading-6 font-bold text-white">{ltrRuns(h.title)}</p>
          <HeroPill tone={pill.tone}>{pill.label}</HeroPill>
        </div>
        {h.lines.map((l) => (
          <p key={l} className="text-13 leading-5 font-light text-[#c9d1cd]">
            {ltrRuns(l)}
          </p>
        ))}
      </div>
      {blocks.map((b, i) => (
        <NewBlock key={i} b={b} d={d} set={set} run={run} />
      ))}
    </>
  );
}

function NewBlock({ b, d, set, run }: { b: Block; d: Draft; set: (p: Partial<Draft>) => void; run: (a: Act) => void }) {
  switch (b.kind) {
    case "kv":
      return (
        <RTile title={b.title} dense={b.dense}>
          {b.rows.map(([k, v], i) =>
            !k ? (
              <div key={i} aria-hidden className={b.dense ? "h-[30px]" : "h-8"} />
            ) : (
            <RKV key={k} k={ltrRuns(k)} dense={b.dense}>
              {ltrRuns(v)}
            </RKV>
            ),
          )}
          {b.hint ? <p className="text-12 leading-5 font-medium text-muted">{b.hint}</p> : null}
        </RTile>
      );
    case "proposal":
      return (
        <RTile title={b.title}>
          <Proposal rows={b.rows} value={d.prices ?? []} onChange={(prices) => set({ prices })} />
        </RTile>
      );
    case "decision": {
      const list = (
        <div role="radiogroup" aria-label="قرار لينكار" className={`flex flex-col ${b.tile ? "gap-1.5" : "gap-2"}`}>
          {b.options.map((o) => (
            <Option key={o.key} o={o} on={d.option === o.key} onPick={() => set({ option: o.key, date: o.field?.date ?? d.date })} date={d.date} onDate={(date) => set({ date })} />
          ))}
        </div>
      );
      return b.tile ? <RTile>{list}</RTile> : list;
    }
    case "field":
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-12 leading-5 font-medium text-muted">{b.label}</span>
          <span className={`${FIELD} focus-within:border-[1.5px] focus-within:border-ink`}>
            <input className="min-w-0 flex-1 bg-transparent outline-none" value={d.field ?? b.value} onChange={(e) => set({ field: e.target.value })} />
            <Icon name="calendar" size={16} className="shrink-0 text-ink" />
          </span>
        </label>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-13 leading-5 font-medium text-ink">{b.label}</span>
          <Switch checked={d.notify} onCheckedChange={(notify) => set({ notify })} label={b.label} />
        </div>
      );
    case "link":
      return <LinkRow onClick={() => run(b.act)}>{ltrRuns(b.label)}</LinkRow>;
    default:
      return null;
  }
}

/** خيار قرار (Figma «Option»): المختار #F7FBE9 بإطار كحلي 1.5 · غير المختار أبيض بإطار — الدائرة 18 على الشمال · حقل التاريخ جوه المختار */
function Option({ o, on, onPick, date, onDate }: { o: DecisionOption; on: boolean; onPick: () => void; date?: string; onDate: (v: string) => void }) {
  return (
    <div
      role="radio"
      aria-checked={on}
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && e.target === e.currentTarget && (e.preventDefault(), onPick())}
      className={`flex cursor-pointer flex-col gap-2 rounded-12 px-3.5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ink ${on ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={`text-14 leading-[22px] text-ink ${on ? "font-semibold" : "font-medium"}`}>{o.title}</span>
          {o.sub ? <span className="text-12 leading-[18px] font-light text-muted">{ltrRuns(o.sub)}</span> : null}
        </span>
        <span aria-hidden className={`mt-0.5 size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
      </div>
      {on && o.field ? (
        <label className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span className="text-12 leading-5 font-medium text-muted">{o.field.label}</span>
          <DateField value={date ?? o.field.date} onChange={onDate} min="2026-10-14" className="h-[42px] bg-white" />
        </label>
      ) : null}
    </div>
  );
}

/** «اقتراح المزوّد» (Figma «Proposal»): r12 بإطار · رأس #F4F6F5 · صفوف 44 · حشو 8·10 · مسافة 6 — التكلفة والبيع المقترحين حقول (53×28 r6) والهامش يتحسب */
function Proposal({ rows, value, onChange }: { rows: ProposalRow[]; value: { newCost: number; newSale: number }[]; onChange: (v: { newCost: number; newSale: number }[]) => void }) {
  const m = (sale: number, cost: number) => {
    const x = margin(sale, cost);
    return ltr(`${num(x.value)} · ${x.percent}%`);
  };
  const edit = (i: number, k: "newCost" | "newSale", raw: string) => {
    const n = Number(raw.replace(/\D/g, ""));
    onChange(value.map((v, j) => (j === i ? { ...v, [k]: n } : v)));
  };
  const cell = "min-w-0 whitespace-nowrap text-12 leading-[18px]";
  // الأعمدة من Figma: نص 70 · حقل 53 (الحجم · التكلفة · المقترحة · البيع · المقترح · الهامش · بعد الاقتراح)
  const COLS = "grid grid-cols-[70px_70px_53px_70px_53px_70px_70px] items-center gap-1.5 px-2.5 py-2";
  return (
    <div className="overflow-x-auto rounded-12 border border-border">
      <div className="min-w-[492px]">
        <div className={`grid min-h-[88px] grid-cols-[repeat(7,65px)] items-center gap-1.5 px-2.5 py-2 bg-surface-1 text-12 leading-[18px] font-medium text-muted`}>
          {["الحجم", "التكلفة الحالية", "التكلفة المقترحة", "سعر البيع الحالي · شامل الضريبة", "سعر البيع المقترح", "الهامش الحالي", "الهامش بعد الاقتراح"].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {rows.map((r, i) => {
          const v = value[i] ?? { newCost: r.newCost, newSale: r.newSale };
          return (
            <div key={r.size} className={`${COLS} min-h-11 bg-white`}>
              <span className={cell}>{ltrRuns(r.size)}</span>
              <span className={`${cell} num`}>{num(r.cost)}</span>
              <PriceInput label={`التكلفة المقترحة · ${r.size}`} value={v.newCost} onChange={(s) => edit(i, "newCost", s)} />
              <span className={`${cell} num`}>{num(r.sale)}</span>
              <PriceInput label={`سعر البيع المقترح · ${r.size}`} value={v.newSale} onChange={(s) => edit(i, "newSale", s)} />
              <span className={`${cell} num`}>{m(r.sale, r.cost)}</span>
              <span className={`${cell} num font-semibold text-success`}>{m(v.newSale, v.newCost)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function PriceInput({ value, onChange, label }: { value: number; onChange: (v: string) => void; label: string }) {
  return (
    <input
      inputMode="numeric"
      aria-label={label}
      value={num(value)}
      onChange={(e) => onChange(e.target.value)}
      className="num h-7 w-[53px] rounded-[6px] border border-[#c9d1ce] bg-white px-1 text-center text-12 leading-[18px] font-semibold text-ink outline-none focus:border-ink"
    />
  );
}

// ───────────── الدرج القديم ─────────────
function OldBlock({ b, run }: { b: Block; run: (a: Act) => void }) {
  switch (b.kind) {
    case "oldKv":
      return (
        <Tile title={b.title}>
          {b.rows.map(([k, v]) => (
            <KV key={k} k={k}>
              {ltrRuns(v)}
            </KV>
          ))}
        </Tile>
      );
    case "beforeAfter":
      return (
        <Tile title={b.title}>
          <div className="flex gap-2.5">
            <Side label="الحالي" className="bg-surface-1">
              {ltrRuns(b.current)}
            </Side>
            <Side label="المطلوب" className="bg-success-tint">
              {ltrRuns(b.requested)}
            </Side>
          </div>
        </Tile>
      );
    case "docs":
      return (
        <Tile title="المرفقات">
          {b.docs.map((doc) => (
            <div key={doc.name} className="flex items-center gap-2.5 rounded-10 bg-surface-1 px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-white text-ink">
                <Icon name="file" size={16} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-13 leading-[22px] font-medium text-ink">{doc.name}</span>
                <span className="truncate text-12 leading-5 font-medium text-muted">{ltrRuns(doc.file)}</span>
              </span>
              <HeroPill small tone="approved">
                صالح
              </HeroPill>
              <button type="button" onClick={() => run({ kind: "preview", doc: doc.file })} className="flex h-5 shrink-0 items-center gap-1.5 rounded-8 text-12 leading-5 font-medium text-ink hover:underline">
                عرض
                <Icon name="download" size={14} />
              </button>
            </div>
          ))}
        </Tile>
      );
    default:
      return null;
  }
}
function Side({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-0.5 rounded-12 p-3 ${className}`}>
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
      <span className="text-13 leading-[22px] font-medium text-ink">{children}</span>
    </div>
  );
}

// ───────────── الإجراءات ─────────────
function useAct(r: RequestDetail) {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const finish = (t: string) => {
    qc.invalidateQueries({ queryKey: ["requests"] });
    qc.invalidateQueries({ queryKey: ["providers"] });
    url.replace({ request: null });
    toast("تم", t);
  };
  const approve = useMutation({ mutationFn: () => api.requests.approve(r.id), onSuccess: (x) => finish(x.toast) });
  const decide = useMutation({
    mutationFn: () => {
      const d = drafts.get(r.id);
      return api.requests.decide(r.id, { option: d?.option ?? "", date: d?.date, prices: d?.prices, notify: d?.notify });
    },
    onSuccess: (x) => finish(x.toast),
  });
  const run = (a: Act) => {
    switch (a.kind) {
      case "call":
        return url.push({ modal: "m00-call", phone: a.phone, ref: r.id });
      case "preview":
        return url.push({ modal: "m00-preview", doc: a.doc });
      case "href":
        return router.push(a.href);
      case "complete":
        return url.push({ modal: "req-complete" });
      case "reject":
        return url.push({ modal: "req-reject" });
      case "approve":
        return r.drawer.style === "old" ? url.push({ modal: "req-approve" }) : approve.mutate();
      case "decide": {
        const dec = r.drawer.blocks.find((b) => b.kind === "decision");
        const opt = dec?.kind === "decision" ? dec.options.find((o) => o.key === drafts.get(r.id)?.option) : undefined;
        return opt?.effect === "reject" ? url.push({ modal: "req-reject" }) : decide.mutate();
      }
      case "close":
        return url.replace({ request: null });
    }
  };
  return Object.assign(run, { pending: approve.isPending || decide.isPending });
}

function Footer({ r }: { r: RequestDetail }) {
  const run = useAct(r);
  const canDecide = useCan("requests", "decide");
  const done = decided(r);
  if (r.drawer.style === "old") {
    if (done || !canDecide || !r.drawer.old) return <Button variant="secondary" className="h-[50px]!" onClick={() => run({ kind: "close" })}>إغلاق</Button>;
    return (
      <>
        <Button className="h-12" onClick={() => run({ kind: "approve" })}>
          {r.drawer.old.approveLabel}
          <Icon name="check" size={18} />
        </Button>
        <Button variant="secondary" className="h-[50px]!" onClick={() => run({ kind: "complete" })}>
          طلب استكمال
        </Button>
        <Button variant="secondary" className="h-[50px]! text-danger-strong!" onClick={() => run({ kind: "reject" })}>
          رفض
        </Button>
      </>
    );
  }
  const f = r.drawer.footer;
  const close: FooterBtn = { label: "إغلاق", act: { kind: "close" } };
  const locked = done || !canDecide || f?.primary?.act.kind === "close";
  const primary = locked ? undefined : f?.primary;
  const secondary = locked ? close : f?.secondary;
  return (
    <div className="flex items-center justify-between gap-2.5">
      {primary ? (
        <Button variant="accent" className="h-11 px-4" loading={run.pending} onClick={() => run(primary.act)}>
          {primary.label}
          {primary.icon && !run.pending ? <Icon name={primary.icon} size={16} /> : null}
        </Button>
      ) : null}
      {secondary ? (
        <Button variant="secondary" className="h-[46px]! px-4" onClick={() => run(secondary.act)}>
          {secondary.label}
          {secondary.icon ? <Icon name={secondary.icon} size={16} /> : null}
        </Button>
      ) : null}
    </div>
  );
}
