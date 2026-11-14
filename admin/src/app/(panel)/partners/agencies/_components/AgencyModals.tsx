"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { PAY_METHODS, SUSPEND_REASONS, type Agency, type Statement } from "@/lib/api/agencies";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../../providers/_components/form-bits";
import { AddAgencyWizard } from "./AddAgencyWizard";
import { DKV } from "./bits";

// نوافذ الوكالات CON5-09M — بتتفتح فوق الصفحة أو الدرج: ?modal=ag-…&ref=<DL / INV>
//   تعديل الحد · DL-014 (3114:3205) / DL-009 (3238) → T0901 · تسجيل سداد · INV-… (3271 / 3314 / 3357) → T0902
//   تسجيل شحن · DL-021 (3400) → T0903 · تأكيد الشحن · DL-018 (3435) → T0904 · إعادة تفعيل · DL-011 (3467) → T0905
//   إيقاف · DL-014/007/021/018/009 (3487 … 3575) → T0906 · إضافة وكالة CON5-09W1..3 (ag-add) → T0908
// كلها 500 · r20 · حشو 24 · مسافة 14 · الأزرار تحت (الرئيسي يمين · «إلغاء» شمال).
export function AgencyModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const ref = url.get("ref");
  if (modal === "ag-add") return <AddAgencyWizard />;
  if (!modal?.startsWith("ag-") || !ref) return null;
  return <ByRef modal={modal} refId={ref} />;
}

function ByRef({ modal, refId }: { modal: string; refId: string }) {
  const isInv = refId.startsWith("INV-");
  const ag = useQuery({ queryKey: ["agencies", "one", refId], queryFn: () => api.agencies.get(refId), enabled: !isInv, retry: false });
  const st = useQuery({ queryKey: ["agencies", "statement", refId], queryFn: () => api.agencies.statement(refId), enabled: isInv, retry: false });
  if (modal === "ag-pay" && st.data) return <PayModal s={st.data} />;
  if (!ag.data) return null;
  const a = ag.data;
  if (modal === "ag-limit") return <LimitModal a={a} />;
  if (modal === "ag-topup") return <TopupModal a={a} />;
  if (modal === "ag-confirm") return <ConfirmModal a={a} />;
  if (modal === "ag-reactivate") return <ReactivateModal a={a} />;
  if (modal === "ag-suspend") return <SuspendModal a={a} />;
  return null;
}

/** بعد الإجراء: يقفل النافذة (الدرج يفضل مفتوح ويتحدّث) ويظهر التوست */
function useDone() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string) => {
    qc.invalidateQueries({ queryKey: ["agencies"] });
    url.replace({ modal: null, ref: null });
    toast("تم", t);
  };
}
const useClose = () => {
  const url = useUrlState();
  return () => url.replace({ modal: null, ref: null });
};

