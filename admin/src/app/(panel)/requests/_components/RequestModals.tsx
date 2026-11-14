"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { COMPLETE_ITEMS, DEADLINES, REJECT_REASONS, type RequestDetail } from "@/lib/api/requests";
import { arDate, ltrRuns } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../providers/_components/form-bits";
import { FIELD } from "./bits";

// نوافذ قرار الطلب (CON5-03M) — بتتفتح فوق الدرج: ?request=<REQ>&modal=req-approve | req-reject | req-complete
//   اعتماد · REQ (3114:33002 … 33168) — للدرج القديم · رفض · REQ (3114:33193 … 33355) — للدرجين
//   طلب استكمال · REQ (3114:33382 … 33526) — للدرج القديم · طلب استكمال من المزوّد (3114:30292) — للدرج الجديد
// النوافذ: 480 (540 للاستكمال الجديد) · r20 · حشو 24 · مسافة 14 · الأزرار تحت بعرض متساوي بفاصل 10.
export function RequestModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("request");
  const open = !!id && !!modal?.startsWith("req-");
  const q = useQuery({ queryKey: ["requests", "one", id], queryFn: () => api.requests.get(id!), enabled: open, retry: false });
  if (!open || !q.data) return null;
  const close = () => url.replace({ modal: null });
  const r = q.data;
  if (modal === "req-approve" && r.drawer.old) return <ApproveModal r={r} close={close} />;
  if (modal === "req-reject") return <RejectModal r={r} close={close} />;
  if (modal === "req-complete") return r.drawer.style === "old" ? <OldCompleteModal r={r} close={close} /> : <CompleteModal r={r} close={close} />;
  return null;
}

type P = { r: RequestDetail; close: () => void };

/** بعد القرار: يقفل النافذة والدرج ويحدّث القائمة وشارة القائمة الجانبية */
function useDone() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string) => {
    qc.invalidateQueries({ queryKey: ["requests"] });
    qc.invalidateQueries({ queryKey: ["providers"] });
    url.replace({ modal: null, request: null });
    toast("تم", t);
  };
}

const CANCEL = "h-[50px]!";

// ───────────── CON5-03M · اعتماد · REQ-2026-0439 (3114:33002) — 480 ─────────────
function ApproveModal({ r, close }: P) {
  const o = r.drawer.old!;
  const done = useDone();
  const [checked, setChecked] = useState(false);
  const m = useMutation({ mutationFn: () => api.requests.approve(r.id), onSuccess: (x) => done(x.toast) });
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={480} title={o.approveTitle} description={<bdi>{r.id}</bdi>}>
      <ul className="flex flex-col gap-2">
        {o.approveBullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-13 leading-[22px] font-light text-ink">
            <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
              <Icon name="check" size={12} />
            </span>
            <span className="min-w-0 flex-1">{ltrRuns(b)}</span>
          </li>
        ))}
      </ul>
      <Checkbox label={<span className="font-medium">راجعت المستندات والبيانات المرفقة</span>} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button loading={m.isPending} disabled={!checked} onClick={() => m.mutate()}>
          {o.approveLabel}
        </Button>
        <Button variant="secondary" className={CANCEL} onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-03M · رفض · REQ-2026-0439 (3114:33193) — 480 ─────────────
function RejectModal({ r, close }: P) {
  const done = useDone();
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [message, setMessage] = useState("نأسف، لم نتمكن من اعتماد الطلب لعدم اكتمال المستندات. يمكنكم التقديم من جديد بعد استكمالها.");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: () => api.requests.reject(r.id, { reason, message }),
    onSuccess: (x) => done(x.toast),
    onError: (e) => isApiError(e) && setErrors(e.fields ?? {}),
  });
  const sub = r.drawer.old?.rejectSub ?? r.rejectSub ?? `${r.provider} · ${r.type}`;
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={480} title={`رفض الطلب ${r.id}`} description={ltrRuns(sub)}>
      <Field label="سبب الرفض" hint="من القائمة المرجعية «أسباب رفض الطلبات»" error={errors.reason}>
        {(fid) => <Select id={fid} value={reason} onChange={setReason} options={REJECT_REASONS.map((v) => ({ value: v, label: v }))} invalid={!!errors.reason} />}
      </Field>
      <Field label="رسالة للجهة" error={errors.message}>
        {(fid) => <TextArea id={fid} value={message} onChange={setMessage} invalid={!!errors.message} />}
      </Field>
      <Note tone="neutral">يُرسل القرار للجهة برسالة نصية وبريد، ويُحفظ في «سجل القرارات».</Note>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="danger" loading={m.isPending} onClick={() => m.mutate()}>
          رفض الطلب
        </Button>
        <Button variant="secondary" className={CANCEL} onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-03M · طلب استكمال · REQ-2026-0439 (3114:33382) — 480 · الدرج القديم ─────────────
