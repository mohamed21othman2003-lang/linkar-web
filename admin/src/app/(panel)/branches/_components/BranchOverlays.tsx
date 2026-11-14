"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  ASSESSORS,
  DEADLINES,
  DISABLE_REASONS,
  DOCUMENTS,
  HOURS_OPTIONS,
  PAUSE_REASONS,
  REQUEST_REASONS,
  SERVICE_CRITERIA,
  TEMPLATES,
  TODAY,
  dayLabel,
  slotLabel,
  type Branch,
} from "@/lib/api/branches";
import { SERVICE_TYPES, TIER_LABEL } from "@/lib/api/providers";
import { useUrlState } from "@/lib/use-url-state";
import { DateField, ModalKV, M_INPUT, M_SELECT } from "../../providers/_components/form-bits";
import { CriteriaLink, MNote, codeLabel, modalSub, statusLabel } from "./bits";
import { ChooseProviderModal } from "./ChooseProviderModal";

// النوافذ فوق قائمة الفروع وملف الفرع — حالتها في الرابط ?modal=<نوع>&b=<id> عشان زر الرجوع يقفلها (القسم 2.3)
export function BranchOverlays() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("b");
  const q = useQuery({ queryKey: ["branches", "one", id], queryFn: () => api.branches.get(id!), enabled: !!id && !!modal });
  const close = () => url.replace({ modal: null, b: null });
  const go = (m: string) => url.replace({ modal: m, b: id });
  if (modal === "add-branch") return <ChooseProviderModal close={() => url.replace({ modal: null, provider: null })} initial={url.get("provider") ?? undefined} />;
  const b = q.data;
  if (!modal || !id || !b) return null;
  const props = { b, close };
  switch (modal) {
    case "actions":
      return <ActionsModal {...props} go={go} />;
    case "edit":
      return <EditModal {...props} />;
    case "add-service":
      return <AddServiceModal {...props} />;
    case "request-doc":
      return <RequestDocModal {...props} />;
    case "pause":
      return <PauseModal {...props} />;
    case "disable":
      return <DisableModal {...props} />;
    case "delete":
      return <DeleteModal {...props} />;
    case "surprise":
      return <SurpriseModal {...props} />;
    case "reschedule":
    case "schedule":
      return <RescheduleModal {...props} first={modal === "schedule"} />;
    case "delete-request":
      return <DeleteRequestModal {...props} />;
    case "second-visit":
      return <SecondVisitModal {...props} />;
    case "suspend":
      return <SuspendModal {...props} />;
    default:
      return null;
  }
}

type P = { b: Branch; close: () => void };

function useDone(close: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body: string) => {
    qc.invalidateQueries({ queryKey: ["branches"] });
    qc.invalidateQueries({ queryKey: ["providers"] });
    close();
    toast(title, body);
  };
}

