"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { CHANNEL_OPTIONS, CITY_OPTIONS, JOIN_REJECT_REASONS, REJECT_COMMISSION_REASONS, STOP_REASONS } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { CheckRow, MKV, MNote, MPill, MTile } from "./bits";

// نوافذ المسوّقين (CON5-10M / CON5-10A) — ?modal=<key>&id=<SM/BK/AR/MQ/PY> (القسم 2.3)
export function MarketerModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("id") ?? "";
  const close = () => url.replace({ modal: null, id: null });
  if (!modal || modal.startsWith("m00-")) return null;
  switch (modal) {
    case "stop":
      return <StopModal id={id} onClose={close} />;
    case "reactivate":
      return <ReactivateModal id={id} onClose={close} />;
    case "commission-approve":
      return <ApproveCommission id={id} onClose={close} />;
    case "commission-reject":
      return <RejectCommission id={id} onClose={close} />;
    case "add":
      return <AddModal onClose={close} />;
    case "join-approve":
      return <JoinApprove id={id} onClose={close} />;
    case "join-reject":
      return <JoinReject id={id} onClose={close} />;
    case "join-complete":
      return <JoinComplete id={id} onClose={close} />;
    case "mq-reject":
      return <RequestReject id={id} onClose={close} />;
    case "transfer":
      return <TransferModal id={id} onClose={close} />;
    case "actions":
      return <ActionsModal id={id} onClose={close} />;
    case "edit":
      return <EditModal id={id} onClose={close} />;
    case "balance":
      return <BalanceModal id={id} onClose={close} />;
    default:
      return null;
  }
}

/** حقل نص متعدد الأسطر: r10 · حشو 10·12 · 13 Medium (أو 14 Regular) */
function Area({ id, value, onChange, placeholder, h = 80, regular, invalid }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; h?: number; regular?: boolean; invalid?: boolean }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      style={{ height: h }}
      className={`w-full resize-none rounded-10 border bg-white px-3 pt-2.5 text-ink outline-none placeholder:text-[#9aa39f] focus:border-[1.5px] focus:border-ink ${regular ? "text-14 leading-6 font-normal" : "text-13 leading-[22px] font-medium"} ${invalid ? "border-danger" : "border-border"}`}
    />
  );
}
/** حقل 44 بنص 14 Regular (نوافذ 10M الأحدث) */
const R14 = "[&_input]:text-14! [&_input]:font-normal!";

function useFinish(onClose: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body?: string) => {
    qc.invalidateQueries({ queryKey: ["marketers"] });
    toast(title, body);
    onClose();
  };
}
const fieldError = (e: unknown, k: string) => (isApiError(e) ? e.fields?.[k] : undefined);

function Foot({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <>
      {children}
      <Button variant="secondary" onClick={onClose}>
        إلغاء
      </Button>
    </>
  );
}

// ───────────── CON5-10M · إيقاف (SM118 3114:10751 · SM123 10773 · SM140 10795 · SM131 10817 · SM152 10839) ─────────────
function StopModal({ id, onClose }: { id: string; onClose: () => void }) {
  const m = useQuery({ queryKey: ["marketers", "one", id], queryFn: () => api.marketers.get(id) });
  const [reason, setReason] = useState(STOP_REASONS[0].value);
  const finish = useFinish(onClose);
  const save = useMutation({ mutationFn: () => api.marketers.stop(id, reason), onSuccess: () => finish("أُوقف المسوّق", "أُوقف المسوّق وتعطّل الرابط والكود") });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={`إيقاف ${m.data?.name ?? id}`}
      footer={
        <Foot onClose={onClose}>
          <Button variant="danger" loading={save.isPending} onClick={() => save.mutate()}>
            إيقاف المسوّق
          </Button>
        </Foot>
      }
    >
      <Field label="السبب" error={fieldError(save.error, "reason")}>
        {(fid) => <Select id={fid} value={reason} options={STOP_REASONS} onChange={setReason} />}
      </Field>
      <MNote tone="warning" icon="alert">
        يتعطل الرابط والكود فوراً. العمولات المستحقة قبل الإيقاف تُصرف في دفعة الشهر.
      </MNote>
    </Modal>
  );
}

