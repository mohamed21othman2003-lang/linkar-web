"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, TextInput } from "@/components/ui/Field";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  BRANCH_OPTS,
  CATEGORIES,
  CHANNELS,
  PERIODS,
  PROVIDER_OPTS,
  CANCEL_REASONS,
  EXTEND_OPTIONS,
  EXTEND_REASONS,
  TRANSFER_BRANCHES,
  TRANSFER_DEFAULTS,
  TRANSFER_REASONS,
  UNPAID_REASONS,
  bookingsMutations as M,
  extendLabel,
  type Booking,
} from "@/lib/api/bookings";
import { arDate, ltrRuns, margin, num } from "@/lib/format";
import { useCan, useMe } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";

// نوافذ الحجوزات — كل نافذة في الرابط ?modal=…&b=BK-… (القسم 2.3) عشان زر الرجوع يقفلها
export function BookingOverlays() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("b");
  if (modal === "notify-crm" || modal === "notify-providers") return <NotifyModal kind={modal} />;
  if (modal === "filter") return <FilterModal />;
  if (!modal || !id) return null;
  return <BookingModal modal={modal} id={id} />;
}

function useClose() {
  const url = useUrlState();
  return () => url.replace({ modal: null, b: null });
}

/** إجراء على الخادم + رسالة التأكيد من الخادم (CON5-04T) + تحديث القوائم */
function useAct<V>(fn: (v: V) => Promise<{ toast: string }>, after?: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  const close = useClose();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      toast(r.toast);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      (after ?? close)();
    },
  });
}

function BookingModal({ modal, id }: { modal: string; id: string }) {
  const q = useQuery({ queryKey: ["bookings", "one", id], queryFn: () => api.bookings.get(id) });
  const close = useClose();
  const b = q.data;
  if (!b)
    return (
      <Modal open onOpenChange={(o) => !o && close()} title={q.isError ? "تعذّر تحميل الحجز" : "…"}>
        {q.isError ? <p className="text-13 text-muted">لم يعد هذا الحجز موجوداً.</p> : <Skeleton className="h-40 rounded-12" />}
      </Modal>
    );
  switch (modal) {
    case "actions":
      return <ActionsSheet b={b} />;
    case "cancel":
      return <CancelModal b={b} />;
    case "transfer":
      return <TransferModal b={b} />;
    case "extend":
      return <ExtendModal b={b} />;
    case "call":
      return <CallModal b={b} />;
    case "contact-log":
      return <LinkarContactModal b={b} />;
    case "approve":
      return <ApproveModal b={b} />;
    case "rate":
      return <RateModal b={b} />;
    case "reschedule":
      return <RescheduleModal b={b} />;
    case "payment":
      return <PaymentModal b={b} />;
    case "cancel-unpaid":
      return <CancelUnpaidModal b={b} />;
    default:
      return null;
  }
}

// ───────────── قطع النوافذ ─────────────
const SEC = "h-[46px]! px-4!";
const PRI = "h-11! px-4!";

/** ملاحظة داخل النوافذ (Figma: الأيقونة على الشمال) — info أزرق بنص كحلي · warning بيج بنص بني */
function MNote({ tone = "info", icon = "info", children }: { tone?: "info" | "warning"; icon?: UiGlyph; children: ReactNode }) {
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[21px] font-light ${tone === "info" ? "bg-info-tint text-ink" : "bg-[#fdf3e1] text-warning"}`}>
      <p className="min-w-0 flex-1">{children}</p>
      <Icon name={icon} size={16} className="mt-0.5 shrink-0 text-ink" />
    </div>
  );
}

/** صف مفتاح/قيمة 32 (حشو 6) */
function MKV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

const opts = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

// الحقول 40 في نوافذ التحويل والتمديد والدفع، و44 في الباقي (tall)
function SelectField({ label, value, options, onChange, tall }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; tall?: boolean }) {
  return <Field label={label}>{(fid) => <Select id={fid} value={value} options={options} onChange={onChange} className={`[&>span]:text-14! [&>span]:font-normal! ${tall ? "" : "h-10!"}`} />}</Field>;
}

function TextArea({ label, value, onChange, rows = 3, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string }) {
  return (
    <Field label={label}>
      {(fid) => (
        <textarea
          id={fid}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full resize-none rounded-10 border border-border bg-white px-3 py-2.5 ${className ?? ""} text-14 leading-[22px] text-ink outline-none placeholder:font-light placeholder:text-muted focus:border-ink`}
        />
      )}
    </Field>
  );
}