/** نافذة 540 · حشو 22 · مسافة 12 (CON5-08M) */
function M({ title, sub, children, onClose, busy }: { title: string; sub: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  return (
    <Modal open onOpenChange={(o) => !o && !busy && onClose()} width={540} className="gap-3! p-[22px]!" title={title} subtitle={sub}>
      {children}
    </Modal>
  );
}

/** «إلغاء» يمين (46 بإطار) + الزر الرئيسي شمال (44) */
function Actions({ onCancel, busy, children, cancel = "إلغاء" }: { onCancel: () => void; busy?: boolean; children: ReactNode; cancel?: string }) {
  return (
    <div className="flex gap-2.5 [&>*]:flex-1">
      <Button variant="secondary" className="h-[46px]" onClick={onCancel} disabled={busy}>
        {cancel}
      </Button>
      {children}
    </div>
  );
}

const opts = (l: readonly string[]) => l.map((v) => ({ value: v, label: v }));
const grid2 = "grid grid-cols-1 gap-2.5 sm:grid-cols-2";
const phoneRe = /^05\d[\s]?\d{3}[\s]?\d{4}$/;

// ───────────── CON5-08A · قائمة الإجراءات ─────────────
// LK-JN-ZH-001 (3114-60134) · … · LK-RM-SM-001 (3114-60354) · LK-JN-AB-004 (3114-60434) · LK-LA-HD-004 (3114-60490) · LK-JN-SL-005 (3114-60518)
// 440 · حشو 24 · مسافة 14 · عناصر 44 r10 حشو 11·12: أيقونة 18 يمين + نص 14 Medium + سهم 16 رمادي شمال · الإيقاف والتعطيل والحذف بالأحمر بعد خط فاصل
type Act = { key: string; label: string; icon: UiGlyph; danger?: boolean; href?: string };
export function branchActions(b: Branch): [Act[], Act[]] {
  const view: Act = { key: "view", label: "عرض ملف الفرع", icon: "store", href: `/branches/${b.id}` };
  const edit: Act = { key: "edit", label: "تعديل بيانات الفرع", icon: "edit" };
  if (b.status === "request")
    return [[{ key: "view", label: "عرض بيانات الطلب", icon: "file", href: `/branches/${b.id}` }, { key: "schedule", label: "جدولة الزيارة الميدانية", icon: "calendar" }], []];
  if (b.status === "pending-visit") return [[view, edit, { key: "reschedule", label: "إعادة جدولة الزيارة", icon: "calendar" }], [{ key: "delete-request", label: "حذف الطلب", icon: "trash", danger: true }]];
  if (b.status === "rejected") return [[view, edit, { key: "second-visit", label: "جدولة زيارة ثانية", icon: "calendar" }], [{ key: "delete", label: "حذف الطلب", icon: "trash", danger: true }]];
  const top: Act[] = [view, edit, { key: "add-service", label: "إضافة خدمة للفرع", icon: "plus" }];
  if (b.status === "approved") top.push({ key: "surprise", label: "جدولة زيارة مفاجئة", icon: "calendar" });
  top.push({ key: "request-doc", label: "طلب مستند", icon: "file" });
  return [top, [{ key: "pause", label: "إيقاف مؤقت", icon: "clock", danger: true }, { key: "disable", label: "تعطيل", icon: "lock", danger: true }, { key: "delete", label: "حذف الفرع", icon: "trash", danger: true }]];
}
export const tierLine = (b: Branch) => (b.tier && (b.status === "approved" || b.status === "new") ? ` · ${TIER_LABEL[b.tier]}${b.score != null ? ` ${b.score}` : ""}` : "");

function ActionsModal({ b, close, go }: P & { go: (m: string) => void }) {
  const router = useRouter();
  const [top, bottom] = branchActions(b);
  const item = (a: Act) => (
    <button
      key={a.key}
      type="button"
      onClick={() => (a.href ? router.push(a.href) : go(a.key))}
      className="flex h-11 items-center gap-2.5 rounded-10 px-3 text-start hover:bg-surface-1"
    >
      <Icon name={a.icon} size={18} className={`shrink-0 ${a.danger ? "text-danger" : "text-ink"}`} />
      <span className={`min-w-0 flex-1 text-14 font-medium ${a.danger ? "text-danger" : "text-ink"}`}>{a.label}</span>
      <Icon name="chevron-left" size={16} className="shrink-0 text-muted" />
    </button>
  );
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={440} title={b.code} subtitle={`${b.name} · ${b.provider.label} · ${statusLabel(b.status)}${tierLine(b)}`}>
      <nav aria-label="إجراءات الفرع" className="flex flex-col gap-0.5">
        {top.map(item)}
        {bottom.length ? <hr className="border-border" /> : null}
        {bottom.map(item)}
      </nav>
    </Modal>
  );
}