// ───────────── CON5-10M · إعادة تفعيل · SM104 (3114:3900 — في قسم الوكالات) ─────────────
function ReactivateModal({ id, onClose }: { id: string; onClose: () => void }) {
  const m = useQuery({ queryKey: ["marketers", "one", id], queryFn: () => api.marketers.get(id) });
  const text = `يعود كود المسوّق ${id} للعمل، وتُحتسب عمولته على الحجوزات الجديدة فقط.`;
  const [note, setNote] = useState(text);
  const finish = useFinish(onClose);
  const save = useMutation({ mutationFn: () => api.marketers.reactivate(id), onSuccess: () => finish("أُعيد تفعيل المسوّق", "أُعيد تفعيل المسوّق وعاد الرابط والكود للعمل") });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={500}
      title={`إعادة تفعيل ${m.data?.name ?? ""} · ${id}`}
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            إعادة التفعيل
          </Button>
        </Foot>
      }
    >
      <MNote tone="info" icon="info">
        {ltrRuns(text)}
      </MNote>
      <Field label="ملاحظة">{(fid) => <Area id={fid} value={note} onChange={setNote} />}</Field>
    </Modal>
  );
}

// ───────────── CON5-10M · اعتماد / رفض عمولة (BK-21458 3114:10861 · 3114:10886) ─────────────
function ApproveCommission({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useQuery({ queryKey: ["marketers", "sale", id], queryFn: () => api.marketers.sale(id) });
  const [note, setNote] = useState("تحققنا: العميل مختلف ويستخدم جهاز العائلة.");
  const finish = useFinish(onClose);
  const save = useMutation({ mutationFn: () => api.marketers.approveCommission(id), onSuccess: () => finish("اعتُمدت العمولة", "اعتُمدت العمولة وأُضيفت لدفعة أكتوبر") });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={`اعتماد عمولة ${id}`}
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            اعتماد العمولة
          </Button>
        </Foot>
      }
    >
      <MKV k="المسوّق">{s.data ? ltrRuns(`${s.data.marketer.name} · ${s.data.marketerId}`) : "…"}</MKV>
      <MKV k="العمولة">{s.data ? `${num(s.data.amount, 2)} ر.س` : "…"}</MKV>
      <Field label="ملاحظة">{(fid) => <Area id={fid} value={note} onChange={setNote} />}</Field>
    </Modal>
  );
}
function RejectCommission({ id, onClose }: { id: string; onClose: () => void }) {
  const [reason, setReason] = useState(REJECT_COMMISSION_REASONS[0].value);
  const [msg, setMsg] = useState("لا تُحتسب العمولة على الحجوزات المكررة من نفس الجهاز.");
  const finish = useFinish(onClose);
  const save = useMutation({ mutationFn: () => api.marketers.rejectCommission(id, reason), onSuccess: () => finish("رُفضت العمولة", "رُفضت العمولة وأُبلغ المسوّق") });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={`رفض عمولة ${id}`}
      footer={
        <Foot onClose={onClose}>
          <Button variant="danger" loading={save.isPending} onClick={() => save.mutate()}>
            رفض العمولة
          </Button>
        </Foot>
      }
    >
      <Field label="السبب" error={fieldError(save.error, "reason")}>
        {(fid) => <Select id={fid} value={reason} options={REJECT_COMMISSION_REASONS} onChange={setReason} />}
      </Field>
      <Field label="رسالة للمسوّق">{(fid) => <Area id={fid} value={msg} onChange={setMsg} />}</Field>
    </Modal>
  );
}

