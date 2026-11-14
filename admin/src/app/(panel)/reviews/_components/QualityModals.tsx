"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { KV } from "@/components/panel/KV";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { CLOSE_OUTCOMES, HIDE_REASONS, RETURN_REASONS, type ComplaintDetail, type ReviewDetail } from "@/lib/api/reviews";
import { useUrlState } from "@/lib/use-url-state";
import { Area, EndNote, FieldShell, RadioCard } from "../../field-evaluation/_components/bits";

// نوافذ التقييمات والشكاوى (CON5-18M · 500 · r20 · حشو 24 · مسافة 14 · الرئيسي على اليمين):
//   إغلاق بنتيجة · CM-3349 (3114:1049) / CM-3340 (3114:1090) — ?complaint=&modal=rv-close
//   مراسلة المركز · CM-3349 (3114:1131) — rv-center · رسالة للعميل · CM-3349 (3114:1159) — rv-customer
//   إخفاء · RV-88407 (3114:1180) / RV-88395 (3114:1202) — ?review=&modal=rv-hide
//   إعادة الرد للمركز · RV-88402 (3114:1300 · 560) — rv-return
export function QualityModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const cid = url.get("complaint");
  const rid = url.get("review");
  const cOpen = !!cid && ["rv-close", "rv-center", "rv-customer"].includes(modal ?? "");
  const rOpen = !!rid && ["rv-hide", "rv-return"].includes(modal ?? "");
  const cq = useQuery({ queryKey: ["quality", "complaint", cid], queryFn: () => api.quality.complaint(cid!), enabled: cOpen });
  const rq = useQuery({ queryKey: ["quality", "review", rid], queryFn: () => api.quality.review(rid!), enabled: rOpen });
  const close = () => url.replace({ modal: null });
  if (cOpen && cq.data) {
    if (modal === "rv-close") return <CloseModal c={cq.data} close={close} />;
    return <MessageModal c={cq.data} to={modal === "rv-center" ? "center" : "customer"} close={close} />;
  }
  if (rOpen && rq.data) return modal === "rv-hide" ? <HideModal r={rq.data} close={close} /> : <ReturnModal r={rq.data} close={close} />;
  return null;
}

function useDone() {
  const qc = useQueryClient();
  const toast = useToast();
  const url = useUrlState();
  return (title: string, body: string, patch: Record<string, null>) => {
    qc.invalidateQueries({ queryKey: ["quality"] });
    toast(title, body);
    url.replace({ modal: null, ...patch });
  };
}

function Actions({ primary, onPrimary, loading, close, danger, h46 }: { primary: string; onPrimary: () => void; loading: boolean; close: () => void; danger?: boolean; h46?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
      <Button variant={danger ? "danger" : "primary"} className={h46 ? "h-11!" : ""} loading={loading} onClick={onPrimary}>
        {primary}
      </Button>
      <Button variant="secondary" className={h46 ? "h-[46px]!" : "h-[50px]!"} onClick={close}>
        إلغاء
      </Button>
    </div>
  );
}

