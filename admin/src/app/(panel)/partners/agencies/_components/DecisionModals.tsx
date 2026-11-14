"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { JOIN_REJECT_REASONS, type AgencyRequest, type JoinRequest } from "@/lib/api/agency-extra";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../../providers/_components/form-bits";
import { DKV } from "./bits";

// نوافذ قرار الطلبات (CON5-09M) فوق الدرج:
//   ?join=DR-…&modal=dr-approve  اعتماد · DR-0034 (3114:4110) / DR-0033 (4156) — 480
//   ?join=DR-…&modal=dr-reject   رفض · DR-0034 (4202) / DR-0033 (4229) → T0929 — 480
//   ?join=DR-…&modal=dr-complete طلب استكمال · DR-0034 (4256) / DR-0033 (4284) — 480
//   ?dq=DQ-2026-0012&modal=dq-approve اعتماد · DQ-2026-0012 (6446) → T0927 — 500
//   ?dq=DQ-…&modal=dq-reject     رفض · DQ-0012 (6474) / 0013 (6533) / 0014 (9952) / 0015 (10011) → T0929 — 500
export function DecisionModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const join = url.get("join");
  const dq = url.get("dq");
  const jq = useQuery({ queryKey: ["agencies", "join", join], queryFn: () => api.agencyRequests.join(join!), enabled: !!join && !!modal?.startsWith("dr-"), retry: false });
  const dqq = useQuery({ queryKey: ["agencies", "dq", dq], queryFn: () => api.agencyRequests.dq(dq!), enabled: !!dq && !!modal?.startsWith("dq-"), retry: false });
  if (join && jq.data && jq.data.decision === "open") {
    if (modal === "dr-approve") return <JoinApprove j={jq.data} />;
    if (modal === "dr-reject") return <JoinReject j={jq.data} />;
    if (modal === "dr-complete") return <JoinComplete j={jq.data} />;
  }
  if (dq && dqq.data && dqq.data.decision === "open") {
    if (modal === "dq-approve" && dqq.data.newLimit) return <DqApprove r={dqq.data} />;
    if (modal === "dq-reject") return <DqReject r={dqq.data} />;
  }
  return null;
}

/** بعد القرار: تقفل النافذة والدرج وتختفي البطاقة من «بانتظار قرار لينكار» */
function useDone(key: "join" | "dq") {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string) => {
    qc.invalidateQueries({ queryKey: ["agencies"] });
    url.replace({ modal: null, [key]: null });
    toast("تم", t);
  };
}