// ───────────── CON5-10M · إضافة مسوّق (3114:10920) ─────────────
const addSchema = z.object({
  name: z.string().trim().min(1, "اكتب الاسم"),
  phone: z.string().refine((v) => /^05\d{8}$/.test(v.replace(/\s/g, "")), "رقم جوال غير صحيح"),
  channel: z.string().min(1, "اختر قناة الترويج"),
  city: z.string().min(1, "اختر المدينة"),
  iban: z.string().trim().min(1, "اكتب الآيبان"),
});
type AddValues = z.infer<typeof addSchema>;
function AddModal({ onClose }: { onClose: () => void }) {
  const finish = useFinish(onClose);
  const { register, control, handleSubmit, formState, setError } = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { name: "غادة السبيعي", phone: "054 663 2081", channel: "إنستغرام", city: "الرياض", iban: "SA12 8000 •••• 7735 · الراجحي" },
  });
  const next = api.marketers.nextId();
  const save = useMutation({
    mutationFn: (v: AddValues) => api.marketers.add(v),
    onSuccess: (r) => finish("أُضيف المسوّق", `أُضيفت ${r.name} ${r.id} وتفعّل الحساب · أُرسل رابط البوابة`),
    onError: (e) => isApiError(e) && Object.entries(e.fields ?? {}).forEach(([k, msg]) => setError(k as keyof AddValues, { message: msg })),
  });
  const e = formState.errors;
  const confirmLeave = () => (!formState.isDirty || window.confirm("في تغييرات لم تُحفظ. الخروج بدون حفظ؟")) && onClose();
  return (
    <Modal
      open
      onOpenChange={(o) => !o && confirmLeave()}
      width={640}
      title="إضافة مسوّق"
      className="gap-4!"
      footer={
        <Foot onClose={confirmLeave}>
          <Button loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            إضافة وتفعيل
          </Button>
        </Foot>
      }
    >
      <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
        <Field label="الاسم" error={e.name?.message}>
          {(fid) => <TextInput id={fid} invalid={!!e.name} {...register("name")} />}
        </Field>
        <Field label="الجوال" error={e.phone?.message}>
          {(fid) => <TextInput id={fid} inputMode="tel" invalid={!!e.phone} {...register("phone")} />}
        </Field>
        <Field label="المدينة" error={e.city?.message}>
          {(fid) => <Controller control={control} name="city" render={({ field }) => <Select id={fid} value={field.value} options={CITY_OPTIONS} onChange={field.onChange} invalid={!!e.city} />} />}
        </Field>
        <Field label="قناة الترويج" error={e.channel?.message}>
          {(fid) => <Controller control={control} name="channel" render={({ field }) => <Select id={fid} value={field.value} options={CHANNEL_OPTIONS} onChange={field.onChange} invalid={!!e.channel} />} />}
        </Field>
      </div>
      <Field label="الآيبان" error={e.iban?.message} hint="لتحويل العمولات الشهرية">
        {(fid) => <TextInput id={fid} invalid={!!e.iban} {...register("iban")} />}
      </Field>
      <div className="flex items-center gap-2.5 rounded-10 bg-surface-1 px-3 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-white text-ink">
          <Icon name="file" size={16} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-13 leading-[22px] font-medium text-ink">الهوية الوطنية</span>
          <span className="text-12 leading-5 font-medium text-muted">موثّقة عبر نفاذ</span>
        </span>
        <MPill tone="success">مرفوع</MPill>
      </div>
      <MTile title="يُنشأ تلقائياً">
        <MKV k="معرّف الإحالة">{next}</MKV>
        <MKV k="كود العميل">{ltrRuns(`${next}-300 · رصيد 300 ر.س للعميل`)}</MKV>
        <MKV k="العمولة">حسب كل خدمة · نسبة أو مبلغ ثابت</MKV>
      </MTile>
      <MNote tone="success" icon="check">
        يتفعّل الحساب ويصل للمسوّق رابط البوابة.
      </MNote>
    </Modal>
  );
}

