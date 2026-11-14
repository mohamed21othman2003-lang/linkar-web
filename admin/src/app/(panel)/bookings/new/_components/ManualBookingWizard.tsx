"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PageHead } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, MANUAL_CATALOG, TRANSFER_BRANCHES, createManualBooking } from "@/lib/api/bookings";
import { beforeVat, ltrRuns, margin, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";

// CON5-04N1 · العميل والسيارة (3114-36264) · CON5-04N2 · الخدمة والفرع (3114-36379) + القوائم CON5-04N2m (3114-39985 …)
// · CON5-04N3 · الدفع ومصدر الحجز (3114-36508) · CON5-04N4 · المراجعة والتأكيد (3114-36603) — الرابط /bookings/new?step=1…4
// بعد التأكيد: CON5-04T · أُنشئ BK-21476 ويفتح تبويب «الحجز اليدوي» (3248-104956)
const STEPS = ["العميل والسيارة", "الخدمة والفرع", "الدفع ومصدر الحجز", "المراجعة والتأكيد"];
const MAKES = ["تويوتا", "هيونداي", "لكزس", "نيسان", "كيا", "مرسيدس"];
const MODELS = ["كامري", "كورولا", "لاندكروزر", "يارس"];
const YEARS = ["2026", "2025", "2024", "2023", "2022"];
const SIZES = ["سيدان", "SUV متوسط", "SUV كبير"];
const CITIES = ["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"];
const PROVIDERS = [
  { value: "lk-jn-001", label: "جونسون · LK-JN-001" },
  { value: "lk-lm-001", label: "لومار · LK-LM-001" },
  { value: "lk-xp-001", label: "XPEL · LK-XP-001" },
  { value: "lk-ns-001", label: "نانو شيلد · LK-NS-001" },
];
const TIER: Record<string, string> = { "LK-JN-ZH-001": "ذهبي", "LK-JN-HM-002": "ذهبي", "LK-JN-MH-003": "ذهبي", "LK-LM-RD-001": "بلاتيني", "LK-LM-YS-002": "بلاتيني", "LK-XP-OL-001": "بلاتيني", "LK-XP-MQ-002": "بلاتيني", "LK-NS-RD-001": "ذهبي" };
const CHANNELS = ["مكالمة هاتفية", "واتساب", "زيارة الفرع", "البريد الإلكتروني"];
const TYPES = [
  { value: "", label: "الكل" },
  { value: "service", label: "خدمة" },
  { value: "package", label: "باقة" },
  { value: "offer", label: "عرض" },
];

const schema = z.object({
  phone: z.string().regex(/^05\d(\s?\d){7}$/, "اكتب رقم جوال سعودي يبدأ بـ 05"),
  name: z.string().trim().min(3, "اكتب اسم العميل"),
  email: z.union([z.literal(""), z.email("بريد إلكتروني غير صحيح")]),
  make: z.string().min(1, "اختر الماركة"),
  model: z.string().min(1, "اختر الموديل"),
  year: z.string().min(1, "اختر السنة"),
  size: z.string().min(1, "اختر حجم السيارة"),
  plate: z.string().trim().min(3, "اكتب رقم اللوحة"),
  city: z.string(),
  providerId: z.string(),
  branchCode: z.string().min(1, "اختر الفرع"),
  services: z.array(z.string()).min(1, "اختر خدمة واحدة على الأقل"),
  code: z.string(),
  pay: z.enum(["link", "bank"]),
  channel: z.string().min(1),
});
type Form = z.infer<typeof schema>;
const STEP_FIELDS: (keyof Form)[][] = [["phone", "name", "email", "make", "model", "year", "size", "plate"], ["branchCode", "services"], ["pay", "channel"], []];

export function ManualBookingWizard() {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const step = Math.min(4, Math.max(1, Number(url.get("step")) || 1));
  const [leave, setLeave] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", name: "", email: "", make: "", model: "", year: "", size: "", plate: "", city: "جدة", providerId: "lk-jn-001", branchCode: "LK-JN-ZH-001", services: [], code: "", pay: "link", channel: "مكالمة هاتفية" },
  });
  const dirty = form.formState.isDirty;
  // تأكيد قبل مغادرة نموذج فيه بيانات (القسم 2.7)
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  // الخطوات التالية ما تتفتحش من الرابط قبل ما الخطوة الأولى تكتمل
  useEffect(() => {
    if (step > 1 && !form.getValues("name")) url.replace({ step: "1" });
  }, [step, form, url]);

  const create = useMutation({
    mutationFn: () => {
      const v = form.getValues();
      return createManualBooking({ ...v, phone: v.phone.replace(/\s/g, "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3") });
    },
    onSuccess: (r) => {
      toast(r.toast);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      form.reset(form.getValues());
      router.push(form.getValues("pay") === "bank" ? `/bookings?tab=manual&modal=payment&b=${r.id}` : "/bookings?tab=manual");
    },
  });

  const next = async () => {
    const ok = await form.trigger(STEP_FIELDS[step - 1]);
    if (!ok) return;
    if (step < 4) url.push({ step: String(step + 1) });
    else create.mutate();
  };
  const back = () => (step > 1 ? url.push({ step: String(step - 1) }) : dirty ? setLeave(true) : router.push("/bookings"));

  return (
    <>
      <PageHead title="حجز يدوي" description="حجز لعميل بالهاتف أو واتساب أو طلب شركة." crumbs={[{ label: "الحجوزات", href: "/bookings" }, { label: "حجز يدوي" }]} />
      <Stepper step={step} />
      <div className="flex flex-col-reverse items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-1">
          {step === 1 ? <Step1 form={form} /> : step === 2 ? <Step2 form={form} /> : step === 3 ? <Step3 form={form} /> : <Step4 form={form} />}
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" className="h-[46px]! px-4!" onClick={back}>
              {step === 1 ? "إلغاء" : "السابق"}
            </Button>
            <span className="flex-1" />
            <Button variant={step === 4 ? "accent" : "primary"} className="h-11! px-4!" loading={create.isPending} onClick={next}>
              {step === 4 ? (form.getValues("pay") === "bank" ? "تأكيد الحجز وتسجيل الدفعة" : "تأكيد الحجز وإرسال رابط الدفع") : `التالي: ${step === 1 ? "الخدمة والفرع" : step === 2 ? "الدفع" : "المراجعة"}`}
            </Button>
          </div>
        </div>
        <Summary form={form} step={step} />
      </div>
      <Modal
        open={leave}
        onOpenChange={setLeave}
        title="تجاهل الحجز؟"
        description="البيانات التي أدخلتها لن تُحفظ."
        footer={
          <>
            <Button variant="danger" className="h-11!" onClick={() => (form.reset(), router.push("/bookings"))}>
              تجاهل والخروج
            </Button>
            <Button variant="secondary" className="h-[46px]!" onClick={() => setLeave(false)}>
              متابعة الحجز
            </Button>
          </>
        }
      />
    </>
  );
}