function Shell({ title, description, width, children, primary, onPrimary, loading, danger, disabled, icon }: { title: string; description?: ReactNode; width: number; children: ReactNode; primary: string; onPrimary: () => void; loading?: boolean; danger?: boolean; disabled?: boolean; icon?: boolean }) {
  const url = useUrlState();
  const close = () => url.replace({ modal: null });
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={width} title={title} description={description}>
      {children}
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant={danger ? "danger" : "primary"} loading={loading} disabled={disabled} icon={icon ? <Icon name="check" size={18} /> : undefined} onClick={onPrimary}>
          {primary}
        </Button>
        <Button variant="secondary" className="h-[50px]!" onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

const err = (e: unknown, k: string) => (isApiError(e) ? e.fields?.[k] : undefined);
const n = (s: string) => Number(s.replace(/[^\d]/g, ""));
const fmt = (s: string) => (s.replace(/[^\d]/g, "") ? num(n(s)) : "");

function Radio({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={`flex items-center gap-2.5 rounded-12 border p-3 text-start ${on ? "border-ink" : "border-border hover:bg-surface-1"}`}>
      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${on ? "border-ink" : "border-border"}`}>{on ? <span className="size-2.5 rounded-full bg-ink" /> : null}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-13 leading-[22px] font-medium text-ink">{title}</span>
        <span className="text-12 leading-5 font-medium text-muted">{sub}</span>
      </span>
    </button>
  );
}

// ───────────── اعتماد · DR (3114:4110) ─────────────
function JoinApprove({ j }: { j: JoinRequest }) {
  const done = useDone("join");
  const [arr, setArr] = useState<"credit" | "prepaid">(j.pay === "رصيد مسبق" ? "prepaid" : "credit");
  const [amount, setAmount] = useState(j.amount);
  const [checked, setChecked] = useState(true);
  const m = useMutation({ mutationFn: () => api.agencyRequests.approveJoin(j.id, arr, n(amount)), onSuccess: (r) => done(r.toast) });
  return (
    <Shell width={480} title={j.name.startsWith("شركة") ? `اعتماد ${j.name}` : `اعتماد وكالة ${j.name}`} description={<bdi>{j.id}</bdi>} primary="اعتماد الوكالة" icon onPrimary={() => m.mutate()} loading={m.isPending} disabled={!checked}>
      <div role="radiogroup" aria-label="الترتيب المالي" className="flex flex-col gap-2.5">
        <span className="text-12 leading-5 font-medium text-muted">الترتيب المالي</span>
        <Radio on={arr === "credit"} onClick={() => setArr("credit")} title="ائتمان شهري" sub="كشف حساب شهري ومهلة سداد 30 يوماً" />
        <Radio on={arr === "prepaid"} onClick={() => setArr("prepaid")} title="رصيد مسبق" sub="يُخصم ثمن الباقات من الرصيد عند الشراء" />
        <Field label={arr === "credit" ? "الحد الائتماني (ر.س)" : "الشحن الأول (ر.س)"} error={err(m.error, "amount")}>
          {(id) => <TextInput id={id} value={amount} inputMode="numeric" invalid={!!err(m.error, "amount")} onChange={(e) => setAmount(fmt(e.target.value))} />}
        </Field>
      </div>
      <ul className="flex flex-col gap-2">
        <li className="flex items-start gap-2 text-13 leading-[22px] font-light text-ink">
          <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
            <Icon name="check" size={12} />
          </span>
          <span className="min-w-0 flex-1">يُنشأ حساب المفوّض الرئيسي ويصله رابط البوابة</span>
        </li>
        {/* البند الثاني في Figma نقطته ظاهرة ونصه مخفي */}
        <li aria-hidden className="flex size-[18px] items-center justify-center rounded-full bg-success-tint text-success">
          <Icon name="check" size={12} />
        </li>
      </ul>
      <Checkbox label={<span className="font-medium">راجعت المستندات والبيانات المرفقة</span>} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
    </Shell>
  );
}

// ───────────── رفض · DR (3114:4202) ─────────────
function JoinReject({ j }: { j: JoinRequest }) {
  const done = useDone("join");
  const [reason, setReason] = useState(JOIN_REJECT_REASONS[0]);
  const [msg, setMsg] = useState("نأسف، لم نتمكن من اعتماد الطلب لعدم اكتمال المستندات. يمكنكم التقديم من جديد بعد استكمالها.");
  const m = useMutation({ mutationFn: () => api.agencyRequests.rejectJoin(j.id), onSuccess: (r) => done(r.toast) });
  return (
    <Shell width={480} title={`رفض الطلب ${j.id}`} description={`${j.short} · انضمام وكالة`} primary="رفض الطلب" danger onPrimary={() => m.mutate()} loading={m.isPending} disabled={!msg.trim()}>
      <Field label="سبب الرفض">{(id) => <Select id={id} value={reason} onChange={setReason} options={JOIN_REJECT_REASONS.map((v) => ({ value: v, label: v }))} />}</Field>
      <Field label="رسالة للجهة">{(id) => <TextArea id={id} value={msg} onChange={setMsg} />}</Field>
      <Note tone="neutral">يصل القرار للجهة برسالة نصية وبريد.</Note>
    </Shell>
  );
}

// ───────────── طلب استكمال · DR (3114:4256) ─────────────
function JoinComplete({ j }: { j: JoinRequest }) {
  const done = useDone("join");
  const label = (t: string, attached: boolean) => `${t} (PDF) · ${attached ? (t.startsWith("شهادة") ? "مرفقة" : "مرفق") : t.startsWith("شهادة") ? "ناقصة" : "ناقص"}`;
  const [items, setItems] = useState<string[]>(j.docs.filter((d) => !d.file).map((d) => d.title));
  const [note, setNote] = useState(j.completeNote);
  const m = useMutation({ mutationFn: () => api.agencyRequests.completeJoin(j.id, items), onSuccess: (r) => done(r.toast) });
  return (
    <Shell width={480} title={`طلب استكمال · ${j.id}`} description={j.short} primary="إرسال الطلب" onPrimary={() => m.mutate()} loading={m.isPending}>
      <div className="flex flex-col gap-3.5">
        <span className="text-12 leading-5 font-medium text-muted">ما المطلوب استكماله؟</span>
        {j.docs.map((d) => (
          <Checkbox
            key={d.title}
            label={<span className="font-medium">{label(d.title, !!d.file)}</span>}
            checked={items.includes(d.title)}
            onChange={(e) => setItems((l) => (e.target.checked ? [...l, d.title] : l.filter((x) => x !== d.title)))}
          />
        ))}
        {err(m.error, "items") ? <p className="text-12 text-danger">{err(m.error, "items")}</p> : null}
      </div>
      <Field label="ملاحظة للجهة">{(id) => <TextArea id={id} value={note} onChange={setNote} />}</Field>
      <p className="text-13 leading-[22px] font-light text-muted">تصل الجهة رسالة نصية وبريد برابط البوابة لرفع المطلوب.</p>
    </Shell>
  );
}

// ───────────── اعتماد الحد الجديد · DQ-2026-0012 (3114:6446) ─────────────
function DqApprove({ r }: { r: AgencyRequest }) {
  const done = useDone("dq");
  const ag = useQuery({ queryKey: ["agencies", "one", r.agencyId], queryFn: () => api.agencies.get(r.agencyId) });
  const [limit, setLimit] = useState(num(r.newLimit ?? 0));
  const m = useMutation({ mutationFn: () => api.agencyRequests.approveDq(r.id, n(limit)), onSuccess: (x) => done(x.toast) });
  const a = ag.data;
  return (
    <Shell width={500} title="اعتماد الحد الجديد" primary="اعتماد الحد" onPrimary={() => m.mutate()} loading={m.isPending} disabled={!n(limit)}>
      <DKV k="الوكالة" pad>
        {r.agency} · {r.agencyId}
      </DKV>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="الحد الحالي">{(id) => <TextInput id={id} readOnly value={a ? `‏${num(a.money)} ر.س` : "…"} />}</Field>
        <Field label="الحد الجديد">{(id) => <TextInput id={id} value={limit} inputMode="numeric" onChange={(e) => setLimit(fmt(e.target.value))} />}</Field>
      </div>
      <DKV k="المتاح بعد الاعتماد" pad>
        {a ? `‏${num(n(limit) - (a.used ?? 0))} ر.س` : "…"}
      </DKV>
    </Shell>
  );
}

// ───────────── رفض · DQ (3114:6474) ─────────────
function DqReject({ r }: { r: AgencyRequest }) {
  const done = useDone("dq");
  const [reason, setReason] = useState(r.rejectReason);
  const m = useMutation({ mutationFn: () => api.agencyRequests.rejectDq(r.id, reason), onSuccess: (x) => done(x.toast) });
  return (
    <Shell width={500} title={r.rejectTitle} primary="رفض الطلب" danger onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="الطلب" pad>
        {r.rejectRef}
      </DKV>
      <Field label="سبب الرفض" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} invalid={!!err(m.error, "reason")} className="h-[76px]!" />}
      </Field>
    </Shell>
  );
}