// ───────────── CON5-10M · اعتماد / رفض / طلب استكمال (AR-0058 3114:11259/11325/11379 · AR-0057 11292/11352/11407) ─────────────
function JoinApprove({ id, onClose }: { id: string; onClose: () => void }) {
  const j = useQuery({ queryKey: ["marketers", "join", id], queryFn: () => api.marketers.join(id) });
  const [checked, setChecked] = useState(false);
  const finish = useFinish(onClose);
  const save = useMutation({
    mutationFn: () => api.marketers.approveJoin(id),
    onSuccess: (r) => finish("اعتُمد المسوّق", `${r.female ? "اعتُمدت" : "اعتُمد"} ${r.name} ${r.id} وتفعّل الحساب · أُرسل رابط البوابة`),
  });
  const d = j.data;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={d ? `اعتماد ${d.female ? "المسوّقة" : "المسوّق"} ${d.name}` : "اعتماد"}
      description={<bdi>{id}</bdi>}
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} disabled={!checked} icon={<Icon name="check" size={18} />} onClick={() => save.mutate()}>
            اعتماد المسوّق
          </Button>
        </Foot>
      }
    >
      {d ? (
        <ul className="flex flex-col gap-2">
          {[`يُنشأ معرّف الإحالة ${d.newId} ورابط وQR خاص ${d.female ? "بها" : "به"}`, `كود العميل ${d.newId}-300 يمنح العميل رصيد 300 ر.س`, "العمولة حسب كل خدمة · نسبة أو مبلغ ثابت"].map((t) => (
            <li key={t} className="flex items-center gap-2 text-13 leading-[22px] font-light text-ink">
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
                <Icon name="check" size={12} />
              </span>
              {ltrRuns(t)}
            </li>
          ))}
        </ul>
      ) : null}
      <CheckRow checked={checked} onChange={setChecked}>
        راجعت المستندات والبيانات المرفقة
      </CheckRow>
    </Modal>
  );
}
function JoinReject({ id, onClose }: { id: string; onClose: () => void }) {
  const j = useQuery({ queryKey: ["marketers", "join", id], queryFn: () => api.marketers.join(id) });
  const [reason, setReason] = useState(JOIN_REJECT_REASONS[0].value);
  const [msg, setMsg] = useState("نأسف، لم نتمكن من اعتماد الطلب لعدم اكتمال المستندات. يمكنكم التقديم من جديد بعد استكمالها.");
  const finish = useFinish(onClose);
  const save = useMutation({ mutationFn: () => api.marketers.rejectJoin(id, reason, msg), onSuccess: () => finish("رُفض الطلب", "رُفض الطلب وأُبلغ المسوّق بالسبب") });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={`رفض الطلب ${id}`}
      description={j.data ? `${j.data.name} · انضمام مسوّق` : undefined}
      footer={
        <Foot onClose={onClose}>
          <Button variant="danger" loading={save.isPending} onClick={() => save.mutate()}>
            رفض الطلب
          </Button>
        </Foot>
      }
    >
      <Field label="سبب الرفض" error={fieldError(save.error, "reason")}>
        {(fid) => <Select id={fid} value={reason} options={JOIN_REJECT_REASONS} onChange={setReason} />}
      </Field>
      <Field label="رسالة للجهة" error={fieldError(save.error, "message")}>
        {(fid) => <Area id={fid} value={msg} onChange={setMsg} h={96} invalid={!!fieldError(save.error, "message")} />}
      </Field>
      <MNote tone="neutral" icon="info">
        يصل القرار للجهة برسالة نصية وبريد.
      </MNote>
    </Modal>
  );
}
function JoinComplete({ id, onClose }: { id: string; onClose: () => void }) {
  const j = useQuery({ queryKey: ["marketers", "join", id], queryFn: () => api.marketers.join(id) });
  const d = j.data;
  return d ? <JoinCompleteForm key={id} id={id} d={d} onClose={onClose} /> : null;
}
function JoinCompleteForm({ id, d, onClose }: { id: string; d: Awaited<ReturnType<typeof api.marketers.join>>; onClose: () => void }) {
  const [items, setItems] = useState(d.complete.items.map((i) => i.checked));
  const [note, setNote] = useState(d.complete.placeholder ? "" : d.complete.note);
  const finish = useFinish(onClose);
  const save = useMutation({
    mutationFn: () => api.marketers.completeJoin(id, d.complete.items.filter((_, i) => items[i]).map((i) => i.label), note),
    onSuccess: () => finish("طلب استكمال", "أُرسل طلب الاستكمال للمسوّق برابط البوابة"),
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={`طلب استكمال · ${id}`}
      description={d.name}
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            إرسال الطلب
          </Button>
        </Foot>
      }
    >
      <p className="text-12 leading-5 font-medium text-muted">ما المطلوب استكماله؟</p>
      {d.complete.items.map((it, i) => (
        <CheckRow key={it.label} checked={items[i]} onChange={(v) => setItems((l) => l.map((x, k) => (k === i ? v : x)))}>
          {it.label}
        </CheckRow>
      ))}
      {fieldError(save.error, "items") ? <p className="text-12 text-danger">{fieldError(save.error, "items")}</p> : null}
      <Field label="ملاحظة للجهة" error={fieldError(save.error, "note")}>
        {(fid) => <Area id={fid} value={note} onChange={setNote} h={96} placeholder={d.complete.placeholder ? d.complete.note : undefined} invalid={!!fieldError(save.error, "note")} />}
      </Field>
      <p className="text-13 leading-[22px] font-light text-muted">تصل الجهة رسالة نصية وبريد برابط البوابة لرفع المطلوب.</p>
    </Modal>
  );
}