function OldCompleteModal({ r, close }: P) {
  const o = r.drawer.old!;
  const done = useDone();
  const [items, setItems] = useState<string[]>([o.completeItem]);
  const [note, setNote] = useState("يرجى رفع النسخة المحدّثة من بوابتكم خلال 7 أيام.");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: () => api.requests.complete(r.id, { items, note }),
    onSuccess: (x) => done(x.toast),
    onError: (e) => isApiError(e) && setErrors(e.fields ?? {}),
  });
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={480} title={`طلب استكمال · ${r.id}`} description={ltrRuns(o.completeSub)}>
      <div className="flex flex-col gap-3.5">
        <p className="text-12 leading-5 font-medium text-muted">ما المطلوب استكماله؟</p>
        <Checkbox
          label={<span className="font-medium">{o.completeItem}</span>}
          checked={items.includes(o.completeItem)}
          onChange={(e) => setItems(e.target.checked ? [o.completeItem] : [])}
        />
        {errors.items ? <p role="alert" className="-mt-2 text-12 text-danger">{errors.items}</p> : null}
      </div>
      <Field label="ملاحظة للجهة" error={errors.note}>
        {(fid) => <TextArea id={fid} value={note} onChange={setNote} invalid={!!errors.note} />}
      </Field>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button loading={m.isPending} onClick={() => m.mutate()}>
          إرسال الطلب
        </Button>
        <Button variant="secondary" className={CANCEL} onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-03M · طلب استكمال من المزوّد (3114:30292) — 540 · الدرج الجديد ─────────────
// «المطلوب» شرائح (اختيار متعدد) · «التفاصيل للمزوّد» · «المهلة» (CON5-DD · المهلة) — في Figma «إلغاء» يمين و«إرسال الطلب» شمال
const FROM = new Date("2026-10-15T12:00:00");
const deadlineLabel = (d: string) => {
  const days = parseInt(d, 10);
  return `${d} · حتى ${arDate(new Date(FROM.getTime() + days * 86_400_000).toISOString())}`;
};
function CompleteModal({ r, close }: P) {
  const done = useDone();
  const [items, setItems] = useState<string[]>([COMPLETE_ITEMS[0]]);
  const [note, setNote] = useState("نحتاج صور غرفة التطبيق ونظام تدوير المياه قبل جدولة الزيارة.");
  const [deadline, setDeadline] = useState(DEADLINES[1]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: () => api.requests.complete(r.id, { items, note, deadline }),
    onSuccess: (x) => done(x.toast),
    onError: (e) => isApiError(e) && setErrors(e.fields ?? {}),
  });
  const toggle = (v: string) => setItems((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));
  return (
    <Modal open onOpenChange={(v) => !v && close()} width={540} title="طلب استكمال من المزوّد" subtitle="يتوقف عدّاد الطلب حتى يرد المزوّد">
      <div className="flex flex-col gap-1.5">
        <span className="text-12 leading-5 font-medium text-muted">المطلوب</span>
        <div role="group" aria-label="المطلوب" className="flex flex-wrap gap-1.5">
          {COMPLETE_ITEMS.map((c) => {
            const on = items.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c)}
                className={`h-6 rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${on ? "bg-ink text-white" : "bg-surface-2 text-[#4a5550] hover:bg-border"}`}
              >
                {c}
              </button>
            );
          })}
        </div>
        {errors.items ? <p role="alert" className="text-12 text-danger">{errors.items}</p> : null}
      </div>
      <Field label="التفاصيل للمزوّد" error={errors.note}>
        {(fid) => (
          <input id={fid} value={note} onChange={(e) => setNote(e.target.value)} aria-invalid={!!errors.note || undefined} className={`${FIELD} w-full outline-none focus:border-[1.5px] focus:border-ink ${errors.note ? "border-danger!" : ""}`} />
        )}
      </Field>
      <Field label="المهلة">
        {(fid) => (
          <Select id={fid} value={deadline} onChange={setDeadline} icon="calendar" options={DEADLINES.map((v) => ({ value: v, label: deadlineLabel(v) }))} className="h-[42px]! [&>span]:text-14! [&>span]:font-normal!" />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]!" onClick={close}>
          إلغاء
        </Button>
        <Button className="h-11!" loading={m.isPending} onClick={() => m.mutate()}>
          إرسال الطلب
        </Button>
      </div>
    </Modal>
  );
}
