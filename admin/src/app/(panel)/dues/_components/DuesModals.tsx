"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DKV, WarnNote } from "@/components/finance/bits";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { CLAIM_EDIT_REASONS, CLAIM_REJECT_REASONS, DEDUCTION_COMPLAINTS, DEDUCTION_TYPES } from "@/lib/api/dues";
import { useUrlState } from "@/lib/use-url-state";

// نوافذ مستحقات المزوّدين (CON5-14M) — r20 · حشو 24 · مسافة 14 · عنوان 18 Bold (+ سطر 13 Light) · حقول 44 r10 نص 14 · أزرار 46/44 بعرض متساوي
//   ?modal=preview                     معاينة دفعة 1 نوفمبر (3114:72265) → «جدولة الدفعة» → CON5-14T جُدولت دفعة 1 نوفمبر (72261)
//   ?modal=deduction&provider=<id>     إضافة خصم أو تسوية · جونسون (72225) → CON5-14T أُضيف الخصم · جونسون (72221)
//   ?modal=transfer&provider=<id>      تحويل · نانو شيلد (73304) · درع (73346) · جونسون (74838) → CON5-14T تم التحويل (73342 · 73384 · 74876)
//   ?modal=claim-edit&claim=<CL>       طلب تعديل المطالبة (73576) → CON5-14T أُعيدت المطالبة (73622)
//   ?modal=claim-reject&claim=<CL>     رفض المطالبة (73599) → CON5-14T رُفضت المطالبة (73826)
// (نافذة المعاينة والتحويل في Figma على بُعد 138 من فوق مش في النص — متطبّق على الشاشات الكبيرة.)
const TOP = "sm:top-[138px]! sm:translate-y-0!";
const SUMMARY = "flex flex-col rounded-12 bg-surface-1 px-3.5 py-2";
const F44 = "h-11! [&>span]:text-14! [&>span]:font-normal!";

export function DuesModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const provider = url.get("provider") ?? "";
  const claim = url.get("claim") ?? "";
  const close = () => url.replace({ modal: null });
  switch (modal) {
    case "preview":
      return <PreviewModal onClose={close} />;
    case "deduction":
      return <DeductionModal key={provider} providerId={provider} onClose={close} />;
    case "transfer":
      return <TransferModal key={provider} providerId={provider} onClose={() => url.replace({ modal: null, provider: null })} />;
    case "claim-edit":
    case "claim-reject":
      return <ClaimModal key={modal + claim} id={claim} kind={modal === "claim-edit" ? "edit" : "reject"} onClose={close} onDone={() => url.replace({ modal: null, claim: null, tab: "claims" })} />;
    default:
      return null;
  }
}

function Summary({ rows }: { rows: [string, string][] }) {
  return (
    <div className={SUMMARY}>
      {rows.map(([k, v]) => (
        <DKV key={k} k={k}>
          {v}
        </DKV>
      ))}
    </div>
  );
}

// ───────────── معاينة دفعة 1 نوفمبر ─────────────
function PreviewModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dues", "payout"], queryFn: () => api.dues.payout() });
  const m = useMutation({
    mutationFn: () => api.dues.schedulePayout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dues"] });
      onClose();
      toast("جُدولت الدفعة", "جُدولت دفعة 1 نوفمبر 2026 · 25 تحويلاً لـ 21 مقدّم خدمة · 2.14 مليون ر.س · آخر تسوية شهرية");
    },
  });
  const d = q.data;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && onClose()}
      title={d?.title ?? "دفعة تحويل 1 نوفمبر 2026"}
      subtitle={d?.subtitle ?? " "}
      width={600}
      className={TOP}
      footer={
        <>
          <Button variant="accent" className="h-11!" loading={m.isPending} disabled={!d || d.scheduled} onClick={() => m.mutate()}>
            {d?.scheduled ? "جُدولت الدفعة" : "جدولة الدفعة"}
            <Icon name="calendar" size={16} />
          </Button>
          <Button variant="secondary" className="h-[46px]!" onClick={onClose} disabled={m.isPending}>
            إغلاق
          </Button>
        </>
      }
    >
      {d ? (
        <>
          <Summary rows={d.rows} />
          <WarnNote>{d.note}</WarnNote>
        </>
      ) : (
        <Skeleton className="h-[176px] w-full rounded-12" />
      )}
    </Modal>
  );
}