// ───────────── CON5-10M · رفض طلب المسوّق (MQ-2026-0021 3114:12151 · MQ-2026-0022 3114:12213) ─────────────
function RequestReject({ id, onClose }: { id: string; onClose: () => void }) {
  const r = useQuery({ queryKey: ["marketers", "mq", id], queryFn: () => api.marketers.request(id) });
  const [reason, setReason] = useState("");
  const url = useUrlState();
  const finish = useFinish(() => url.replace({ modal: null, id: null, mq: null }));
  const save = useMutation({ mutationFn: () => api.marketers.rejectRequest(id, reason), onSuccess: () => finish("رُفض طلب المسوّق", "رُفض الطلب وأُبلغ المسوّق بالسبب") });
  const err = fieldError(save.error, "reason");
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={500}
      title={r.data?.kind === "bank" ? "رفض طلب تعديل الحساب" : "رفض طلب التعديل"}
      footer={
        <Foot onClose={onClose}>
          <Button variant="danger" loading={save.isPending} onClick={() => save.mutate()}>
            رفض الطلب
          </Button>
        </Foot>
      }
    >
      <MKV b k="الطلب">{r.data ? ltrRuns(`${id} · ${r.data.field}`) : "…"}</MKV>
      <Field label="سبب الرفض" error={err}>
        {(fid) => <Area id={fid} value={reason} onChange={setReason} h={76} regular placeholder="اكتب السبب" invalid={!!err} />}
      </Field>
    </Modal>
  );
}

// ───────────── CON5-10M · تسجيل التحويل · PY-2026-11-001 (3114:12233) ─────────────
const transferSchema = z.object({ ref: z.string().trim().min(1, "اكتب رقم المرجع"), date: z.string().trim().min(1, "اختر التاريخ"), note: z.string() });
type TransferValues = z.infer<typeof transferSchema>;
function TransferModal({ id, onClose }: { id: string; onClose: () => void }) {
  const p = useQuery({ queryKey: ["marketers", "payout", id], queryFn: () => api.marketers.payout(id) });
  const finish = useFinish(onClose);
  const { register, handleSubmit, formState } = useForm<TransferValues>({ resolver: zodResolver(transferSchema), defaultValues: { ref: "", date: "1 نوفمبر 2026", note: "" } });
  const save = useMutation({ mutationFn: (v: TransferValues) => api.marketers.registerTransfer(id, v), onSuccess: () => finish("سُجّل تحويل الدفعة", "سُجّل التحويل وأُشعر المسوّقون") });
  const e = formState.errors;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={500}
      title="تسجيل تحويل الدفعة"
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            تسجيل التحويل
          </Button>
        </Foot>
      }
    >
      <MKV b k="الدفعة">{p.data ? ltrRuns(`${id} · ${p.data.period} · ${num(p.data.marketers)} مسوّقاً`) : "…"}</MKV>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="تاريخ التحويل" error={e.date?.message}>
          {(fid) => <TextInput id={fid} className={R14} invalid={!!e.date} {...register("date")} />}
        </Field>
        <Field label="مرجع التحويل" error={e.ref?.message}>
          {(fid) => <TextInput id={fid} className={`${R14} [&_input]:placeholder:text-[#9aa39f]!`} placeholder="اكتب رقم المرجع" invalid={!!e.ref} {...register("ref")} />}
        </Field>
      </div>
      <Field label="ملاحظة">
        {(fid) => (
          <textarea
            id={fid}
            {...register("note")}
            placeholder="اختياري"
            className="h-[76px] w-full resize-none rounded-10 border border-border bg-white px-3 pt-2.5 text-14 leading-6 text-ink outline-none placeholder:text-[#9aa39f] focus:border-[1.5px] focus:border-ink"
          />
        )}
      </Field>
    </Modal>
  );
}