/** اختيار بإطار (Option / Radio في Figma): المختار أخضر فاتح بإطار كحلي */
function OptionCard({ selected, onClick, title, sub, className }: { selected: boolean; onClick: () => void; title: string; sub?: string; className?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-start gap-2.5 rounded-12 text-start ${selected ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"} ${className ?? ""}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-14 text-ink ${selected ? "font-semibold" : "font-medium"}`}>{title}</span>
        {sub ? <span className="text-12 font-light text-muted">{sub}</span> : null}
      </span>
      <span className={`mt-0.5 size-[18px] shrink-0 rounded-full ${selected ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
    </button>
  );
}

const sub = (b: Booking) => `${b.customer.name} · ${b.provider} · ${b.branch}`;

// ───────────── CON5-04A · إجراءات (3114-37213 … 3114-37569 · 3344-222150) ─────────────
type Item = { label: string; icon: UiGlyph; run: () => void; danger?: boolean; divider?: boolean };
function ActionsSheet({ b }: { b: Booking }) {
  const url = useUrlState();
  const router = useRouter();
  const close = useClose();
  const go = (modal: string) => url.replace({ modal, b: b.id });
  const resend = useAct(() => M.resendVoucher(b.id));
  const payLink = useAct(() => M.resendPayLink(b.id));
  const invoice = useAct(() => M.issueInvoice(b.id));
  const warranty = useAct(() => M.issueWarranty(b.id));
  const reviewed = b.drawer.blocks.some((x) => x.kind === "tile" && x.rows.some((r) => "k" in r && r.k === "التقييم"));
  let state = "";
  let items: Item[] = [];
  switch (b.status) {
    case "awaiting-visit":
      state = "بانتظار الزيارة";
      items = [
        { label: "تحويل لمقدّم خدمة أو فرع آخر", icon: "navigation", run: () => go("transfer") },
        { label: "تمديد صلاحية القسيمة", icon: "calendar", run: () => go("extend") },
        { label: "إعادة إرسال القسيمة", icon: "message", run: () => resend.mutate(undefined) },
        { label: "إلغاء واسترداد", icon: "x", danger: true, divider: true, run: () => go("cancel") },
      ];
      break;
    case "linkar-decision":
      state = `بانتظار قرار لينكار (${b.request?.kind === "reschedule" ? "إعادة جدولة" : "تعذّر"})`;
      items =
        b.request?.kind === "reschedule"
          ? [{ label: `فتح طلب إعادة الجدولة ${b.request.id}`, icon: "alert", run: () => go("reschedule") }]
          : [{ label: `فتح طلب التعذّر ${b.request?.id ?? ""}`, icon: "alert", run: () => router.push(`/requests?request=${b.request?.id ?? ""}`) }];
      break;
    case "approved":
    case "completed":
      state = b.status === "approved" ? "مكتمل" : "بانتظار الاعتماد";
      items = reviewed
        ? [{ label: "الفاتورة الضريبية", icon: "receipt", run: () => router.push(`/invoices?booking=${b.id}`) }]
        : [
            { label: "تقييم بالنيابة عن العميل", icon: "file", run: () => go("rate") },
            ...(b.status === "approved" ? [{ label: "إصدار شهادة ضمان", icon: "check" as UiGlyph, run: () => warranty.mutate(undefined) }] : []),
            { label: "إصدار فاتورة ضريبية", icon: "receipt", run: () => invoice.mutate(undefined) },
          ];
      break;
    case "cancelled":
      state = "ملغى ومسترد";
      items = [{ label: "الإشعار الدائن", icon: "receipt", run: () => router.push(`/invoices?booking=${b.id}&type=credit`) }];
      break;
    case "pending-payment":
      state = "بانتظار الدفع";
      items = [
        { label: "إعادة إرسال رابط الدفع", icon: "message", run: () => payLink.mutate(undefined) },
        { label: "تسجيل دفعة بتحويل بنكي", icon: "wallet", run: () => go("payment") },
        { label: "إلغاء الحجز", icon: "x", danger: true, divider: true, run: () => go("cancel-unpaid") },
      ];
      break;
  }
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={b.id} subtitle={ltrRuns(`${sub(b)} · ${state}`)} width={440}>
      <div className="flex flex-col gap-0.5">
        {items.map((it) => (
          <div key={it.label} className="contents">
            {it.divider ? <span className="my-0.5 h-px bg-border" /> : null}
            <button type="button" onClick={it.run} className={`flex h-11 items-center gap-2.5 rounded-10 px-3 text-14 font-medium hover:bg-surface-1 ${it.danger ? "text-danger" : "text-ink"}`}>
              <Icon name={it.icon} size={18} className={`shrink-0 ${it.danger ? "text-danger" : "text-ink"}`} />
              <span className="flex-1 text-start">{ltrRuns(it.label)}</span>
              <Icon name="chevron-left" size={16} className="shrink-0 text-muted" />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ───────────── CON5-04M · إلغاء واسترداد (3114-34255 …) · بلا صلاحية الاسترداد (3114-33625) ─────────────
function CancelModal({ b }: { b: Booking }) {
  const close = useClose();
  const canDecide = useCan("bookings", "decide");
  const { data: me } = useMe();
  const [reason, setReason] = useState(b.request?.kind === "unable" ? CANCEL_REASONS[1] : CANCEL_REASONS[0]);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const cancel = useAct(() => M.cancelRefund(b.id, { reason, notify }));
  const ask = useAct(() => M.requestCancel(b.id));
  if (!canDecide)
    return (
      <Modal open onOpenChange={(o) => !o && close()} title="إلغاء الحجز يتطلب صلاحية" subtitle={me ? `${me.name} · ${me.role}` : undefined} width={520}
        footer={
          <>
            <Button className={PRI} loading={ask.isPending} onClick={() => ask.mutate(undefined)}>
              إرسال للينكار
              <Icon name="share" size={16} />
            </Button>
            <Button variant="secondary" className={SEC} onClick={close}>
              تراجع
            </Button>
          </>
        }
      >
        <MNote tone="warning" icon="lock">
          دورك «{me?.role ?? "خدمة العملاء"}» لا يملك صلاحية الإلغاء والاسترداد. أرسل الطلب للينكار مع السبب، ويصلك القرار هنا.
        </MNote>
        <SelectField tall label="سبب الإلغاء" value={reason} options={opts(CANCEL_REASONS)} onChange={setReason} />
        <Field label="ملاحظة للينكار">{(fid) => <TextInput id={fid} value={note} onChange={(e) => setNote(e.target.value)} placeholder="العميل سافر ويطلب الاسترداد" />}</Field>
      </Modal>
    );
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="إلغاء الحجز واسترداد المبلغ" subtitle={ltrRuns(`${b.id} · ${b.customer.name} · ${b.service}`)} width={560}
      footer={
        <>
          <Button variant="secondary" className={SEC} onClick={close}>
            تراجع
          </Button>
          <Button variant="danger" className={PRI} loading={cancel.isPending} onClick={() => cancel.mutate(undefined)}>
            إلغاء واسترداد {num(b.sale)} ر.س
          </Button>
        </>
      }
    >
      <SelectField tall label="سبب الإلغاء (من القائمة المرجعية)" value={reason} options={opts(CANCEL_REASONS)} onChange={setReason} />
      <MNote>سياسة الإلغاء: القسيمة لم تُستخدم ولم تنتهِ صلاحيتها، فالاسترداد كامل. بعد استخدام القسيمة لا يُلغى الحجز ويُعالج كشكوى.</MNote>
      <>
        <MKV k="المبلغ المسترد · شامل الضريبة">{num(b.sale)} ر.س · كامل</MKV>
        <MKV k="وسيلة الاسترداد">{ltrRuns(`${b.payMethod ?? "مدى"} · وسيلة الدفع الأصلية · خلال 5 أيام عمل`)}</MKV>
        <MKV k="أثره على المزوّد">لا يُضاف لمستحقات {b.provider}، ويظهر «ملغى» مع السبب</MKV>
        <MKV k="الإشعار الدائن">يصدر تلقائياً بعد الاسترداد</MKV>
      </>
      <label className="flex items-center justify-between gap-2.5 text-13 font-medium text-ink">
        إشعار العميل والمزوّد برسالة
        <Switch checked={notify} onCheckedChange={setNotify} label="إشعار العميل والمزوّد برسالة" />
      </label>
      <p className="text-12 font-light text-muted">الصلاحية المطلوبة: «الإلغاء والاسترداد» · لينكار والمالية</p>
    </Modal>
  );
}

// ───────────── CON5-04M · تحويل الحجز (3114-34295 …) ─────────────
function TransferModal({ b }: { b: Booking }) {
  const close = useClose();
  const d = TRANSFER_DEFAULTS[b.id] ?? { mode: "branch" as const, ...(TRANSFER_BRANCHES.find((x) => x.providerId === b.providerId && x.branchCode !== b.branchCode) ?? TRANSFER_BRANCHES[0]), reason: TRANSFER_REASONS[1] };
  const [mode, setMode] = useState<"provider" | "branch">(d.mode);
  const [code, setCode] = useState(d.branchCode);
  const [providerId, setProviderId] = useState(d.providerId);
  const [reason, setReason] = useState(d.reason);
  const [consent, setConsent] = useState(true);
  const target = TRANSFER_BRANCHES.find((x) => x.branchCode === code) ?? TRANSFER_BRANCHES[0];
  const providers = [...new Map(TRANSFER_BRANCHES.map((x) => [x.providerId, x.provider])).entries()].map(([value, label]) => ({ value, label }));
  const branches = TRANSFER_BRANCHES.filter((x) => x.providerId === providerId && x.branchCode !== b.branchCode).map((x) => ({ value: x.branchCode, label: x.label }));
  const cost = mode === "provider" && target.providerId === d.providerId && d.cost ? d.cost : b.cost;
  const mNow = margin(b.sale, b.cost);
  const mNew = margin(b.sale, cost);
  const simple = b.manual;
  const go = useAct(() => M.transfer(b.id, { ...target, cost: cost !== b.cost ? cost : undefined, reason }));
  const pickProvider = (v: string) => {
    setProviderId(v);
    const first = TRANSFER_BRANCHES.find((x) => x.providerId === v && x.branchCode !== b.branchCode);
    if (first) setCode(first.branchCode);
  };
  const setModeAnd = (m: "provider" | "branch") => {
    setMode(m);
    if (m === "branch") pickProvider(b.providerId);
  };
  const row = (k: string, now: ReactNode, next: ReactNode) => (
    <div className="grid grid-cols-[1.35fr_1fr_1fr] border-t border-divider px-2.5 py-1.5 text-13">
      <span className="font-medium text-ink">{k}</span>
      <span className="text-ink">{typeof now === "string" ? ltrRuns(now) : now}</span>
      <span className="text-ink">{typeof next === "string" ? ltrRuns(next) : next}</span>
    </div>
  );
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={`تحويل الحجز ${b.id}`} subtitle={ltrRuns(`${b.customer.name} · ${b.service} · ${b.size}`)} width={simple ? 520 : 600} className="gap-2.5! px-[22px]! py-5!"
      footer={
        <>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
          <Button className={PRI} loading={go.isPending} disabled={mode === "provider" && !!d.consent && !consent} onClick={() => go.mutate(undefined)}>
            تحويل الحجز
            <Icon name="check" size={16} />
          </Button>
        </>
      }
    >
      {simple ? (
        <>
          <SelectField label="الفرع الجديد" value={code} options={TRANSFER_BRANCHES.filter((x) => x.branchCode !== b.branchCode).map((x) => ({ value: x.branchCode, label: `${x.provider} · ${x.label}` }))} onChange={setCode} />
          <SelectField label="سبب التحويل" value={reason} options={opts(TRANSFER_REASONS)} onChange={setReason} />
          <MKV k="سعر التكلفة · شامل الضريبة">{num(cost)} ر.س · دون تغيير</MKV>
        </>
      ) : (
        <>
          <p className="text-13 font-medium text-muted">إلى أين يتحوّل الحجز؟</p>
          <div role="radiogroup" className="grid grid-cols-2 gap-2.5">
            <OptionCard className="px-3.5 py-3" selected={mode === "branch"} onClick={() => setModeAnd("branch")} title="فرع آخر لنفس مقدّم الخدمة" sub="نفس الخدمة ونفس سعر التكلفة" />
            <OptionCard className="px-3.5 py-3" selected={mode === "provider"} onClick={() => setModeAnd("provider")} title="مقدّم خدمة آخر" sub="خدمة مماثلة · بموافقة العميل" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <SelectField label="مقدّم الخدمة" value={providerId} options={mode === "branch" ? providers.filter((p) => p.value === b.providerId) : providers.filter((p) => p.value !== b.providerId)} onChange={pickProvider} />
            <SelectField label="الفرع" value={code} options={branches} onChange={setCode} />
          </div>
          {mode === "provider" && d.service ? <SelectField label="الخدمة لدى الوجهة" value={d.service} options={opts([d.service])} onChange={() => {}} /> : null}
          <div className="overflow-hidden rounded-10 border border-border">
            <div className="grid grid-cols-[1.35fr_1fr_1fr] bg-surface-1 px-2.5 py-1.5 text-12 font-medium text-muted">
              <span />
              <span>الحالي</span>
              <span>بعد التحويل</span>
            </div>
            {row("الفرع", `${b.provider} · ${b.branch}`, `${target.provider} · ${target.branch}`)}
            {row("سعر التكلفة · شامل الضريبة", `${num(b.cost)} ر.س`, `${num(cost)} ر.س`)}
            {row("هامش لينكار", <bdi dir="ltr">{`${num(mNow.value)} · ${num(mNow.percent, mNow.percent % 1 ? 1 : 0)}%`}</bdi>, <bdi dir="ltr">{`${num(mNew.value)} · ${num(mNew.percent, mNew.percent % 1 ? 1 : 0)}%`}</bdi>)}
            {row("ما دفعه العميل", `${num(b.sale)} ر.س`, `${num(b.sale)} ر.س · دون تغيير`)}
          </div>
          <SelectField label="سبب التحويل" value={reason} options={opts(TRANSFER_REASONS)} onChange={setReason} />
        </>
      )}
      {b.voucherCode && b.validUntil ? <MKV k="القسيمة">{ltrRuns(`${b.voucherCode} · تبقى صالحة حتى ${arDate(b.validUntil)}`)}</MKV> : null}
      {mode === "provider" && d.consent && !simple ? <Checkbox label={d.consent} checked={consent} onChange={(e) => setConsent(e.target.checked)} /> : null}
      {simple ? null : (
        <MNote>
          تصل رسالة للعميل بالفرع الجديد. يظهر الحجز في لوحة {target.provider} ويُضاف لمستحقاتها بسعرها المتفق عليه عند التنفيذ، وفي لوحة {b.provider} بحالة «حُوِّل بقرار لينكار».
        </MNote>
      )}
    </Modal>
  );
}

// ───────────── CON5-04M · تمديد الصلاحية (3114-34918 …) ─────────────
function ExtendModal({ b }: { b: Booking }) {
  const close = useClose();
  const [days, setDays] = useState("7");
  const [reason, setReason] = useState(EXTEND_REASONS[0]);
  const base = b.validUntil ?? "2026-10-28";
  const next = new Date(`${base}T12:00:00`);
  next.setDate(next.getDate() + Number(days));
  const go = useAct(() => M.extend(b.id, Number(days)));
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="تمديد صلاحية القسيمة" className="gap-3! p-[22px]!" subtitle={ltrRuns(`${b.id} · ${b.customer.name} · ${b.voucherCode ?? ""}`)} width={520}
      footer={
        <>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
          <Button className={PRI} loading={go.isPending} onClick={() => go.mutate(undefined)}>
            تمديد الصلاحية
            <Icon name="check" size={16} />
          </Button>
        </>
      }
    >
      <MKV k="الصلاحية الحالية">{arDate(base)}</MKV>
      <SelectField label="مدة التمديد" value={days} options={EXTEND_OPTIONS.map((d) => ({ value: String(d), label: extendLabel(d) }))} onChange={setDays} />
      <MKV k="الصلاحية الجديدة">{arDate(next.toISOString())}</MKV>
      <SelectField label="السبب" value={reason} options={opts(EXTEND_REASONS)} onChange={setReason} />
    </Modal>
  );
}

// ───────────── CON5-04M · اتصال (3114-34885 …) ─────────────
function CallModal({ b }: { b: Booking }) {
  const close = useClose();
  const toast = useToast();
  const log = useAct(() => M.logCall(b.id));
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="الاتصال بالعميل" className="gap-3! p-[22px]!" subtitle={ltrRuns(`${b.customer.name} · ${b.id}`)} width={480}
      footer={
        <>
          <Button
            variant="secondary"
            className={SEC}
            onClick={() => {
              void navigator.clipboard?.writeText(b.customer.phone.replace(/\s/g, "")).catch(() => {});
              toast(`نُسخ رقم ${b.customer.name}`);
            }}
          >
            نسخ الرقم
          </Button>
          <Button
            className={PRI}
            loading={log.isPending}
            onClick={() => {
              window.location.href = `tel:${b.customer.phone.replace(/\s/g, "")}`;
              log.mutate(undefined);
            }}
          >
            اتصال
            <Icon name="phone" size={16} />
          </Button>
        </>
      }
    >
      <MKV k="رقم الجوال">
        <bdi dir="ltr" className="num">
          {b.customer.phone}
        </bdi>
      </MKV>
    </Modal>
  );
}

// ───────────── CON5-04M · تواصل لينكار (3400-241727 راضٍ · 3400-241783 غير راضٍ) ─────────────
function LinkarContactModal({ b }: { b: Booking }) {
  const close = useClose();
  const [done, setDone] = useState(true);
  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState(false);
  const go = useAct(() => M.linkarContact(b.id, { satisfied: !!satisfied, notes }));
  const save = () => (satisfied == null ? setErr(true) : go.mutate(undefined));
  const radio = (v: boolean, label: string) => (
    <button type="button" role="radio" aria-checked={satisfied === v} onClick={() => (setSatisfied(v), setErr(false))} className={`flex h-12 flex-1 items-center justify-between rounded-12 border px-3 text-13 font-medium text-ink ${satisfied === v ? "border-ink" : err ? "border-danger" : "border-border"}`}>
      {label}
      <span className={`flex size-5 items-center justify-center rounded-full border ${satisfied === v ? "border-ink" : "border-border"}`}>{satisfied === v ? <span className="size-2.5 rounded-full bg-ink" /> : null}</span>
    </button>
  );
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={`التواصل مع العميل · ${b.id}`} subtitle={ltrRuns(`${sub(b)} · ${b.visitDate ?? ""}`)} width={500}
      footer={
        <>
          <Button variant="accent" className="h-12! px-4!" loading={go.isPending} disabled={!done} onClick={save}>
            حفظ
          </Button>
          <Button variant="secondary" className="h-[50px]! px-4!" onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <label className="flex h-[52px] items-center justify-between gap-2.5 rounded-12 border border-border px-3 text-13 font-medium text-ink">
        تم التواصل
        {/* مفتاح هذه النافذة 44×24 بمقبض أخضر (3400-241727) */}
        <button type="button" role="switch" aria-checked={done} aria-label="تم التواصل" onClick={() => setDone(!done)} className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ${done ? "justify-start bg-ink" : "justify-end bg-[#cfd6d3]"}`}>
          <span className={`size-5 rounded-full ${done ? "bg-lime" : "bg-white"}`} />
        </button>
      </label>
      <Field label="العميل راضٍ؟" error={err ? "اختر نعم أو لا" : undefined}>
        {() => (
          <div role="radiogroup" className="flex gap-2.5">
            {radio(true, "نعم")}
            {radio(false, "لا")}
          </div>
        )}
      </Field>
      <TextArea label="نتيجة التواصل والملاحظات" value={notes} onChange={setNotes} rows={3} className="h-24" placeholder={`أكّد العميل موعد الزيارة ${b.visitDate ?? ""}.`} />
    </Modal>
  );
}

// ───────────── CON5-04M · اعتماد التنفيذ (3114-40053 …) ─────────────
const APPROVE_RESULTS = ["أكّد العميل تنفيذ الخدمة", "لم يرد العميل · اعتماد بمسح القسيمة", "العميل غير راضٍ · اعتماد مع ملاحظة"];
function ApproveModal({ b }: { b: Booking }) {
  const close = useClose();
  const [result, setResult] = useState(APPROVE_RESULTS[0]);
  const [note, setNote] = useState("");
  const go = useAct(() => M.approve(b.id));
  const m = margin(b.sale, b.cost);
  const done = b.drawer.hero.lines[0]?.replace(/^نُفّذ /, "") ?? "";
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={`اعتماد تنفيذ الحجز ${b.id}`} subtitle={ltrRuns(`${b.customer.name} · ${b.service} · ${b.size} · فرع ${b.branch}`)} width={560}
      footer={
        <>
          <Button variant="accent" className={PRI} loading={go.isPending} onClick={() => go.mutate(undefined)}>
            تم الاعتماد
            <Icon name="check" size={16} />
          </Button>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="flex flex-col rounded-12 bg-surface-1 px-3.5 py-2">
        <MKV k="نُفّذ">{ltrRuns(done)}</MKV>
        <MKV k="سعر البيع · شامل الضريبة">{num(b.sale)} ر.س</MKV>
        <MKV k="سعر التكلفة · شامل الضريبة">{num(b.cost)} ر.س</MKV>
        <MKV k="الهامش">{num(m.value)} ر.س</MKV>
      </div>
      <SelectField tall label="نتيجة التواصل مع العميل" value={result} options={opts(APPROVE_RESULTS)} onChange={setResult} />
      <Field label="ملاحظة (اختياري)">{(fid) => <TextInput id={fid} value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب الملاحظة" />}</Field>
    </Modal>
  );
}

// ───────────── CON5-04M · تقييم بالنيابة عن العميل (3114-39814 · 3248-94357 …) ─────────────
const ASPECTS = ["جودة العمل", "التعامل والتواصل", "القيمة مقابل السعر", "العناية بالسيارة ونظافتها"];
function RateModal({ b }: { b: Booking }) {
  const close = useClose();
  const [stars, setStars] = useState([5, 5, 4, 4]);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(true);
  const go = useAct(() => M.rate(b.id, { aspects: stars, text }));
  const avg = Math.round((stars.reduce((s, x) => s + x, 0) / 4) * 2) / 2;
  const done = b.drawer.hero.lines.find((l) => l.startsWith("نُفّذ"))?.split(" بمسح")[0].split(" · ")[0] ?? "";
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={`تقييم بالنيابة عن العميل · ${b.id}`} subtitle={ltrRuns(`${b.customer.name} · ${b.provider} · فرع ${b.branch} · ${done}`)} width={600}
      footer={
        <>
          <Button variant="accent" className={PRI} loading={go.isPending} onClick={() => go.mutate(undefined)}>
            حفظ التقييم
          </Button>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <Field label="مصدر التقييم">{(fid) => <TextInput id={fid} value="مكالمة متابعة من لينكار · اليوم · مسجّلة في سجل الحجز" readOnly />}</Field>
      <div className="flex flex-col gap-2 rounded-12 border border-border px-3.5 py-3">
        {ASPECTS.map((a, i) => (
          <div key={a} className="flex items-center justify-between gap-2.5">
            <span className="text-13 text-ink">{a}</span>
            <span className="flex gap-0.5" dir="ltr" role="radiogroup" aria-label={a}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} من 5`} onClick={() => setStars((s) => s.map((x, j) => (j === i ? n : x)))} className={n <= stars[i] ? "text-ink" : "text-border"}>
                  <Icon name="star-filled" size={18} />
                </button>
              ))}
            </span>
          </div>
        ))}
        <p className="text-12 font-light text-muted">التقييم العام ★ {num(avg, avg % 1 ? 1 : 0)} · يُحسب من الجوانب الأربعة («جوانب تقييم العميل»)</p>
      </div>
      <TextArea label="ما قالته العميلة" value={text} onChange={setText} rows={2} placeholder="«الشغل ممتاز والسيارة رجعت نظيفة، بس السعر مرتفع شوي.»" />
      <Checkbox label="وافقت العميلة على نشر التقييم باسمها المختصر" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
    </Modal>
  );
}

// ───────────── CON5-04M · قرار إعادة الجدولة (3114-39759) ─────────────
const RS_DATES = ["22 أكتوبر 2026", "23 أكتوبر 2026", "24 أكتوبر 2026"];
function RescheduleModal({ b }: { b: Booking }) {
  const url = useUrlState();
  const close = useClose();
  const toast = useToast();
  const [choice, setChoice] = useState<"approve" | "transfer" | "cancel" | "reject">("approve");
  const [date, setDate] = useState(RS_DATES[0]);
  const go = useAct(() => M.reschedule(b.id, { choice: choice === "reject" ? "reject" : "approve", date }));
  const submit = () => (choice === "transfer" ? url.replace({ modal: "transfer", b: b.id }) : choice === "cancel" ? url.replace({ modal: "cancel", b: b.id }) : go.mutate(undefined));
  const choices: [typeof choice, string][] = [
    ["approve", "وافقت على موعد من المقترح · يُعتمد ويراه الجميع"],
    ["transfer", "رفضت التأجيل · تحويل الحجز لفرع أو مقدّم خدمة آخر"],
    ["cancel", "رفضت التأجيل وطلبت الإلغاء · إلغاء واسترداد كامل"],
    ["reject", `رفض طلب الفرع · يبقى الموعد ${b.visitDate ?? ""}`],
  ];
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={`قرار إعادة الجدولة · ${b.id}`} subtitle={ltrRuns(`${b.customer.name} · ${b.provider} · فرع ${b.branch} · ${b.service} · ${b.request?.id ?? ""}`)} width={620}
      footer={
        <>
          <Button variant="accent" className={PRI} loading={go.isPending} onClick={submit}>
            {choice === "approve" ? "اعتماد الموعد الجديد" : choice === "reject" ? "رفض طلب الفرع" : "متابعة"}
          </Button>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2 rounded-12 bg-surface-1 px-3.5 py-3">
        <MKV k="الموعد الحالي">{b.visitDate}</MKV>
        <MKV k="اقترح الفرع">22 أكتوبر 2026 · أو أي يوم 22 – 24 أكتوبر 2026</MKV>
        <MKV k="السبب · من «أسباب إعادة الجدولة»">امتلاء الطاقة الاستيعابية للفرع</MKV>
        <MKV k="القسيمة">{ltrRuns(`${b.voucherCode ?? ""} صالحة حتى ${b.validUntil ? arDate(b.validUntil) : ""}`)}</MKV>
      </div>
      <div className="flex items-center justify-between gap-2.5 rounded-12 border border-border px-3.5 py-2.5">
        <span className="text-13 font-medium text-ink">1 · اتصل بالعميلة واعرض عليها الموعد المقترح</span>
        <Button variant="secondary" className={SEC} onClick={() => (toast(`سُجّل التواصل مع العميل في سجل الحجز ${b.id}`), (window.location.href = `tel:${b.customer.phone.replace(/\s/g, "")}`))}>
          اتصال بالعميلة
          <Icon name="phone" size={16} />
        </Button>
      </div>
      <p className="text-13 font-medium text-ink">2 · ما اتفقت عليه مع العميلة</p>
      <div role="radiogroup" className="flex flex-col gap-2">
        {choices.map(([k, label]) => (
          <OptionCard key={k} className="items-center! px-3.5 py-2.5 [&_span:last-child>span]:text-13!" selected={choice === k} onClick={() => setChoice(k)} title={label} />
        ))}
      </div>
      {choice === "approve" ? <SelectField tall label="الموعد المعتمد" value={date} options={opts(RS_DATES)} onChange={setDate} /> : null}
    </Modal>
  );
}

// ───────────── CON5-04M · تسجيل دفعة (3114-36864) · إلغاء حجز غير مدفوع (3114-36901 · 3114-39956) ─────────────
const ACCOUNTS = ["حساب لينكار الرئيسي · الأهلي", "حساب التحصيل · الراجحي"];
function PaymentModal({ b }: { b: Booking }) {
  const close = useClose();
  const [ref, setRef] = useState("");
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [err, setErr] = useState(false);
  const go = useAct(() => M.registerPayment(b.id, { ref: ref.trim() }));
  const save = () => (ref.trim().length < 4 ? setErr(true) : go.mutate(undefined));
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="تسجيل دفعة بتحويل بنكي" className="gap-3! p-[22px]!" subtitle={ltrRuns(`${b.id} · ${b.customer.name} · ${num(b.sale)} ر.س`)} width={540}
      footer={
        <>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
          <Button className={PRI} loading={go.isPending} onClick={save}>
            تسجيل الدفعة وإصدار القسيمة
            <Icon name="check" size={16} />
          </Button>
        </>
      }
    >
      <Field label="رقم الحوالة" error={err ? "اكتب رقم الحوالة كما في كشف البنك" : undefined}>
        {(fid) => <TextInput id={fid} value={ref} invalid={err} ltr onChange={(e) => (setRef(e.target.value), setErr(false))} placeholder="TRF-2026-10-1187" />}
      </Field>
      <Field label="تاريخ الحوالة">{(fid) => <TextInput id={fid} value="14 أكتوبر 2026" readOnly icon={<Icon name="calendar" size={16} />} />}</Field>
      <Field label="المبلغ · شامل الضريبة">{(fid) => <TextInput id={fid} value={`${num(b.sale)} ر.س`} readOnly />}</Field>
      <SelectField label="الحساب المستلم" value={account} options={opts(ACCOUNTS)} onChange={setAccount} />
      <MNote>بعد التسجيل يُلغى رابط الدفع، وتصدر القسيمة والفاتورة الضريبية، ويظهر الحجز لفرع {b.branch}. تراجع المالية الحوالة في كشف الحساب.</MNote>
    </Modal>
  );
}

function CancelUnpaidModal({ b }: { b: Booking }) {
  const close = useClose();
  const [reason, setReason] = useState(UNPAID_REASONS[0]);
  const go = useAct(() => M.cancelUnpaid(b.id));
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="إلغاء الحجز قبل الدفع" className="gap-3! p-[22px]!" subtitle={ltrRuns(`${b.id} · ${b.customer.name}`)} width={500}
      footer={
        <>
          <Button variant="secondary" className={SEC} onClick={close}>
            تراجع
          </Button>
          <Button variant="danger" className={PRI} loading={go.isPending} onClick={() => go.mutate(undefined)}>
            إلغاء الحجز
          </Button>
        </>
      }
    >
      <SelectField label="السبب" value={reason} options={opts(UNPAID_REASONS)} onChange={setReason} />
      <MNote tone="warning">لم يُدفع شيء، فلا استرداد ولا إشعار دائن. يتوقف رابط الدفع فوراً.</MNote>
    </Modal>
  );
}

// ───────────── CON5-04M · تنبيه موظف CRM (3400-240436) · تنبيه المزوّدين (3400-240509) ─────────────
function NotifyModal({ kind }: { kind: "notify-crm" | "notify-providers" }) {
  const close = useClose();
  const list = useQuery({ queryKey: ["bookings", "list", { tab: "awaiting-visit" }], queryFn: () => api.bookings.list({ tab: "awaiting-visit" }) });
  const crm = kind === "notify-crm";
  const pending = (list.data?.items ?? []).filter((b) => (crm ? !b.linkar?.done : !b.providerContact?.done)).sort((a, b) => b.id.localeCompare(a.id));
  const groups = [...new Map(pending.map((b) => [b.provider, pending.filter((x) => x.provider === b.provider).length])).entries()];
  const [extra, setExtra] = useState<string | null>(null);
  const text = extra ?? ["عملاء لم يتم التواصل معهم قبل موعد الحجز:", ...pending.map((b) => `${b.id} · ${b.customer.name} · ${b.provider} · ${b.branch} · ${b.visitDate ?? ""}`)].join("\n");
  const go = useAct(() => (crm ? M.notifyCrm() : M.notifyProviders(groups.map(([p]) => p).reverse())));
  return (
    <Modal open onOpenChange={(o) => !o && close()} title={crm ? "تنبيه موظف CRM" : "تنبيه المزوّدين"} width={640}
      footer={
        <>
          <Button variant="accent" className={PRI} loading={go.isPending} disabled={!pending.length} onClick={() => go.mutate(undefined)}>
            إرسال
            <Icon name="message" size={16} />
          </Button>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-12 font-medium text-muted">إلى</span>
        <div className="flex flex-wrap gap-1.5">
          {list.isLoading ? (
            <Skeleton className="h-[30px] w-40 rounded-full" />
          ) : (
            (crm ? [["ريم الشهري · خدمة العملاء", 0] as [string, number]] : groups).map(([label, n]) => (
              <span key={label} className="flex h-[30px] items-center gap-1.5 rounded-full border border-ink bg-lime-tint px-2.5 text-12 font-semibold text-ink">
                {ltrRuns(crm ? label : `${label} · ${n === 1 ? "حجز واحد" : `${num(n)} حجوزات`}`)}
                <Icon name="check" size={12} />
              </span>
            ))
          )}
        </div>
      </div>
      <TextArea label="الرسالة" value={text} onChange={setExtra} rows={crm ? 2 : 3} />
    </Modal>
  );
}

// ───────────── CON5-04P · تصفية الحجوزات (3114-39363) — ?modal=filter ─────────────
// بيحدد مقدّم الخدمة والفرع والفترة والحالة والقناة والخدمة ويطبّقها على القائمة (نفس فلاتر الرابط)
const STATUS_TABS = [
  { value: "all", label: "كل الحالات" },
  { value: "awaiting-visit", label: "بانتظار الزيارة" },
  { value: "completed", label: "مكتملة (نُفّذت)" },
  { value: "approved", label: "معتمدة" },
  { value: "cancelled", label: "ملغاة" },
  { value: "linkar", label: "بانتظار قرار لينكار" },
];
const PROVIDER_FULL: Record<string, string> = { "lk-jn-001": "جونسون Johnson · LK-JN-001", "lk-lm-001": "لومار · LK-LM-001", "lk-xp-001": "XPEL السعودية · LK-XP-001", "lk-ns-001": "نانو شيلد · LK-NS-001" };
function FilterModal() {
  const url = useUrlState();
  const [provider, setProvider] = useState(url.get("provider") ?? "lk-jn-001");
  const [branch, setBranch] = useState(url.get("branch") ?? "LK-JN-HM-002");
  const [period, setPeriod] = useState(url.get("period") ?? "2026-10");
  const [tab, setTab] = useState(url.get("tab") ?? "completed");
  const [channel, setChannel] = useState(url.get("channel") ?? "");
  const [category, setCategory] = useState(url.get("category") ?? "");
  const close = () => url.replace({ modal: null });
  const prefix = provider.slice(3, 5).toUpperCase();
  const branches = BRANCH_OPTS.filter((b) => b.value.slice(3, 5) === prefix).map((b) => ({ value: b.value, label: b.label.split(" · ").slice(0, 2).join(" · ") }));
  const apply = () => url.replace({ modal: null, provider, branch: branch || null, period: period === "2026-10" ? null : period, tab: tab === "all" ? null : tab, channel: channel || null, category: category || null, page: null });
  return (
    <Modal open onOpenChange={(o) => !o && close()} title="تصفية الحجوزات" subtitle="اختر مقدّم الخدمة والفرع لمتابعة ما نُفّذ عنده" width={560}
      footer={
        <>
          <Button className={PRI} onClick={apply}>
            عرض النتائج
          </Button>
          <Button variant="secondary" className={SEC} onClick={close}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <SelectField tall label="مقدّم الخدمة" value={provider} options={PROVIDER_OPTS.filter((p) => PROVIDER_FULL[p.value]).map((p) => ({ value: p.value, label: PROVIDER_FULL[p.value] }))} onChange={(v) => (setProvider(v), setBranch(""))} />
        <SelectField tall label="الفرع" value={branch} options={[{ value: "", label: "كل الفروع" }, ...branches]} onChange={setBranch} />
        <SelectField tall label="الحالة" value={tab} options={STATUS_TABS} onChange={setTab} />
        <SelectField tall label="الفترة" value={period} options={[...PERIODS]} onChange={setPeriod} />
        <SelectField tall label="الخدمة" value={category} options={[{ value: "", label: "كل الخدمات" }, ...opts(CATEGORIES)]} onChange={setCategory} />
        <SelectField tall label="القناة" value={channel} options={[{ value: "", label: "كل القنوات" }, ...CHANNELS]} onChange={setChannel} />
      </div>
    </Modal>
  );
}