function Shell({ title, children, primary, onPrimary, loading, danger, disabled }: { title: string; children: ReactNode; primary: string; onPrimary: () => void; loading?: boolean; danger?: boolean; disabled?: boolean }) {
  const close = useClose();
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={500} title={title}>
      {children}
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant={danger ? "danger" : "primary"} loading={loading} disabled={disabled} onClick={onPrimary}>
          {primary}
        </Button>
        <Button variant="secondary" className="h-[50px]!" onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

const Row = ({ children }: { children: ReactNode }) => <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
const DATES = ["14 أكتوبر 2026", "13 أكتوبر 2026", "12 أكتوبر 2026", "11 أكتوبر 2026", "10 أكتوبر 2026"].map((v) => ({ value: v, label: v }));
const toIso = (d: string) => `2026-10-${d.split(" ")[0].padStart(2, "0")}`;
const parse = (s: string) => Number(s.replace(/[^\d.]/g, ""));
const fmt = (s: string) => (s.replace(/[^\d]/g, "") ? num(Number(s.replace(/[^\d]/g, ""))) : "");
const err = (e: unknown, k: string) => (isApiError(e) ? e.fields?.[k] : undefined);

// ───────────── تعديل الحد الائتماني (3114:3205) ─────────────
function LimitModal({ a }: { a: Agency }) {
  const done = useDone();
  const [limit, setLimit] = useState(num(a.money + 50000));
  const [reason, setReason] = useState("زيادة حجم المشتريات خلال 3 أشهر");
  const [bad, setBad] = useState<string>();
  const m = useMutation({ mutationFn: () => api.agencies.updateLimit(a.id, parse(limit), reason), onSuccess: (r) => done(r.toast) });
  const submit = () => {
    const n = parse(limit);
    if (!n || n < (a.used ?? 0)) return setBad(!n ? "أدخل الحد الجديد" : `الحد أقل من المستخدم (${num(a.used ?? 0)} ر.س)`);
    setBad(undefined);
    m.mutate();
  };
  return (
    <Shell title="تعديل الحد الائتماني" primary="حفظ الحد" onPrimary={submit} loading={m.isPending}>
      <DKV k="الوكالة">{a.name}</DKV>
      <Row>
        <Field label="الحد الحالي">{(id) => <TextInput id={id} value={`${num(a.money)} ر.س`} readOnly />}</Field>
        <Field label="الحد الجديد" error={bad}>
          {(id) => <TextInput id={id} value={limit} inputMode="numeric" invalid={!!bad} onChange={(e) => setLimit(fmt(e.target.value))} />}
        </Field>
      </Row>
      <Field label="السبب" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} invalid={!!err(m.error, "reason")} className="h-20!" />}
      </Field>
      <Note>يسري الحد الجديد فوراً على الطلبات الجديدة في بوابة الوكالة.</Note>
    </Shell>
  );
}