// ───────────── CON5-08M · تعديل بيانات الفرع (3114-57584) ─────────────
const editSchema = z.object({
  manager: z.string().trim().min(2, "اكتب اسم مدير الفرع"),
  managerPhone: z.string().trim().regex(phoneRe, "اكتب جوالاً صحيحاً يبدأ بـ05"),
  hours: z.string().min(1, "اختر ساعات العمل"),
  technicians: z.string().trim().regex(/^\d{1,3}$/, "اكتب رقماً"),
  slots: z.string().trim().min(1, "اكتب عدد فتحات العمل"),
});
function EditModal({ b, close }: P) {
  const done = useDone(close);
  const f = useForm({ resolver: zodResolver(editSchema), defaultValues: { manager: b.manager, managerPhone: b.managerPhone ?? "", hours: b.hours, technicians: b.technicians, slots: b.slots } });
  const m = useMutation({ mutationFn: (v: z.infer<typeof editSchema>) => api.branches.update(b.id, v), onSuccess: () => done("حُفظت بيانات الفرع", `حُفظت بيانات ${b.name} · أُشعر ${b.provider.label}`) });
  const e = f.formState.errors;
  const hours = HOURS_OPTIONS.includes(b.hours as (typeof HOURS_OPTIONS)[number]) ? HOURS_OPTIONS : [b.hours, ...HOURS_OPTIONS];
  const leave = () => (f.formState.isDirty && !window.confirm("لديك تعديلات غير محفوظة. هل تريد الخروج؟") ? null : close());
  return (
    <M title="تعديل بيانات الفرع" sub={modalSub(b)} onClose={leave} busy={m.isPending}>
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3" noValidate>
        <div className={grid2}>
          <Field label="مدير الفرع" error={e.manager?.message}>{(id) => <TextInput id={id} {...f.register("manager")} invalid={!!e.manager} className={M_INPUT} />}</Field>
          <Field label="جوال المدير" error={e.managerPhone?.message}>{(id) => <TextInput id={id} {...f.register("managerPhone")} invalid={!!e.managerPhone} inputMode="tel" ltr className={M_INPUT} />}</Field>
        </div>
        <Field label="ساعات العمل" error={e.hours?.message}>
          {(id) => <Controller control={f.control} name="hours" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={opts(hours)} icon="clock" className={M_SELECT} />} />}
        </Field>
        <div className={grid2}>
          <Field label="فتحات العمل" error={e.slots?.message}>{(id) => <TextInput id={id} {...f.register("slots")} invalid={!!e.slots} className={M_INPUT} />}</Field>
          <Field label="الفنيون" error={e.technicians?.message}>{(id) => <TextInput id={id} {...f.register("technicians")} invalid={!!e.technicians} inputMode="numeric" className={M_INPUT} />}</Field>
        </div>
        <MNote>يُسجَّل التعديل في سجل الفرع ويصل المزوّد إشعار. تغيير الموقع أو إضافة خدمة يتطلب زيارة ميدانية.</MNote>
        <Actions onCancel={leave} busy={m.isPending}>
          <Button type="submit" className="h-11" loading={m.isPending}>
            حفظ التعديلات
            <Icon name="check" size={16} />
          </Button>
        </Actions>
      </form>
    </M>
  );
}

