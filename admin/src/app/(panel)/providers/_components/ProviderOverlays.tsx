"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CITIES, DISTRICTS, SERVICE_TYPES, SUSPEND_REASONS, type CompanyData, type Provider } from "@/lib/api/providers";
import { MOCK_NOW } from "@/lib/api/users";
import { arDate } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { DateField, ModalKV, TextArea, M_INPUT, M_SELECT } from "./form-bits";

// النوافذ فوق قائمة مقدّمي الخدمة — حالتها في الرابط ?modal=<نوع>&p=<id> عشان زر الرجوع يقفلها (القسم 2.3)
export function ProviderOverlays() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("p");
  const q = useQuery({ queryKey: ["providers", "one", id], queryFn: () => api.providers.get(id!), enabled: !!id && !!modal });
  const close = () => url.replace({ modal: null, p: null });
  const go = (m: string) => url.replace({ modal: m, p: id });
  const p = q.data;
  if (!modal || !id || !p) return null;
  const props = { p, close };
  switch (modal) {
    case "actions":
      return <ActionsModal {...props} go={go} />;
    case "pause":
      return <PauseModal {...props} />;
    case "disable":
      return <DisableModal {...props} />;
    case "delete":
      return <DeleteModal {...props} />;
    case "request-doc":
      return <RequestDocModal {...props} />;
    case "reactivate":
      return <ReactivateModal {...props} />;
    case "edit":
      return <EditModal {...props} />;
    case "add-branch":
      return <AddBranchModal {...props} />;
    default:
      return null;
  }
}

type P = { p: Provider; close: () => void };

function useDone(close: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body: string) => {
    qc.invalidateQueries({ queryKey: ["providers"] });
    close();
    toast(title, body);
  };
}

const sub = (p: Provider) => `${p.name} · ${p.code}`;
/** «3 فروع معتمدة + 1 بانتظار الزيارة» */
const appliesTo = (p: Provider) =>
  [p.approvedBranches ? `${p.approvedBranches} ${p.approvedBranches === 1 ? "فرع معتمد" : "فروع معتمدة"}` : "", p.pendingBranches ? `${p.pendingBranches} بانتظار الزيارة` : ""].filter(Boolean).join(" + ");

// ───────────── CON5-07A · قائمة الإجراءات ─────────────
// LK-JN-001 (3114-53672) · LK-LM-001 (3114-53716) · … · LK-RM-001 (3114-53956) · LK-ND-001 (3114-53996) · LK-WA-001 (3114-54020) · LK-RY-001 (3114-54048)
// 440 · حشو 24 · مسافة 14 · عناصر 44 r10 بحشو 11·12: أيقونة 18 يمين + نص 14 Medium + سهم 16 رمادي شمال · الإيقاف والتعطيل والحذف بالأحمر بعد خط فاصل
type Act = { key: string; label: string; icon: UiGlyph; danger?: boolean; later?: boolean; href?: string };
function actionsFor(p: Provider): [Act[], Act[]] {
  const edit: Act = { key: "edit", label: "تعديل بيانات المنشأة", icon: "edit" };
  const branch: Act = { key: "add-branch", label: "إضافة فرع", icon: "plus" };
  const doc: Act = { key: "request-doc", label: "طلب مستند", icon: "file" };
  const del: Act = { key: "delete", label: "حذف المنشأة", icon: "trash", danger: true };
  const stop: Act[] = [{ key: "pause", label: "إيقاف مؤقت", icon: "clock", danger: true }, { key: "disable", label: "تعطيل", icon: "lock", danger: true }, del];
  switch (p.menu) {
    case "full":
      return [[edit, branch, { key: "add-service", label: "إضافة خدمة", icon: "plus", href: `/providers/${p.id}?tab=services` }, doc], stop];
    case "cost":
      return [[edit, branch, { key: "cost", label: "أسعار التكلفة", icon: "tag", href: `/providers/${p.id}?tab=services` }], stop];
    case "new":
      return [[edit, branch, doc], stop];
    case "pending-schedule":
      return [[{ key: "schedule", label: "جدولة الزيارة الميدانية", icon: "calendar", later: true }, edit], [del]];
    case "pending-match":
      return [[{ key: "match", label: "مطابقة المعايير", icon: "calendar", later: true }, { key: "reschedule", label: "إعادة جدولة الزيارة", icon: "calendar", later: true }, { ...edit, label: "تعديل البيانات" }], [del]];
    case "suspended":
      return [[{ key: "reactivate", label: "إعادة تفعيل", icon: "check" }, edit], [del]];
  }
}
const STATUS_SUFFIX: Partial<Record<Provider["status"], string>> = { new: " · معتمد جديد", "pending-visit": " · بانتظار الزيارة الميدانية", suspended: " · موقوف" };