// ───────────── تحويل مستحقات … ─────────────
function TransferModal({ providerId, onClose }: { providerId: string; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dues", "quote", providerId], queryFn: () => api.dues.quote(providerId), retry: false });
  const m = useMutation({
    mutationFn: () => api.dues.confirmTransfer(providerId),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["dues"] });
      onClose();
      // نص تأكيد جونسون في Figma (74876) = سطر الملاحظة «يُسجَّل التحويل برقم …» — متطبّق زي ما هو
      toast("تم التحويل", providerId === "lk-jn-001" ? `يُسجَّل التحويل برقم ${r.id} ويصل المزوّد إشعار به.` : `تم تحويل ${r.amount} ر.س إلى ${r.name} · ${r.id}`);
    },
  });
  const d = q.data;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && onClose()}
      title={d ? `تحويل مستحقات ${d.name}` : "تحويل المستحقات"}
      subtitle={d?.subtitle ?? " "}
      width={600}
      className={TOP}
      footer={
        <>
          <Button variant="accent" className="h-11!" loading={m.isPending} disabled={!d} onClick={() => m.mutate()}>
            تأكيد التحويل
            <Icon name="calendar" size={16} />
          </Button>
          <Button variant="secondary" className="h-[46px]!" onClick={onClose} disabled={m.isPending}>
            إغلاق
          </Button>
        </>
      }
    >
      {q.isError ? (
        <p className="py-6 text-center text-13 text-muted">{isApiError(q.error, 404) ? "لا يوجد مستحق جاهز للتحويل" : "تعذّر التحميل"}</p>
      ) : d ? (
        <>
          <Summary rows={d.rows} />
          {d.note ? <WarnNote>{d.note}</WarnNote> : null}
        </>
      ) : (
        <Skeleton className="h-[176px] w-full rounded-12" />
      )}
    </Modal>
  );
}

// ───────────── إضافة خصم أو تسوية ─────────────
const dedSchema = z.object({
  type: z.string().min(1, "اختر نوع الخصم"),
  complaint: z.string(),
  amount: z.number({ error: "أدخل المبلغ" }).positive("أدخل المبلغ"),
  note: z.string().min(1, "اكتب الملاحظة"),
});
type Ded = z.infer<typeof dedSchema>;
const NAMES: Record<string, string> = { "lk-jn-001": "جونسون LK-JN-001", "lk-lm-001": "لومار LK-LM-001", "lk-xp-001": "XPEL LK-XP-001", "lk-ns-001": "نانو شيلد LK-NS-001", "lk-dr-001": "مركز درع للحماية LK-DR-001", "lk-la-001": "مركز لمعة للتلميع LK-LA-001" };

function FieldBox({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
      {children}
      {error ? <span className="text-12 text-danger">{error}</span> : null}
    </div>
  );
}
const INPUT = "w-full rounded-10 border bg-white px-3 text-14 leading-[22px] font-normal text-ink outline-none placeholder:text-[#9aa39f] focus:border-[1.5px] focus:border-ink";