// ───────────── CON5-08M · إضافة نوع خدمة (3114-57630) ─────────────
const serviceSchema = z.object({
  type: z.string().min(1, "اختر نوع الخدمة"),
  from: z.string().trim().min(1, "اكتب المدة"),
  to: z.string().trim().min(1, "اكتب المدة"),
  assessor: z.string().min(1, "اختر المقيّم"),
  visitAt: z.string().min(1, "اختر موعد الزيارة"),
});
function AddServiceModal({ b, close }: P) {
  const done = useDone(close);
  const free = SERVICE_TYPES.filter((t) => !b.services.some((s) => s.type === t || (t === "الغسيل والتنظيف" && s.type === "الغسيل")));
  const first = free.includes("التظليل") ? "التظليل" : free[0] ?? SERVICE_TYPES[0];
  const crit = (t: string) => SERVICE_CRITERIA[t] ?? SERVICE_CRITERIA[t.replace(" والتنظيف", "")] ?? { criteria: "—", from: "", to: "" };
  const f = useForm({ resolver: zodResolver(serviceSchema), defaultValues: { type: first, from: crit(first).from, to: crit(first).to, assessor: ASSESSORS[0], visitAt: "2026-10-25T10:00" } });
  const type = useWatch({ control: f.control, name: "type" });
  const m = useMutation({
    mutationFn: (v: z.infer<typeof serviceSchema>) => api.branches.addServiceType(b.id, v),
    onSuccess: (_r, v) => done("أُضيف نوع خدمة", `أُضيفت ${v.type} لـ${b.name} · زيارة الموديول ${dayLabel(v.visitAt)}`),
  });
  const e = f.formState.errors;
  return (
    <M title={`إضافة خدمة لـ${b.name}`} sub={`${b.provider.label} · ${codeLabel(b)}`} onClose={close} busy={m.isPending}>
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3" noValidate>
        <Field label="نوع الخدمة" error={e.type?.message}>
          {(id) => (
            <Controller
              control={f.control}
              name="type"
              render={({ field }) => (
                <Select
                  id={id}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    f.setValue("from", crit(v).from);
                    f.setValue("to", crit(v).to);
                  }}
                  options={opts(free.length ? free : SERVICE_TYPES)}
                  className={M_SELECT}
                />
              )}
            />
          )}
        </Field>
        <CriteriaLink className="w-full! rounded-10! px-3! py-2!">معايير الاعتماد: {type} · {crit(type).criteria} ↗</CriteriaLink>
        <div className={grid2}>
          <Field label="مدة التنفيذ من" error={e.from?.message}>{(id) => <TextInput id={id} {...f.register("from")} invalid={!!e.from} className={M_INPUT} />}</Field>
          <Field label="إلى" error={e.to?.message}>{(id) => <TextInput id={id} {...f.register("to")} invalid={!!e.to} className={M_INPUT} />}</Field>
        </div>
        <div className={grid2}>
          <Field label="زيارة موديول الخدمة" error={e.visitAt?.message}>
            {(id) => <Controller control={f.control} name="visitAt" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} withTime min={TODAY} invalid={!!e.visitAt} />} />}
          </Field>
          <Field label="المقيّم">{(id) => <Controller control={f.control} name="assessor" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={opts(ASSESSORS)} className={M_SELECT} />} />}</Field>
        </div>
        <MNote tone="warning">لا تُنشر خدمات هذا النوع في الفرع قبل زيارة موديوله وقبولها. بعد القبول تُضاف الخدمات وأسعارها من «إضافة خدمة لمقدّم خدمة».</MNote>
        <Actions onCancel={close} busy={m.isPending}>
          <Button type="submit" className="h-11" loading={m.isPending}>
            إضافة وجدولة الزيارة
            <Icon name="check" size={16} />
          </Button>
        </Actions>
      </form>
    </M>
  );
}