// ───────────── CON5-10A · إجراءات · SM123 (3114:12032) ─────────────
function ActionsModal({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const m = useQuery({ queryKey: ["marketers", "one", id], queryFn: () => api.marketers.get(id) });
  const active = m.data?.status !== "stopped";
  const item = (icon: "edit" | "lock", label: string, onClick: () => void, danger?: boolean) => (
    <button type="button" onClick={onClick} className="flex h-11 items-center gap-2.5 rounded-10 px-3 text-start hover:bg-surface-1">
      <Icon name={icon} size={18} className="shrink-0 text-ink" />
      <span className={`min-w-0 flex-1 text-14 leading-[22px] font-medium ${danger ? "text-danger-strong" : "text-ink"}`}>{label}</span>
      <Icon name="chevron-left" size={16} className="shrink-0 text-muted" />
    </button>
  );
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} width={440} title={id} subtitle={`${m.data?.name ?? ""} · مسوّق`}>
      <div className="flex flex-col gap-0.5">
        {item("edit", "تعديل بيانات المسوّق", () => url.replace({ modal: "edit", id }))}
        <div className="h-px bg-border" />
        {active ? item("lock", "إيقاف المسوّق", () => url.replace({ modal: "stop", id }), true) : item("lock", "إعادة تفعيل المسوّق", () => url.replace({ modal: "reactivate", id }))}
      </div>
    </Modal>
  );
}