// ───────────── المؤشر (Stepper): 58 · r14 · حشو 14·18 · دوائر 28 ─────────────
function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto rounded-14 border border-border bg-white px-[18px] py-3.5 [scrollbar-width:none]">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const cur = n === step;
        return (
          <li key={label} className="contents">
            {i > 0 ? <span className={`h-0.5 min-w-6 flex-1 ${n <= step ? "bg-lime" : "bg-[#e3e7e5]"}`} /> : null}
            <span className="flex shrink-0 items-center gap-2" aria-current={cur ? "step" : undefined}>
              <span className={`num flex size-7 items-center justify-center rounded-full text-13 font-bold ${done ? "bg-lime text-ink" : cur ? "bg-ink text-white" : "bg-surface-2 text-muted"}`}>{done ? <Icon name="check" size={14} /> : n}</span>
              <span className={`text-13 whitespace-nowrap ${cur ? "font-bold text-ink" : done ? "font-medium text-ink" : "font-medium text-muted"}`}>{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-16 border border-border bg-white p-5">
      <h2 className="text-16 leading-[26px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function KVRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

type F = { form: UseFormReturn<Form> };
const opts = (l: readonly string[]) => l.map((v) => ({ value: v, label: v }));

function TextF({ form, name, label, placeholder, ltr }: F & { name: "phone" | "name" | "email" | "plate" | "code"; label: string; placeholder?: string; ltr?: boolean }) {
  const err = form.formState.errors[name]?.message;
  return <Field label={label} error={err}>{(id) => <TextInput id={id} {...form.register(name)} invalid={!!err} ltr={ltr} placeholder={placeholder} className="[&_input]:text-14! [&_input]:font-normal!" />}</Field>;
}
function SelectF({ form, name, label, options }: F & { name: "make" | "model" | "year" | "size" | "city" | "providerId" | "branchCode" | "channel"; label: string; options: { value: string; label: string }[] }) {
  const v = useWatch({ control: form.control, name });
  const err = form.formState.errors[name]?.message;
  return (
    <Field label={label} error={err}>
      {(id) => <Select id={id} value={v} options={options} invalid={!!err} onChange={(x) => form.setValue(name, x, { shouldDirty: true, shouldValidate: !!err })} className="[&>span]:text-14! [&>span]:font-normal!" />}
    </Field>
  );
}

function Step1({ form }: F) {
  return (
    <>
      <Card title="العميل">
        <TextF form={form} name="phone" label="رقم الجوال" placeholder="055 410 2287" ltr />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextF form={form} name="name" label="الاسم الكامل" placeholder="خالد الدوسري" />
          <TextF form={form} name="email" label="البريد الإلكتروني (اختياري)" placeholder="khaled.d@example.com" ltr />
        </div>
      </Card>
      <Card title="السيارة">
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectF form={form} name="make" label="الماركة" options={opts(MAKES)} />
          <SelectF form={form} name="model" label="الموديل" options={opts(MODELS)} />
          <SelectF form={form} name="year" label="سنة الصنع" options={opts(YEARS)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectF form={form} name="size" label="حجم السيارة" options={opts(SIZES)} />
          <TextF form={form} name="plate" label="رقم اللوحة" placeholder="ر ج د 4821" />
        </div>
      </Card>
    </>
  );
}

function Step2({ form }: F) {
  const providerId = useWatch({ control: form.control, name: "providerId" });
  const selected = useWatch({ control: form.control, name: "services" });
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const branches = TRANSFER_BRANCHES.filter((b) => b.providerId === providerId).map((b) => ({ value: b.branchCode, label: `فرع ${b.branch} · ${TIER[b.branchCode] ?? ""}` }));
  const list = MANUAL_CATALOG.filter((s) => (!category || s.category === category) && (!type || s.type === type) && (!q.trim() || s.name.includes(q.trim())));
  const picked = MANUAL_CATALOG.filter((s) => selected.includes(s.id));
  const sale = picked.reduce((s, x) => s + x.sale, 0);
  const cost = picked.reduce((s, x) => s + x.cost, 0);
  const m = margin(sale, cost);
  const err = form.formState.errors.services?.message;
  const toggle = (id: string) => form.setValue("services", selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id], { shouldDirty: true, shouldValidate: !!err });
  return (
    <>
      <Card title="ماذا يحجز العميل؟">
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_1fr]">
          <SelectF form={form} name="city" label="المدينة" options={opts(CITIES)} />
          <SelectF
            form={form}
            name="providerId"
            label="مقدّم الخدمة"
            options={PROVIDERS}
          />
          <SelectF form={form} name="branchCode" label="الفرع" options={branches} />
        </div>
        <p className="text-13 font-semibold text-ink">الخدمات والباقات والعروض · الأسعار شاملة الضريبة</p>
        <div className="grid gap-4 sm:grid-cols-[1fr_150px_150px]">
          <Field label="بحث">{(id) => <TextInput id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الخدمة أو الباقة" icon={<Icon name="search" size={16} />} className="[&_input]:text-14! [&_input]:font-normal!" />}</Field>
          <Field label="النوع">{(id) => <Select id={id} value={type} options={TYPES} onChange={setType} className="[&>span]:text-14! [&>span]:font-normal!" />}</Field>
          <Field label="التصنيف">{(id) => <Select id={id} value={category} options={[{ value: "", label: "الكل" }, ...opts(CATEGORIES)]} onChange={setCategory} className="[&>span]:text-14! [&>span]:font-normal!" />}</Field>
        </div>
        <div className="flex flex-col gap-2.5" role="group" aria-label="الخدمات">
          {list.length ? (
            list.map((s) => {
              const on = selected.includes(s.id);
              const sm = margin(s.sale, s.cost);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={s.name}
                  disabled={s.disabled}
                  onClick={() => toggle(s.id)}
                  className={`flex min-h-20 items-center gap-3.5 rounded-14 px-4 py-3 text-start disabled:cursor-not-allowed ${on ? "border border-ink bg-lime-tint" : s.disabled ? "border border-border bg-surface-1" : "border border-border bg-white hover:bg-surface-1"}`}
                >
                  <span className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border ${on ? "border-ink bg-ink text-lime" : s.disabled ? "border-border bg-white" : "border-border-strong bg-white"}`}>{on ? <Icon name="check" size={14} /> : null}</span>
                  <span aria-hidden className="flex size-[52px] shrink-0 items-center justify-center rounded-16 border border-border text-[10px] font-bold tracking-wide text-ink">JOHNSON</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={`text-[15px] leading-6 font-semibold ${s.disabled ? "text-[#8a948f]" : "text-ink"}`}>{ltrRuns(s.name)}</span>
                    <span className="text-12 leading-[18px] font-light text-muted">{ltrRuns(s.line)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className={`num text-[15px] leading-6 font-bold ${s.disabled ? "text-[#8a948f]" : "text-ink"}`}>{num(s.sale)} ر.س</span>
                    <span className={`num text-12 leading-[18px] font-medium ${s.disabled ? "text-[#8a948f]" : "text-muted"}`}>
                      التكلفة {num(s.cost)} · الهامش {num(sm.value)}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="py-6 text-center text-13 text-muted">لا توجد نتائج</p>
          )}
        </div>
        {err ? (
          <p role="alert" className="text-12 text-danger">
            {err}
          </p>
        ) : null}
        <p className="num rounded-12 bg-surface-1 px-3.5 py-2.5 text-13 font-semibold text-ink">{ltrRuns(`${num(picked.length)} مختارة · المجموع ${num(sale)} ر.س · التكلفة ${num(cost)} · الهامش ${num(m.value)}`)}</p>
      </Card>
      <Card title="السعر">
        <KVRow k="سعر لينكار للعميل">{num(sale)} ر.س شامل الضريبة</KVRow>
        <KVRow k="سعر التكلفة · شامل الضريبة">{num(cost)} ر.س · سعر التكلفة</KVRow>
        <KVRow k="هامش لينكار">
          {num(m.value)} ر.س · {num(m.percent, m.percent % 1 ? 1 : 0)}%
        </KVRow>
        <TextF form={form} name="code" label="كود خصم (اختياري)" placeholder="أدخل الكود" />
      </Card>
    </>
  );
}

function Step3({ form }: F) {
  const pay = useWatch({ control: form.control, name: "pay" });
  const option = (v: "link" | "bank", label: string) => (
    <button type="button" role="radio" aria-checked={pay === v} onClick={() => form.setValue("pay", v, { shouldDirty: true })} className={`flex h-12 items-center gap-2.5 rounded-12 px-3.5 text-start text-14 text-ink ${pay === v ? "border-[1.5px] border-ink bg-lime-tint font-semibold" : "border border-border bg-white font-medium hover:bg-surface-1"}`}>
      <span className="flex-1">{label}</span>
      <span className={`size-[18px] shrink-0 rounded-full ${pay === v ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
    </button>
  );
  return (
    <>
      <Card title="الدفع">
        <div role="radiogroup" aria-label="الدفع" className="flex flex-col gap-3">
          {option("link", "إرسال رابط دفع للعميل")}
          {option("bank", "مدفوع بتحويل بنكي")}
        </div>
      </Card>
      <Card title="مصدر الحجز">
        <SelectF form={form} name="channel" label="القناة" options={opts(CHANNELS)} />
      </Card>
    </>
  );
}

function useDerived(form: UseFormReturn<Form>) {
  const v = useWatch({ control: form.control });
  return useMemo(() => {
    const picked = MANUAL_CATALOG.filter((s) => v.services?.includes(s.id));
    const sale = picked.reduce((s, x) => s + x.sale, 0);
    const br = TRANSFER_BRANCHES.find((b) => b.branchCode === v.branchCode);
    return { v, picked, sale, br };
  }, [v]);
}

function Step4({ form }: F) {
  const { v, picked, sale, br } = useDerived(form);
  return (
    <Card title="راجع قبل التأكيد">
      <KVRow k="العميل">{ltrRuns([v.name, v.phone, v.email].filter(Boolean).join(" · "))}</KVRow>
      <KVRow k="السيارة">{ltrRuns(`${v.make} ${v.model} ${v.year} · ${v.size} · ${v.plate}`)}</KVRow>
      <KVRow k="الخدمة">{ltrRuns(`${picked.map((s) => s.name).join(" + ")} · ${v.size}`)}</KVRow>
      <KVRow k="الفرع">{br ? ltrRuns(`${br.provider} · فرع ${br.branch} · ${br.branchCode}`) : "—"}</KVRow>
      <KVRow k="المبلغ · شامل الضريبة">
        {num(sale)} ر.س · منها ضريبة {num(Math.round((sale - beforeVat(sale)) * 100) / 100, 2)} ر.س
      </KVRow>
      <KVRow k="الدفع">{v.pay === "bank" ? "مدفوع بتحويل بنكي · تُسجّل الحوالة بعد التأكيد" : "رابط دفع صالح حتى 15 أكتوبر 2026"}</KVRow>
      <KVRow k="المصدر">{v.channel} · هند المطيري · لينكار</KVRow>
    </Card>
  );
}

// ───────────── «ملخص الحجز» (360 على الشمال) ─────────────
function Summary({ form, step }: F & { step: number }) {
  const { v, picked, sale, br } = useDerived(form);
  const has = step > 1 && picked.length;
  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 rounded-16 border border-border bg-white p-5 lg:w-[360px]">
      <h2 className="text-16 leading-[26px] font-bold text-ink">ملخص الحجز</h2>
      <KVRow k="العميل">{v.name ? ltrRuns(`${v.name} · ${v.phone} · عميل جديد`) : "—"}</KVRow>
      <KVRow k="السيارة">{v.make ? `${v.make} ${v.model} ${v.year} · ${v.size}` : "—"}</KVRow>
      <KVRow k="الخدمة">{has ? ltrRuns(picked.map((s) => s.name).join(" + ")) : "—"}</KVRow>
      <KVRow k="مقدّم الخدمة والفرع">{has && br ? `${br.provider} · فرع ${br.branch} · ${TIER[br.branchCode] ?? ""}` : "—"}</KVRow>
      <KVRow k="السعر للعميل · شامل الضريبة">{has ? `${num(sale)} ر.س شامل الضريبة` : "—"}</KVRow>
      <KVRow k="الدفع">{step > 2 ? (v.pay === "bank" ? "تحويل بنكي" : "رابط دفع · صالح 24 ساعة") : "—"}</KVRow>
      <KVRow k="المصدر">{step > 2 ? v.channel : "—"}</KVRow>
    </aside>
  );
}