// ───────────── إغلاق بنتيجة (3114:1049 · 3114:1090) ─────────────
function CloseModal({ c, close }: { c: ComplaintDetail; close: () => void }) {
  const done = useDone();
  const [outcome, setOutcome] = useState(CLOSE_OUTCOMES[0]);
  const [message, setMessage] = useState("أعاد المركز الخدمة مجاناً. نشكرك على صبرك، ويسعدنا تقييمك للحل.");
  const [askRating, setAskRating] = useState(true);
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.quality.close(c.id, { outcome, message, askRating }),
    onSuccess: (r) => done("أُغلقت الشكوى", r.toast, { complaint: null }),
    onError: (e) => isApiError(e) && setErr(e.fields?.message),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={500} title={`إغلاق الشكوى ${c.id}`}>
      <p className="text-12 leading-5 font-medium text-muted">ما النتيجة التي نُفّذت؟</p>
      <div role="radiogroup" aria-label="النتيجة" className="flex flex-col gap-3.5">
        {CLOSE_OUTCOMES.map((o) => (
          <RadioCard key={o} title={o} checked={outcome === o} onSelect={() => setOutcome(o)} />
        ))}
      </div>
      <FieldShell label="رسالة للعميل" id="rv-msg" error={err}>
        <Area id="rv-msg" h={96} medium value={message} invalid={!!err} onChange={(v) => (setMessage(v), setErr(undefined))} />
      </FieldShell>
      <Checkbox label={<span className="text-13 leading-[22px] font-medium">إرسال طلب تقييم الحل للعميل</span>} checked={askRating} onChange={(e) => setAskRating(e.target.checked)} />
      <EndNote tone="trial">لينكار تسجّل النتيجة فقط؛ تنفيذها والتزاماتها المالية على المركز.</EndNote>
      <Actions primary="إغلاق الشكوى" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── مراسلة المركز (3114:1131) / رسالة للعميل (3114:1159) ─────────────
function MessageModal({ c, to, close }: { c: ComplaintDetail; to: "center" | "customer"; close: () => void }) {
  const done = useDone();
  const [text, setText] = useState((to === "center" ? c.centerMsg : c.customerMsg) ?? "");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.quality.message(c.id, to, text),
    onSuccess: (r) => done("أُرسلت الرسالة", r.toast, {}),
    onError: (e) => isApiError(e) && setErr(e.fields?.message),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={500} title={to === "center" ? "مراسلة المركز" : "رسالة للعميل"}>
      <div className="flex flex-col gap-3.5">
        <KV k="إلى">{to === "center" ? (c.centerContact ?? `مسؤول التواصل · ${c.center}`) : (c.customerTo ?? `${c.customer} · إشعار في التطبيق + رسالة نصية`)}</KV>
        {to === "center" ? <KV k="الشكوى">{`${c.id} · ${c.booking}`}</KV> : null}
      </div>
      <FieldShell label="الرسالة" id="rv-text" error={err}>
        <Area id="rv-text" h={96} medium value={text} invalid={!!err} onChange={(v) => (setText(v), setErr(undefined))} />
      </FieldShell>
      {to === "center" ? <EndNote tone="neutral">تظهر الرسالة للمركز في «الشكاوى» ببوابة المزوّد، ويصله إشعار.</EndNote> : null}
      <Actions primary="إرسال" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── إخفاء · RV-88407 (3114:1180) / RV-88395 (3114:1202) ─────────────
function HideModal({ r, close }: { r: ReviewDetail; close: () => void }) {
  const done = useDone();
  const [reason, setReason] = useState(r.hideReason ?? HIDE_REASONS[0]);
  const m = useMutation({ mutationFn: () => api.quality.hide(r.id, reason), onSuccess: (x) => done("أُخفي التقييم", x.toast, { review: null }) });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={500} title={`إخفاء التقييم ${r.id}`}>
      <FieldShell label="السبب" id="rv-hide" hint="من القائمة المرجعية «أسباب إخفاء التقييم»">
        <Select id="rv-hide" value={reason} onChange={setReason} options={HIDE_REASONS.map((v) => ({ value: v, label: v }))} />
      </FieldShell>
      <EndNote tone="pending" icon="alert">
        يُخفى التقييم من صفحة المركز ولا يُحتسب في المتوسط، ويُبلَّغ العميل بالسبب.
      </EndNote>
      <Actions primary="إخفاء التقييم" danger onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── إعادة الرد للمركز مع ملاحظة · RV-88402 (3114:1300 · 560) ─────────────
function ReturnModal({ r, close }: { r: ReviewDetail; close: () => void }) {
  const done = useDone();
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [note, setNote] = useState("أكّد أن الزيارة المجانية متفق عليها مع العميل، أو احذف الوعد واكتفِ بالاعتذار ودعوة العميل للتواصل.");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.quality.returnReply(r.id, { reason, note }),
    onSuccess: (x) => done("أُعيد الرد للمركز", x.toast, {}),
    onError: (e) => isApiError(e) && setErr(e.fields?.note),
  });
  const quote = r.reply?.text.split(" — ")[0] ?? "";
  return (
    <Modal
      open
      onOpenChange={(o) => !o && close()}
      width={560}
      title="إعادة الرد للمركز مع ملاحظة"
      subtitle={`‏${r.id} · ${r.center.split(" ")[0]} · فرع المحمدية · لا يُنشر الرد حتى يعدّله المركز وتعتمده لينكار`}
    >
      <div className="flex min-h-[100px] items-start gap-2 rounded-12 bg-success-tint p-3 text-13 leading-[22px] font-light text-success">
        <p className="min-w-0 flex-1">رد المركز: {quote}</p>
        <Icon name="message" size={16} className="mt-[3px] shrink-0 text-ink" />
      </div>
      <FieldShell label="السبب · من «قوالب الردود»" id="rv-ret-reason">
        <Select id="rv-ret-reason" className="text-14! [&>span]:font-normal!" value={reason} onChange={setReason} options={RETURN_REASONS.map((v) => ({ value: v, label: v }))} />
      </FieldShell>
      <FieldShell label="ملاحظة لينكار للمركز" id="rv-ret-note" error={err}>
        <Area id="rv-ret-note" value={note} invalid={!!err} onChange={(v) => (setNote(v), setErr(undefined))} />
      </FieldShell>
      <Actions primary="إعادة للمركز" onPrimary={() => m.mutate()} loading={m.isPending} close={close} h46 />
    </Modal>
  );
}