// ───────────── CON5-10M · تعديل البيانات · SM123 (3114:12052) ─────────────
const editSchema = z.object({
  name: z.string().trim().min(1, "اكتب الاسم"),
  phone: z.string().refine((v) => /^05\d{8}$/.test(v.replace(/\s/g, "")), "رقم جوال غير صحيح"),
  email: z.email("بريد غير صحيح"),
  channel: z.string().trim().min(1, "اكتب قناة الترويج"),
  city: z.string().trim().min(1, "اكتب المدينة"),
});
type EditValues = z.infer<typeof editSchema>;
function EditModal({ id, onClose }: { id: string; onClose: () => void }) {
  const p = useQuery({ queryKey: ["marketers", "profile", id], queryFn: () => api.marketers.profile(id) });
  return p.data?.profile ? <EditForm id={id} v={{ name: p.data.name, phone: p.data.profile.phone, email: p.data.profile.email, channel: p.data.profile.channel, city: p.data.city }} onClose={onClose} /> : null;
}
function EditForm({ id, v, onClose }: { id: string; v: EditValues; onClose: () => void }) {
  const finish = useFinish(onClose);
  const { register, handleSubmit, formState, setError } = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues: v });
  const save = useMutation({
    mutationFn: (x: EditValues) => api.marketers.saveData(id, x),
    onSuccess: () => finish("حُفظت بيانات المسوّق", "حُفظت بيانات المسوّق"),
    onError: (e) => isApiError(e) && Object.entries(e.fields ?? {}).forEach(([k, msg]) => setError(k as keyof EditValues, { message: msg })),
  });
  const e = formState.errors;
  const confirmLeave = () => (!formState.isDirty || window.confirm("في تغييرات لم تُحفظ. الخروج بدون حفظ؟")) && onClose();
  return (
    <Modal
      open
      onOpenChange={(o) => !o && confirmLeave()}
      width={500}
      title="تعديل بيانات المسوّق"
      footer={
        <Foot onClose={confirmLeave}>
          <Button loading={save.isPending} onClick={handleSubmit((x) => save.mutate(x))}>
            حفظ البيانات
          </Button>
        </Foot>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="الاسم" error={e.name?.message}>
          {(fid) => <TextInput id={fid} className={R14} invalid={!!e.name} {...register("name")} />}
        </Field>
        <Field label="الجوال" error={e.phone?.message}>
          {(fid) => <TextInput id={fid} className={R14} inputMode="tel" invalid={!!e.phone} {...register("phone")} />}
        </Field>
      </div>
      <Field label="البريد" error={e.email?.message}>
        {(fid) => <TextInput id={fid} className={R14} ltr invalid={!!e.email} {...register("email")} />}
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="المدينة" error={e.city?.message}>
          {(fid) => <TextInput id={fid} className={R14} invalid={!!e.city} {...register("city")} />}
        </Field>
        <Field label="قناة الترويج" error={e.channel?.message}>
          {(fid) => <TextInput id={fid} className={R14} invalid={!!e.channel} {...register("channel")} />}
        </Field>
      </div>
    </Modal>
  );
}

// ───────────── CON5-10M · رصيد كود العميل · SM123 (3114:12087) ─────────────
const numStr = (msg: string) => z.string().refine((v) => Number(v.replace(/,/g, "")) > 0, msg);
const balanceSchema = z.object({ value: numStr("أدخل قيمة أكبر من صفر"), min: numStr("أدخل الحد الأدنى") });
type BalanceValues = z.infer<typeof balanceSchema>;
function BalanceModal({ id, onClose }: { id: string; onClose: () => void }) {
  const m = useQuery({ queryKey: ["marketers", "one", id], queryFn: () => api.marketers.get(id) });
  return m.data ? <BalanceForm id={id} code={m.data.code} b={m.data.balance} onClose={onClose} /> : null;
}
function BalanceForm({ id, code, b, onClose }: { id: string; code: string; b: { min: number; value: number }; onClose: () => void }) {
  const finish = useFinish(onClose);
  const { register, handleSubmit, formState, setError } = useForm<BalanceValues>({ resolver: zodResolver(balanceSchema), defaultValues: { value: num(b.value), min: num(b.min) } });
  const save = useMutation({
    mutationFn: (v: BalanceValues) => api.marketers.saveBalance(id, { value: Number(v.value.replace(/,/g, "")), min: Number(v.min.replace(/,/g, "")) }),
    onSuccess: () => finish("حُفظ رصيد كود العميل", "حُفظ رصيد كود العميل"),
    onError: (e) => isApiError(e) && Object.entries(e.fields ?? {}).forEach(([k, msg]) => setError(k as keyof BalanceValues, { message: msg })),
  });
  const e = formState.errors;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      width={500}
      title="رصيد كود العميل"
      footer={
        <Foot onClose={onClose}>
          <Button loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            حفظ الرصيد
          </Button>
        </Foot>
      }
    >
      <MKV b k="الكود">{code}</MKV>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="قيمة الرصيد · ر.س" error={e.value?.message}>
          {(fid) => <TextInput id={fid} className={R14} inputMode="numeric" invalid={!!e.value} {...register("value")} />}
        </Field>
        <Field label="الحد الأدنى للخدمة · ر.س" error={e.min?.message}>
          {(fid) => <TextInput id={fid} className={R14} inputMode="numeric" invalid={!!e.min} {...register("min")} />}
        </Field>
      </div>
    </Modal>
  );
}