// ───────────── تسجيل سداد INV-… (3114:3271) ─────────────
function PayModal({ s }: { s: Statement }) {
  const done = useDone();
  const [date, setDate] = useState(DATES[0].value);
  const [amount, setAmount] = useState(num(s.amount));
  const [method, setMethod] = useState(PAY_METHODS[0]);
  const [ref, setRef] = useState("TRX-55120988");
  const m = useMutation({ mutationFn: () => api.agencies.recordPayment(s.id, { date: toIso(date), amount: parse(amount), method, ref }), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title={`تسجيل سداد ${s.id}`} primary="تسجيل السداد" onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="الوكالة">{s.agency}</DKV>
      <DKV k="المبلغ المستحق · شامل الضريبة">{num(s.amount)} ر.س</DKV>
      <Row>
        <Field label="المبلغ المستلم · شامل الضريبة" error={err(m.error, "amount")}>
          {(id) => <TextInput id={id} value={amount} inputMode="numeric" invalid={!!err(m.error, "amount")} onChange={(e) => setAmount(fmt(e.target.value))} />}
        </Field>
        <Field label="تاريخ الاستلام">{(id) => <Select id={id} value={date} onChange={setDate} options={DATES} />}</Field>
      </Row>
      <Field label="طريقة السداد">{(id) => <Select id={id} value={method} onChange={setMethod} options={PAY_METHODS.map((v) => ({ value: v, label: v }))} />}</Field>
      <Field label="مرجع التحويل">{(id) => <TextInput id={id} value={ref} ltr onChange={(e) => setRef(e.target.value)} />}</Field>
      <Note>تسجيل السداد يعيد الرصيد المتاح للوكالة ويرفع إيقاف الطلبات إن وُجد.</Note>
    </Shell>
  );
}

// ───────────── تسجيل شحن رصيد (3114:3400) ─────────────
function TopupModal({ a }: { a: Agency }) {
  const done = useDone();
  const [date, setDate] = useState(DATES[0].value);
  const [amount, setAmount] = useState("50,000");
  const [ref, setRef] = useState("TRX-55121410");
  const m = useMutation({ mutationFn: () => api.agencies.recordTopup(a.id, parse(amount)), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title="تسجيل شحن رصيد" primary="تسجيل الشحن" onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="الوكالة">{a.name}</DKV>
      <DKV k="الرصيد الحالي">{num(a.money)} ر.س</DKV>
      <Row>
        <Field label="مبلغ الشحن" error={err(m.error, "amount")}>
          {(id) => <TextInput id={id} value={amount} inputMode="numeric" invalid={!!err(m.error, "amount")} onChange={(e) => setAmount(fmt(e.target.value))} />}
        </Field>
        <Field label="تاريخ الاستلام">{(id) => <Select id={id} value={date} onChange={setDate} options={DATES} />}</Field>
      </Row>
      <Field label="مرجع التحويل">{(id) => <TextInput id={id} value={ref} ltr onChange={(e) => setRef(e.target.value)} />}</Field>
    </Shell>
  );
}

// ───────────── تأكيد شحن TP-… (3114:3435) ─────────────
function ConfirmModal({ a }: { a: Agency }) {
  const done = useDone();
  const t = a.pendingTopup;
  const [ref, setRef] = useState("TRX-55120761");
  const m = useMutation({ mutationFn: () => api.agencies.confirmTopup(a.id), onSuccess: (r) => done(r.toast) });
  if (!t) return null;
  return (
    <Shell title={`تأكيد شحن ${t.id}`} primary="تأكيد الاستلام" onPrimary={() => m.mutate()} loading={m.isPending} disabled={!ref.trim()}>
      <DKV k="الوكالة">{a.name}</DKV>
      <DKV k="المبلغ">{num(t.amount)} ر.س</DKV>
      <DKV k="أرسلته الوكالة">{t.sentLine}</DKV>
      <Field label="مرجع الاستلام في حساب لينكار">{(id) => <TextInput id={id} value={ref} ltr onChange={(e) => setRef(e.target.value)} />}</Field>
      <Note>بعد التأكيد يصبح الرصيد {num(a.money + t.amount)} ر.س ويظهر في بوابة الوكالة.</Note>
    </Shell>
  );
}

// ───────────── إعادة تفعيل (3114:3467) ─────────────
function ReactivateModal({ a }: { a: Agency }) {
  const done = useDone();
  const [note, setNote] = useState("بطلب من الوكالة · انتهت إعادة الهيكلة");
  const m = useMutation({ mutationFn: () => api.agencies.reactivate(a.id), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title={`إعادة تفعيل ${a.short}`} primary="إعادة التفعيل" onPrimary={() => m.mutate()} loading={m.isPending}>
      <Note>
        {a.arrangement === "credit" ? `تعود بوابة الوكالة وحسابات الفروع والموظفين للعمل بالحد الائتماني ${num(a.money)} ر.س.` : `تعود بوابة الوكالة وحسابات الفروع والموظفين للعمل بالرصيد ${num(a.money)} ر.س.`}
      </Note>
      <Field label="ملاحظة">{(id) => <TextArea id={id} value={note} onChange={setNote} className="h-20!" />}</Field>
    </Shell>
  );
}

// ───────────── إيقاف (3114:3487) ─────────────
function SuspendModal({ a }: { a: Agency }) {
  const done = useDone();
  const [reason, setReason] = useState(SUSPEND_REASONS[0]);
  const m = useMutation({ mutationFn: () => api.agencies.suspend(a.id, reason), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title={`إيقاف ${a.name}`} primary="إيقاف الوكالة" danger onPrimary={() => m.mutate()} loading={m.isPending}>
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={SUSPEND_REASONS.map((v) => ({ value: v, label: v }))} />}</Field>
      <Note tone="warning">تتوقف الطلبات الجديدة في بوابة الوكالة. القسائم الصادرة تبقى صالحة لعملائها حتى انتهائها.</Note>
    </Shell>
  );
}