function DeductionModal({ providerId, onClose }: { providerId: string; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const complaints = DEDUCTION_COMPLAINTS[providerId] ?? [];
  const isJn = providerId === "lk-jn-001";
  const { register, control, handleSubmit, formState, setError } = useForm<Ded>({
    resolver: zodResolver(dedSchema),
    defaultValues: isJn
      ? { type: DEDUCTION_TYPES[0], complaint: complaints[0], amount: 500, note: "استرداد جزئي للعميل بعد ثبوت عيب في التنفيذ (فقاعات في الغطاء الأمامي) حسب قرار الجودة." }
      : { type: DEDUCTION_TYPES[0], complaint: complaints[0] ?? "", amount: undefined as unknown as number, note: "" },
  });
  const dirty = formState.isDirty;
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const m = useMutation({
    mutationFn: (v: Ded) => api.dues.addDeduction(providerId, v),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["dues"] });
      onClose();
      toast("أُضيف الخصم", `أُضيف خصم ${r.amount} ر.س على مستحقات ${r.name} · يظهر سطراً مستقلاً في كشفها`);
    },
    onError: (e) => {
      if (isApiError(e, 422) && e.fields) for (const [k, v] of Object.entries(e.fields)) setError(k as keyof Ded, { message: v });
    },
  });
  const tryClose = () => {
    if (m.isPending) return;
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    onClose();
  };
  const err = formState.errors;
  const amount = useWatch({ control, name: "amount" });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && tryClose()}
      title="إضافة خصم أو تسوية"
      subtitle={`${NAMES[providerId] ?? providerId} · كشف أكتوبر 2026 · يُحوَّل 1 نوفمبر 2026`}
      width={560}
      footer={
        <>
          <Button className="h-11!" loading={m.isPending} onClick={handleSubmit((v) => m.mutate(v))}>
            إضافة الخصم
          </Button>
          <Button variant="secondary" className="h-[46px]!" onClick={tryClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </>
      }
    >
      <FieldBox label="نوع الخصم" error={err.type?.message}>
        <Controller control={control} name="type" render={({ field }) => <Select ariaLabel="نوع الخصم" value={field.value} onChange={field.onChange} invalid={!!err.type} className={F44} options={DEDUCTION_TYPES.map((t) => ({ value: t, label: t }))} />} />
      </FieldBox>
      {complaints.length ? (
        <FieldBox label="الشكوى والحجز">
          <Controller control={control} name="complaint" render={({ field }) => <Select ariaLabel="الشكوى والحجز" value={field.value} onChange={field.onChange} className={F44} options={complaints.map((t) => ({ value: t, label: t }))} />} />
        </FieldBox>
      ) : null}
      <FieldBox label="المبلغ المخصوم من المزوّد · شامل الضريبة" error={err.amount?.message}>
        <div className={`flex h-11 items-center gap-1 rounded-10 border bg-white px-3 text-14 ${err.amount ? "border-danger" : "border-border"} focus-within:border-[1.5px] focus-within:border-ink`}>
          <input type="number" inputMode="decimal" aria-label="المبلغ" {...register("amount", { valueAsNumber: true })} className="num w-14 bg-transparent text-14 font-normal text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" style={{ width: `${Math.max(2, String(amount || "").length + 1)}ch` }} />
          <span className="text-14 font-normal text-ink">ر.س{isJn ? " · من سعر التكلفة 1,990" : ""}</span>
        </div>
      </FieldBox>
      <FieldBox label="ملاحظة تظهر للمزوّد" error={err.note?.message}>
        <textarea {...register("note")} rows={2} aria-label="ملاحظة تظهر للمزوّد" className={`${INPUT} h-[72px] resize-none pt-2.5 ${err.note ? "border-danger" : "border-border"}`} />
      </FieldBox>
      <WarnNote>يظهر الخصم للمزوّد سطراً مستقلاً في «المستحقات» قبل التحويل، ويصله إشعار بالسبب. القاعدة (خصم الاسترداد بعد شكوى مثبتة من المزوّد) معتمدة مؤقتاً حتى قرار العميل.</WarnNote>
    </Modal>
  );
}

// ───────────── طلب تعديل / رفض المطالبة ─────────────
const claimSchema = z.object({ reason: z.string().min(1, "اختر السبب"), note: z.string() });
type ClaimV = z.infer<typeof claimSchema>;

function ClaimModal({ id, kind, onClose, onDone }: { id: string; kind: "edit" | "reject"; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const edit = kind === "edit";
  const reasons = edit ? CLAIM_EDIT_REASONS : CLAIM_REJECT_REASONS;
  const { register, control, handleSubmit, formState } = useForm<ClaimV>({ resolver: zodResolver(claimSchema), defaultValues: { reason: reasons[0], note: "" } });
  const m = useMutation({
    mutationFn: (v: ClaimV) => (edit ? api.dues.returnClaim(id, v) : api.dues.rejectClaim(id, v)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dues"] });
      onDone();
      toast(edit ? "أُعيدت المطالبة" : "رُفضت المطالبة", edit ? "أُعيدت المطالبة لمقدّم الخدمة للتعديل" : "رُفضت المطالبة وأُبلغ مقدّم الخدمة");
    },
  });
  const tryClose = () => {
    if (m.isPending) return;
    if (formState.isDirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    onClose();
  };
  return (
    <Modal
      open
      onOpenChange={(o) => !o && tryClose()}
      title={edit ? "طلب تعديل المطالبة" : "رفض المطالبة"}
      width={560}
      footer={
        <>
          <Button variant={edit ? "accent" : "danger"} className="h-11!" loading={m.isPending} onClick={handleSubmit((v) => m.mutate(v))}>
            {edit ? "إرسال لمقدّم الخدمة" : "رفض المطالبة"}
          </Button>
          <Button variant="secondary" className="h-[46px]!" onClick={tryClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </>
      }
    >
      <FieldBox label={edit ? "سبب التعديل" : "سبب الرفض"} error={formState.errors.reason?.message}>
        <Controller control={control} name="reason" render={({ field }) => <Select ariaLabel={edit ? "سبب التعديل" : "سبب الرفض"} value={field.value} onChange={field.onChange} className={F44} options={reasons.map((t) => ({ value: t, label: t }))} />} />
      </FieldBox>
      <FieldBox label="ملاحظة لمقدّم الخدمة">
        <textarea {...register("note")} rows={3} aria-label="ملاحظة لمقدّم الخدمة" placeholder={edit ? "مثال: يرجى إصدار الفاتورة بإجمالي 147,380.00 ر.س" : "اكتب الملاحظة"} className={`${INPUT} h-[88px] resize-none border-border pt-2.5`} />
      </FieldBox>
    </Modal>
  );
}