function ActionsModal({ p, close, go }: P & { go: (m: string) => void }) {
  const router = useRouter();
  const [top, bottom] = actionsFor(p);
  const item = (a: Act) => (
    <button
      key={a.key}
      type="button"
      disabled={a.later}
      title={a.later ? "قريباً — مرحلة لاحقة" : undefined}
      onClick={() => (a.href ? router.push(a.href) : go(a.key))}
      className="flex h-11 items-center gap-2.5 rounded-10 px-3 text-start hover:bg-surface-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name={a.icon} size={18} className={`shrink-0 ${a.danger ? "text-danger" : "text-ink"}`} />
      <span className={`min-w-0 flex-1 text-14 font-medium ${a.danger ? "text-danger" : "text-ink"}`}>{a.label}</span>
      <Icon name="chevron-left" size={16} className="shrink-0 text-muted" />
    </button>
  );
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={440} title={p.code} subtitle={`${p.name} · ${p.type === "care" ? "مركز عناية" : "مغسلة"}${STATUS_SUFFIX[p.status] ?? ""}`}>
      <nav aria-label="إجراءات مقدّم الخدمة" className="flex flex-col gap-0.5">
        {top.map(item)}
        <hr className="border-border" />
        {bottom.map(item)}
      </nav>
    </Modal>
  );
}

// ───────────── CON5-07M · إيقاف مؤقت (3114-51919) ─────────────
// 540 · حشو 22 · مسافة 12 · السبب + من/حتى + يسري على/أثره/الحجوزات القائمة · «إيقاف مؤقت» كحلي على الشمال و«إلغاء» يمين
const today = MOCK_NOW.toISOString().slice(0, 10);
const pauseSchema = z
  .object({ reason: z.string().min(1, "اختر السبب"), from: z.string().min(1, "اختر التاريخ"), until: z.string().min(1, "اختر تاريخ العودة") })
  .refine((v) => v.until > v.from, { path: ["until"], message: "تاريخ العودة بعد تاريخ البداية" });
const PAUSE_REASONS = ["طلب المالك · مراجعة داخلية", ...SUSPEND_REASONS].map((r) => ({ value: r, label: r }));

function PauseModal({ p, close }: P) {
  const done = useDone(close);
  const f = useForm({ resolver: zodResolver(pauseSchema), defaultValues: { reason: PAUSE_REASONS[0].value, from: today, until: "2026-11-01" } });
  const m = useMutation({
    mutationFn: (v: z.infer<typeof pauseSchema>) => api.providers.pause(p.id, v),
    onSuccess: (_r, v) => done("أُوقف المركز", `أُوقفت ${p.name} مؤقتاً حتى ${arDate(v.until)}`),
  });
  const e = f.formState.errors;
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={540} className="gap-3! p-[22px]!" title="إيقاف المنشأة مؤقتاً" subtitle={sub(p)}>
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3" noValidate>
        <Field label="السبب" error={e.reason?.message}>
          {(id) => <Controller control={f.control} name="reason" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={PAUSE_REASONS} className={M_SELECT} invalid={!!e.reason} />} />}
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Field label="من" error={e.from?.message}>
            {(id) => <Controller control={f.control} name="from" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} todayLabel min={today} />} />}
          </Field>
          <Field label="حتى" error={e.until?.message}>
            {(id) => <Controller control={f.control} name="until" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} min={today} invalid={!!e.until} />} />}
          </Field>
        </div>
        <ModalKV k="يسري على">{appliesTo(p)}</ModalKV>
        <ModalKV k="أثره">تختفي المنشأة وفروعها من الموقع والتطبيق · لا حجوزات جديدة · تعود تلقائياً في التاريخ</ModalKV>
        <ModalKV k="الحجوزات القائمة">{p.activeBookings ? `${p.activeBookings} حجزاً بقسائم سارية تبقى صالحة` : "لا حجوزات قائمة"}</ModalKV>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
            إلغاء
          </Button>
          <Button type="submit" className="h-11" loading={m.isPending}>
            إيقاف مؤقت
            <Icon name="clock" size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ───────────── CON5-07M · تعطيل (3114-51964) ─────────────