// ───────────── CON5-08M · طلب مستند (3114-57680) ─────────────
const addDays = (n: number) => {
  const d = new Date(`${TODAY}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const DEADLINE_OPTS = DEADLINES.map((n) => ({ value: String(n), label: `${n} ${n <= 10 ? "أيام" : "يوماً"} · حتى ${dayLabel(addDays(n))}` }));
function RequestDocModal({ b, close }: P) {
  const done = useDone(close);
  const [doc, setDoc] = useState<string>("شهادة الدفاع المدني (تجديد)");
  const [days, setDays] = useState("7");
  const m = useMutation({ mutationFn: () => api.branches.requestDocument(b.id, { document: doc, days: +days }), onSuccess: () => done("أُرسل طلب المستند", `أُرسل طلب المستند لـ${b.provider.label} · ${b.name}`) });
  return (
    <M title="طلب مستند من الفرع" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <Field label="المستند">{(id) => <Select id={id} value={doc} onChange={setDoc} options={opts(DOCUMENTS)} className={M_SELECT} />}</Field>
      <Field label="المهلة">{(id) => <Select id={id} value={days} onChange={setDays} options={DEADLINE_OPTS} icon="calendar" className={M_SELECT} />}</Field>
      <Actions onCancel={close} busy={m.isPending}>
        <Button className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
          إرسال الطلب
          <Icon name="check" size={16} />
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · إيقاف مؤقت (3114-57710) ─────────────
const pauseSchema = z
  .object({ reason: z.string().min(1, "اختر السبب"), from: z.string().min(1, "اختر التاريخ"), until: z.string().min(1, "اختر تاريخ العودة"), transfer: z.boolean() })
  .refine((v) => v.until > v.from, { path: ["until"], message: "تاريخ العودة بعد تاريخ البداية" });
function PauseModal({ b, close }: P) {
  const done = useDone(close);
  const f = useForm({ resolver: zodResolver(pauseSchema), defaultValues: { reason: PAUSE_REASONS[0] as string, from: TODAY, until: "2026-11-01", transfer: b.activeBookings > 0 } });
  const m = useMutation({
    mutationFn: (v: z.infer<typeof pauseSchema>) => api.branches.pause(b.id, v),
    onSuccess: (r, v) => done("أُوقف الفرع مؤقتاً", `أُوقف ${b.name} مؤقتاً حتى ${dayLabel(v.until)}${r.moved ? ` · حُوِّلت ${r.moved} حجزاً` : ""}`),
  });
  const e = f.formState.errors;
  return (
    <M title="إيقاف الفرع مؤقتاً" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3" noValidate>
        <Field label="السبب" error={e.reason?.message}>
          {(id) => <Controller control={f.control} name="reason" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={opts(PAUSE_REASONS)} className={M_SELECT} />} />}
        </Field>
        <div className={grid2}>
          <Field label="من" error={e.from?.message}>
            {(id) => <Controller control={f.control} name="from" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} todayLabel min={TODAY} />} />}
          </Field>
          <Field label="حتى" error={e.until?.message}>
            {(id) => <Controller control={f.control} name="until" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} min={TODAY} invalid={!!e.until} />} />}
          </Field>
        </div>
        <ModalKV k="أثره">
          <span className="sm:whitespace-nowrap">يختفي من الموقع والتطبيق · لا يستقبل حجوزات جديدة · يعود تلقائياً في التاريخ</span>
        </ModalKV>
        <ModalKV k="الحجوزات القائمة">{b.activeBookings ? `${b.activeBookings} حجزاً بقسائم سارية` : "لا حجوزات قائمة"}</ModalKV>
        <Controller
          control={f.control}
          name="transfer"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-2.5">
              <span className="text-13 leading-5 font-medium text-ink">تحويل الحجوزات القائمة إلى فرع آخر للمزوّد نفسه</span>
              <Switch checked={field.value} onCheckedChange={field.onChange} label="تحويل الحجوزات القائمة إلى فرع آخر للمزوّد نفسه" />
            </label>
          )}
        />
        <Actions onCancel={close} busy={m.isPending}>
          <Button type="submit" className="h-11" loading={m.isPending}>
            إيقاف مؤقت
            <Icon name="clock" size={16} />
          </Button>
        </Actions>
      </form>
    </M>
  );
}

// ───────────── CON5-08M · تعطيل (3114-57756) ─────────────
function DisableModal({ b, close }: P) {
  const done = useDone(close);
  const [reason, setReason] = useState<string>(DISABLE_REASONS[0]);
  const m = useMutation({ mutationFn: () => api.branches.disable(b.id, { reason }), onSuccess: () => done("عُطّل الفرع", `عُطّل ${b.name} · أُشعر ${b.provider.label}`) });
  return (
    <M title="تعطيل الفرع" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={opts(DISABLE_REASONS)} className={M_SELECT} />}</Field>
      <ModalKV k="أثره">يتوقف بلا تاريخ عودة حتى «إعادة تفعيل» يدوياً بصلاحية قسم الجودة</ModalKV>
      <ModalKV k="الحجوزات القائمة">{b.activeBookings ? `${b.activeBookings} حجزاً · تُحوَّل أو تُسترد` : "لا حجوزات قائمة"}</ModalKV>
      <Actions onCancel={close} busy={m.isPending}>
        <Button variant="danger" className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
          تعطيل الفرع
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · حذف ─────────────
// فيه حجوزات: «لا يمكن حذف الفرع الآن» (LK-JN-ZH-001 3114-57786) · من غير: تأكيد بالاسم (LK-RM-SM-001 3114-59097) · المرفوض (LK-LA-HD-004 3114-59670)
function DeleteModal({ b, close }: P) {
  const router = useRouter();
  const done = useDone(close);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const m = useMutation({
    mutationFn: () => api.branches.remove(b.id),
    onSuccess: () => {
      done("حُذف الفرع", `حُذف ${b.name} · نُقل إلى «المحذوفة»`);
      if (location.pathname.startsWith(`/branches/${b.id}`)) router.replace("/branches");
    },
  });
  if (b.activeBookings > 0)
    return (
      <M title="لا يمكن حذف الفرع الآن" sub={modalSub(b)} onClose={close}>
        <MNote tone="danger">على الفرع {b.activeBookings} حجزاً بقسائم سارية ومستحقات لم تُحوَّل بعد. أنهِ الحجوزات وسوِّ المستحقات أو استخدم «تعطيل».</MNote>
        <ModalKV k="الحذف">أرشفة نهائية · لا عودة · يبقى السجل والفواتير</ModalKV>
        <Actions onCancel={close} cancel="إغلاق">
          <Button className="h-11" onClick={() => router.push(`/coming-soon?s=bookings&branch=${b.code}`)}>
            عرض حجوزات الفرع
            <Icon name="chevron-left" size={16} />
          </Button>
        </Actions>
      </M>
    );
  if (b.status === "rejected")
    return (
      <M title="حذف الفرع المرفوض" sub={modalSub(b)} onClose={close} busy={m.isPending}>
        <MNote tone="danger">لا حجوزات ولا مستحقات على الفرع. يُؤرشف الطلب ونتيجة زيارته.</MNote>
        <Actions onCancel={close} busy={m.isPending}>
          <Button variant="danger" className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
            حذف
          </Button>
        </Actions>
      </M>
    );
  const wrong = name.trim() !== b.name;
  return (
    <M title="حذف الفرع" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <ModalKV k="الحجوزات">لا حجوزات · لا مستحقات معلّقة</ModalKV>
      <MNote tone="danger">الحذف أرشفة نهائية: يختفي الفرع من كل القوائم، ويبقى سجله في «المحذوفة».</MNote>
      <Field label="اكتب اسم الفرع للتأكيد" error={touched && wrong ? "الاسم غير مطابق" : undefined}>
        {(id) => <TextInput id={id} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched(true)} placeholder={b.name} invalid={touched && wrong} className={M_INPUT} />}
      </Field>
      <Actions onCancel={close} busy={m.isPending}>
        <Button variant="danger" className="h-11" loading={m.isPending} disabled={wrong} onClick={() => m.mutate()}>
          حذف الفرع
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · زيارة مفاجئة (3114-57808) ─────────────
function SurpriseModal({ b, close }: P) {
  const done = useDone(close);
  const [assessor, setAssessor] = useState<string>("ماجد الفيفي");
  const [date, setDate] = useState("2026-10-19");
  const [template, setTemplate] = useState<string>(TEMPLATES[0]);
  const m = useMutation({ mutationFn: () => api.branches.surpriseVisit(b.id, { assessor, date, template }), onSuccess: () => done("جُدولت زيارة مفاجئة", `جُدولت زيارة مفاجئة لـ${b.name} · ${dayLabel(date)}`) });
  return (
    <M title="جدولة زيارة مفاجئة" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <div className={grid2}>
        <Field label="التاريخ" error={!date ? "اختر التاريخ" : undefined}>{(id) => <DateField id={id} value={date} onChange={setDate} min={TODAY} invalid={!date} />}</Field>
        <Field label="المقيّم">{(id) => <Select id={id} value={assessor} onChange={setAssessor} options={opts(ASSESSORS)} className={M_SELECT} />}</Field>
      </div>
      <Field label="القالب">{(id) => <Select id={id} value={template} onChange={setTemplate} options={opts(TEMPLATES)} className={M_SELECT} />}</Field>
      <MNote>لا يُبلَّغ الفرع بموعد الزيارة المفاجئة. النتيجة تُسجَّل في «التقييم الميداني» وسجل الفرع.</MNote>
      <Actions onCancel={close} busy={m.isPending}>
        <Button className="h-11" loading={m.isPending} disabled={!date} onClick={() => m.mutate()}>
          جدولة الزيارة
          <Icon name="calendar" size={16} />
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · إعادة جدولة الزيارة (3114-59399) · وجدولة الزيارة الميدانية لطلب جديد ─────────────
function RescheduleModal({ b, close, first }: P & { first?: boolean }) {
  const done = useDone(close);
  const [assessor, setAssessor] = useState<string>(b.assessor ?? ASSESSORS[0]);
  const next = b.visitAt ? (() => { const d = new Date(`${b.visitAt.slice(0, 10)}T12:00:00`); d.setDate(d.getDate() + 1); return `${d.toISOString().slice(0, 10)}T${b.visitAt.slice(11, 16) || "10:00"}`; })() : "2026-10-25T10:00";
  const [visitAt, setVisitAt] = useState(first && b.visitAt ? b.visitAt : next);
  const [reason, setReason] = useState<string>(REQUEST_REASONS[0]);
  const m = useMutation({
    mutationFn: () => api.branches.reschedule(b.id, { assessor, visitAt, reason }),
    onSuccess: () => done(first ? "جُدولت الزيارة الميدانية" : "أُعيدت جدولة الزيارة", first ? `جُدولت زيارة ${b.name} · ${slotLabel(visitAt)}` : `أُعيدت جدولة زيارة ${b.name} · ${slotLabel(visitAt)}`),
  });
  return (
    <M title={first ? "جدولة الزيارة الميدانية" : "إعادة جدولة الزيارة الميدانية"} sub={modalSub(b)} onClose={close} busy={m.isPending}>
      {b.visitAt && !first ? <ModalKV k="الموعد الحالي">{`${slotLabel(b.visitAt)} · ${b.assessor ?? "—"}`}</ModalKV> : null}
      <div className={grid2}>
        <Field label={first ? "الموعد" : "الموعد الجديد"} error={!visitAt ? "اختر الموعد" : undefined}>{(id) => <DateField id={id} value={visitAt} onChange={setVisitAt} withTime min={TODAY} invalid={!visitAt} />}</Field>
        <Field label="المقيّم">{(id) => <Select id={id} value={assessor} onChange={setAssessor} options={opts(ASSESSORS)} className={M_SELECT} />}</Field>
      </div>
      {first ? null : <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={opts(REQUEST_REASONS)} className={M_SELECT} />}</Field>}
      <MNote>يصل المزوّد إشعار بالموعد الجديد، ويبقى الفرع «بانتظار الزيارة الميدانية».</MNote>
      <Actions onCancel={close} busy={m.isPending}>
        <Button className="h-11" loading={m.isPending} disabled={!visitAt} onClick={() => m.mutate()}>
          حفظ الموعد
          <Icon name="check" size={16} />
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · حذف الطلب (3114-59441) ─────────────
function DeleteRequestModal({ b, close }: P) {
  const router = useRouter();
  const done = useDone(close);
  const [reason, setReason] = useState<string>(REQUEST_REASONS[0]);
  const m = useMutation({
    mutationFn: () => api.branches.remove(b.id, { reason }),
    onSuccess: () => {
      done("حُذف الطلب", `حُذف طلب ${b.name} · أُلغيت الزيارة`);
      if (location.pathname.startsWith(`/branches/${b.id}`)) router.replace("/branches?tab=pending-visit");
    },
  });
  return (
    <M title="حذف طلب الفرع" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={opts(REQUEST_REASONS)} className={M_SELECT} />}</Field>
      <MNote tone="danger">تُلغى الزيارة المجدولة ويُحرَّر الكود المحجوز. يصل المزوّد إشعار.</MNote>
      <Actions onCancel={close} busy={m.isPending}>
        <Button variant="danger" className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
          حذف الطلب
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · زيارة ثانية (3114-59629) ─────────────
function SecondVisitModal({ b, close }: P) {
  const done = useDone(close);
  const [assessor, setAssessor] = useState<string>(b.assessor ?? "ماجد الفيفي");
  const [visitAt, setVisitAt] = useState("2026-10-25T10:00");
  const [fixed, setFixed] = useState(true);
  const m = useMutation({ mutationFn: () => api.branches.secondVisit(b.id, { assessor, visitAt, fixed }), onSuccess: () => done("جُدولت زيارة ثانية", `جُدولت زيارة ثانية لـ${b.name} · ${dayLabel(visitAt)}`) });
  return (
    <M title="جدولة زيارة ثانية" sub={modalSub(b)} onClose={close} busy={m.isPending}>
      <ModalKV k="سبب الرفض">{b.rejectReason ?? b.statusLine ?? "—"}</ModalKV>
      <div className={grid2}>
        <Field label="الموعد" error={!visitAt ? "اختر الموعد" : undefined}>{(id) => <DateField id={id} value={visitAt} onChange={setVisitAt} withTime min={TODAY} invalid={!visitAt} />}</Field>
        <Field label="المقيّم">{(id) => <Select id={id} value={assessor} onChange={setAssessor} options={opts(ASSESSORS)} className={M_SELECT} />}</Field>
      </div>
      <label className="flex items-center justify-between gap-2.5">
        <span className="text-13 leading-5 font-medium text-ink">أكّد المزوّد إصلاح الملاحظات (طفايات الحريق + معدات التلميع)</span>
        <Switch checked={fixed} onCheckedChange={setFixed} label="أكّد المزوّد إصلاح الملاحظات" />
      </label>
      <MNote>يعود الفرع «بانتظار الزيارة الميدانية» حتى الموعد، والنتيجة تُحسب تلقائياً من جديد.</MNote>
      <Actions onCancel={close} busy={m.isPending}>
        <Button className="h-11" loading={m.isPending} disabled={!visitAt} onClick={() => m.mutate()}>
          جدولة الزيارة الثانية
          <Icon name="calendar" size={16} />
        </Button>
      </Actions>
    </M>
  );
}

// ───────────── CON5-08M · إيقاف الفرع (من الدرج · 3114-55503) ─────────────
// 540 · حشو 24 · مسافة 14 · أربع قوائم 42 · «إلغاء» يمين و«إيقاف الفرع» أحمر شمال
const SUSPEND_REASONS = ["مخالفة معايير السلامة في الزيارة المفاجئة", ...DISABLE_REASONS.slice(1)];
const VOUCHERS = ["تحويلها لأقرب فرع للمزوّد بنفس السعر", "استرداد كامل للعملاء", "إبقاؤها حتى إعادة التفعيل"];
const UNTIL = ["حتى زيارة تحقق جديدة", "حتى إعادة التفعيل يدوياً", "أسبوعان"];
function SuspendModal({ b, close }: P) {
  const done = useDone(close);
  const [reason, setReason] = useState(SUSPEND_REASONS[0]);
  const [vouchers, setVouchers] = useState(VOUCHERS[0]);
  const [until, setUntil] = useState(UNTIL[0]);
  const [message, setMessage] = useState("نعيد التفعيل بعد زيارة تحقق تثبت معالجة الملاحظات.");
  const m = useMutation({ mutationFn: () => api.branches.suspend(b.id, { reason, vouchers, until, message }), onSuccess: () => done("أُوقف الفرع", "أُوقف الفرع واختفى من الموقع والتطبيق · حُوّلت قسائمه لفرع آخر للمزوّد وأُبلغ العملاء") });
  const S = "h-[42px]! [&>span]:text-14! [&>span]:font-normal!";
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={540} title="إيقاف الفرع" subtitle="يختفي الفرع وخدماته من الموقع والتطبيق حتى إعادة التفعيل">
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={opts(SUSPEND_REASONS)} className={S} />}</Field>
      <Field label="القسائم القائمة">{(id) => <Select id={id} value={vouchers} onChange={setVouchers} options={opts(VOUCHERS)} className={S} />}</Field>
      <Field label="حتى">{(id) => <Select id={id} value={until} onChange={setUntil} options={opts(UNTIL)} className={S} />}</Field>
      <Field label="رسالة للمزوّد">{(id) => <TextInput id={id} value={message} onChange={(e) => setMessage(e.target.value)} className="h-[42px]! [&_input]:text-14! [&_input]:font-normal!" />}</Field>
      {/* في Figma «إيقاف الفرع» يمين و«إلغاء» شمال (عكس باقي النوافذ) */}
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="danger" className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
          إيقاف الفرع
        </Button>
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