const DISABLE_REASONS = ["انتهاء الاتفاقية دون تجديد", ...SUSPEND_REASONS].map((r) => ({ value: r, label: r }));
function DisableModal({ p, close }: P) {
  const done = useDone(close);
  const [reason, setReason] = useState(DISABLE_REASONS[0].value);
  const [openBookings, setOpenBookings] = useState(true);
  const m = useMutation({ mutationFn: () => api.providers.disable(p.id, { reason }), onSuccess: () => done("عُطّلت المنشأة", `عُطّلت ${p.name} · أُشعر المالك`) });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={540} className="gap-3! p-[22px]!" title="تعطيل المنشأة" subtitle={sub(p)}>
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={DISABLE_REASONS} className={M_SELECT} />}</Field>
      <ModalKV k="يسري على">{appliesTo(p)}</ModalKV>
      <ModalKV k="أثره">تتوقف بلا تاريخ عودة حتى «إعادة تفعيل» يدوياً · تُعلَّق المستحقات حتى التسوية</ModalKV>
      <ModalKV k="الحجوزات القائمة">{p.activeBookings ? `${p.activeBookings} حجزاً · تُحوَّل أو تُسترد` : "لا حجوزات قائمة"}</ModalKV>
      <label className="flex items-center justify-between gap-2.5">
        <span className="text-13 leading-5 font-medium text-ink">فتح قائمة الحجوزات القائمة لتحويلها بعد التعطيل</span>
        <Switch checked={openBookings} onCheckedChange={setOpenBookings} label="فتح قائمة الحجوزات القائمة لتحويلها بعد التعطيل" />
      </label>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
        <Button variant="danger" className="h-11" loading={m.isPending} onClick={() => m.mutate()}>
          تعطيل المنشأة
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-07M · حذف ─────────────
// فيه حجوزات قائمة: «لا يمكن حذف المنشأة الآن» (LK-JN-001 3114-52001) · من غير: حذف بتأكيد الاسم (LK-RM-001 3114-53365)
function DeleteModal({ p, close }: P) {
  const router = useRouter();
  const done = useDone(close);
  const [name, setName] = useState("");
  const m = useMutation({ mutationFn: () => api.providers.remove(p.id), onSuccess: () => done("حُذفت المنشأة", `حُذفت ${p.name} · نُقلت إلى «المحذوفة»`) });
  const blocked = p.activeBookings > 0;
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={540} className="gap-3! p-[22px]!" title={blocked ? "لا يمكن حذف المنشأة الآن" : "حذف المنشأة"} subtitle={sub(p)}>
      {blocked ? (
        <>
          <DangerNote>
            على {p.name} {p.activeBookings} حجزاً بقسائم سارية ومستحقات لم تُحوَّل بعد. أنهِ الحجوزات وسوِّ المستحقات أو استخدم «تعطيل».
          </DangerNote>
          <ModalKV k="الحذف">أرشفة نهائية للمنشأة وكل فروعها · يبقى السجل والفواتير</ModalKV>
          <div className="flex gap-2.5 [&>*]:flex-1">
            <Button variant="secondary" className="h-[46px]" onClick={close}>
              إغلاق
            </Button>
            <Button className="h-11" onClick={() => router.push(`/providers/${p.id}?tab=bookings`)}>
              عرض حجوزات المنشأة
              <Icon name="chevron-left" size={16} />
            </Button>
          </div>
        </>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() === p.name) m.mutate();
          }}
        >
          <ModalKV k="الحجوزات والمستحقات">لا حجوزات قائمة · لا مستحقات</ModalKV>
          <DangerNote>الحذف أرشفة نهائية: تختفي المنشأة وفروعها من القوائم وتُلغى الزيارات المجدولة، ويبقى السجل في «المحذوفة».</DangerNote>
          <Field label="اكتب اسم المنشأة للتأكيد" error={m.isError ? "تعذّر الحذف، حاول مرة أخرى" : undefined}>
            {(id) => <TextInput id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder={p.name} className={M_INPUT} autoComplete="off" />}
          </Field>
          <div className="flex gap-2.5 [&>*]:flex-1">
            <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
              إلغاء
            </Button>
            <Button type="submit" variant="danger" className="h-11" loading={m.isPending} disabled={name.trim() !== p.name}>
              حذف المنشأة
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ملاحظة النوافذ بالأيقونة على الشمال (CON5-07M · حذف 3114-52001 / 53365 و«تعديل بيانات المنشأة» 3114-51188)
function DangerNote({ children, tone = "danger" }: { children: ReactNode; tone?: "danger" | "info" }) {
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[21px] font-light ${tone === "danger" ? "bg-[#fbeaea] text-danger" : "bg-info-tint text-ink"}`}>
      <p className="min-w-0 flex-1">{children}</p>
      <Icon name="info" size={16} className="mt-[3px] shrink-0 text-ink" />
    </div>
  );
}

// ───────────── CON5-07M · طلب مستند (جونسون 3114-49417) ─────────────
// 480 · المستند المطلوب (96) · الفرع · ملاحظة · «إرسال الطلب» كحلي يمين و«إلغاء» شمال
function RequestDocModal({ p, close }: P) {
  const done = useDone(close);
  const branches = branchOptions(p);
  const [doc, setDoc] = useState("");
  const [branch, setBranch] = useState(branches[0].value);
  const [note, setNote] = useState("يرجى رفع النسخة المحدّثة من بوابة المزوّد.");
  const [err, setErr] = useState<string>();
  const m = useMutation({ mutationFn: () => api.providers.requestDocument(p.id, { document: doc, branch, note }), onSuccess: () => done("أُرسل طلب المستند", "أُرسل طلب المستند للمركز") });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={480} title={`طلب مستند من ${p.name}`}>
      <form
        className="flex flex-col gap-3.5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!doc.trim()) return setErr("اكتب اسم المستند المطلوب");
          m.mutate();
        }}
      >
        <Field label="المستند المطلوب" error={err}>
          {(id) => <TextArea id={id} value={doc} invalid={!!err} onChange={(v) => (setDoc(v), setErr(undefined))} placeholder="اكتب اسم المستند المطلوب، مثال: رخصة البلدية سارية" />}
        </Field>
        <Field label="الفرع">{(id) => <Select id={id} value={branch} onChange={setBranch} options={branches} />}</Field>
        <Field label="ملاحظة">{(id) => <TextArea id={id} value={note} onChange={setNote} />}</Field>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button type="submit" loading={m.isPending}>
            إرسال الطلب
          </Button>
          <Button variant="secondary" className="h-[50px]" onClick={close} disabled={m.isPending}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** «كل الفروع» + أسماء الفروع من سطر الفروع («3 فروع: الزهراء ذهبي · الحمراء ذهبي …») */
function branchOptions(p: Provider) {
  const names = (p.branchesLine.split(":")[1] ?? "")
    .split("·")
    .map((s) => s.trim().split(" ")[0])
    .filter((s) => s && !s.startsWith("+"));
  return [{ value: "all", label: "كل الفروع" }, ...names.map((n) => ({ value: n, label: `فرع ${n}` }))];
}

// ───────────── CON5-07M · إعادة تفعيل (مغسلة الريان 3114-49792) ─────────────
function ReactivateModal({ p, close }: P) {
  const done = useDone(close);
  const [note, setNote] = useState("");
  const m = useMutation({ mutationFn: () => api.providers.reactivate(p.id, note), onSuccess: () => done("أُعيد التفعيل", "أُعيد تفعيل المركز وظهر للعملاء") });
  const branches = p.branchCount === 1 ? "وفرعه" : p.branchCount === 2 ? "وفرعاه" : "وفروعه";
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={480} title={`إعادة تفعيل ${p.name}`}>
      <Note>يعود المركز {branches} وخدماته للظهور للعملاء فوراً.</Note>
      <Field label="ملاحظة داخلية">{(id) => <TextArea id={id} value={note} onChange={setNote} placeholder="انتهى التجديد · تأكدنا من سريان المستندات." />}</Field>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button loading={m.isPending} onClick={() => m.mutate()}>
          إعادة التفعيل
        </Button>
        <Button variant="secondary" className="h-[50px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-07M · تعديل بيانات المنشأة (جونسون 3114-51188 · لومار 3114-52023 …) ─────────────
// 640 · شبكة عمودين (حقول 42 بنص 14 Regular) · ملاحظة زرقاء · «حفظ التعديل» كحلي يمين و«إلغاء» شمال
const req = (m: string) => z.string().trim().min(1, m);
const editSchema = z.object({
  brand: req("أدخل الاسم التجاري"),
  legalName: req("أدخل الاسم القانوني"),
  cr: z.string().regex(/^\d{10}$/, "السجل التجاري 10 أرقام"),
  vat: z.string().regex(/^3\d{13}3$/, "الرقم الضريبي 15 رقماً يبدأ وينتهي بـ3"),
  kind: req("أدخل نوع المنشأة"),
  owner: req("أدخل المالك"),
  contact: req("أدخل مسؤول التواصل"),
  bank: req("أدخل الحساب البنكي"),
});
function EditModal({ p, close }: P) {
  const done = useDone(close);
  const f = useForm({ resolver: zodResolver(editSchema), defaultValues: p.company });
  const m = useMutation({ mutationFn: (v: CompanyData) => api.providers.updateCompany(p.id, v), onSuccess: (_r, v) => done("حُفظت بيانات المنشأة", `حُفظت بيانات ${v.brand}`) });
  const e = f.formState.errors;
  const field = (name: keyof CompanyData, label: string, ltr?: boolean) => (
    <Field label={label} error={e[name]?.message}>
      {(id) => <TextInput id={id} {...f.register(name)} ltr={ltr} invalid={!!e[name]} className={`${M_INPUT} h-[42px]!`} />}
    </Field>
  );
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && (!f.formState.isDirty || confirm("تجاهل التعديلات غير المحفوظة؟")) && close()}
      width={640}
      title="تعديل بيانات المنشأة"
      subtitle={`${sub(p)} · تعديل لينكار المباشر يُسجّل في السجل ويُبلَّغ المزوّد`}
    >
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3.5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5">
          {field("brand", "الاسم التجاري")}
          {field("legalName", "الاسم القانوني")}
          {field("cr", "السجل التجاري", true)}
          {field("vat", "الرقم الضريبي", true)}
          {field("kind", "نوع المنشأة")}
          {field("owner", "المالك")}
          {field("contact", "مسؤول التواصل مع لينكار")}
          {field("bank", "الحساب البنكي")}
        </div>
        <DangerNote tone="info">تغيير الحساب البنكي أو السجل يتطلب مستنداً محدّثاً، ويُطبّق على الدفعات القادمة فقط.</DangerNote>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button type="submit" className="h-11" loading={m.isPending}>
            حفظ التعديل
          </Button>
          <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ───────────── CON5-07M · إضافة فرع (لومار 3114-52063 · XPEL 3114-52262 …) ─────────────
// 540 · حشو 22 · اسم الفرع/المدينة والحي · مدير الفرع/جوال المدير · الخدمات (شرائح) · زيارة ميدانية/المقيّم
const ASSESSORS = ["لينا الحربي", "ماجد ف.", "ريم العتيبي"].map((a) => ({ value: a, label: a }));
const AREAS = CITIES.flatMap((c) => (DISTRICTS[c] ?? []).map((d) => ({ value: `${c} · ${d}`, label: `${c} · ${d}` })));
const branchSchema = z.object({
  name: req("أدخل اسم الفرع"),
  area: req("اختر المدينة والحي"),
  manager: req("أدخل اسم مدير الفرع"),
  managerPhone: z.string().regex(/^05\d{8}$/, "جوال سعودي يبدأ بـ05 (10 أرقام)"),
  services: z.array(z.string()).min(1, "اختر خدمة واحدة على الأقل"),
  visit: req("اختر موعد الزيارة"),
  assessor: req("اختر المقيّم"),
});
function AddBranchModal({ p, close }: P) {
  const done = useDone(close);
  const f = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: "", area: AREAS.find((a) => a.value.startsWith(p.city))?.value ?? AREAS[0].value, manager: "", managerPhone: "", services: [] as string[], visit: "2026-10-25T10:00", assessor: ASSESSORS[0].value },
  });
  const m = useMutation({
    mutationFn: (v: z.infer<typeof branchSchema>) => api.providers.addBranch(p.id, { ...v, city: v.area }),
    onSuccess: () => done("أُضيف الفرع", `أُضيف فرع لـ${p.name} · بانتظار الزيارة الميدانية`),
  });
  const e = f.formState.errors;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && (!f.formState.isDirty || confirm("تجاهل البيانات غير المحفوظة؟")) && close()}
      width={540}
      className="gap-3! p-[22px]!"
      title={`إضافة فرع لـ${p.name}`}
      subtitle={
        <>
          <bdi dir="ltr">{p.code}</bdi> · {p.branchCount} {p.branchCount === 1 ? "فرع" : "فروع"}
        </>
      }
    >
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-3">
          <Field label="اسم الفرع" error={e.name?.message}>
            {(id) => <TextInput id={id} {...f.register("name")} placeholder="اسم الفرع على لينكار" invalid={!!e.name} className={M_INPUT} />}
          </Field>
          <Field label="المدينة والحي" error={e.area?.message}>
            {(id) => <Controller control={f.control} name="area" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={AREAS} className={M_SELECT} />} />}
          </Field>
          <Field label="مدير الفرع" error={e.manager?.message}>
            {(id) => <TextInput id={id} {...f.register("manager")} placeholder="اسم مدير الفرع" invalid={!!e.manager} className={M_INPUT} />}
          </Field>
          <Field label="جوال المدير" error={e.managerPhone?.message}>
            {(id) => <TextInput id={id} {...f.register("managerPhone", { setValueAs: (v: string) => v.replace(/\D/g, "") })} ltr inputMode="tel" placeholder="05X XXX XXXX" invalid={!!e.managerPhone} className={M_INPUT} />}
          </Field>
        </div>
        <Controller
          control={f.control}
          name="services"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-12 font-medium text-muted">الخدمات</legend>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_TYPES.map((s) => {
                  const on = field.value.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(on ? field.value.filter((x) => x !== s) : [...field.value, s])}
                      className={`h-6 rounded-full px-2 text-12 leading-[18px] font-medium ${on ? "bg-ink text-white" : "bg-surface-2 text-[#4a5550] hover:bg-border"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {e.services ? (
                <p role="alert" className="text-12 text-danger">
                  {e.services.message}
                </p>
              ) : null}
            </fieldset>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-3">
          <Field label="زيارة ميدانية" error={e.visit?.message}>
            {(id) => <Controller control={f.control} name="visit" render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} withTime min={today} invalid={!!e.visit} />} />}
          </Field>
          <Field label="المقيّم" error={e.assessor?.message}>
            {(id) => <Controller control={f.control} name="assessor" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={ASSESSORS} className={M_SELECT} />} />}
          </Field>
        </div>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
            إلغاء
          </Button>
          <Button type="submit" className="h-11" loading={m.isPending}>
            حفظ وجدولة الزيارة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
