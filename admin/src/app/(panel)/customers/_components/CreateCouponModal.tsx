"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { keepFocusQuiet } from "@/components/ui/focus";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { couponsMutations, dayLabel, type CouponInput, type CouponKind } from "@/lib/api/coupons";
import { maskPhone } from "@/lib/api/customers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";

// CON5-05M · إنشاء كوبون — عام (3411-243106) · أرقام جوال (3409-242257) · أرقام جوال · ملف (3411-243269) · عميل مسجّل (3411-244157)
// · أرقام جوال · كود واحد (3435-326850) · أرقام جوال · ملف · كود واحد (3435-326977)
// → CON5-05T أُنشئ الكوبون · LINKAR20 (3411-247876) · أُنشئ الكوبون وأُرسل · OCT15 (3411-247871) · REEM100 (3411-247881)
// 1040 عرض · r20 · حشو 24 · مسافة 12 · عمودين بمسافة 24 · عناوين المجموعات 15/30 SemiBold · حقول 44 r10 نص 14/22 Regular
// الرابط ?modal=create-coupon&kind=general|phones|customer

const PHONES = [
  "0551234890", "0509876123", "0534412876", "0567710943", "0548827302", "0583305519", "0551402233", "0506613390", "0539921174", "0564450861",
  "0542217789", "0558836402", "0501174456", "0537760318", "0569043327", "0545521960", "0553307714", "0508842295", "0531196608", "0562278841",
  "0549963072", "0556614489", "0503359920", "0538807146", "0566621305",
];
const DATES = [
  { value: "2026-10-14", label: "14 أكتوبر 2026" },
  { value: "2026-10-15", label: "15 أكتوبر 2026" },
  { value: "2026-11-01", label: "1 نوفمبر 2026" },
  { value: "2026-11-14", label: "14 نوفمبر 2026" },
  { value: "2026-11-30", label: "30 نوفمبر 2026" },
  { value: "2026-12-31", label: "31 ديسمبر 2026" },
];
const DISCOUNT_TYPES = [
  { value: "percent", label: "نسبة مئوية" },
  { value: "fixed", label: "مبلغ ثابت" },
];
const CENTERS = ["كل المراكز", "جونسون Johnson", "لومار", "XPEL", "نانو شيلد", "مركز لمعة للتلميع"];
const BRANCHES = ["كل الفروع", "فرع الزهراء", "فرع الحمراء", "فرع المحمدية", "فرع الروضة", "فرع العليا"];
const SERVICES = ["كل الخدمات", "نانو سيراميك", "نانو سيراميك، التظليل", "التظليل", "حماية PPF", "التلميع", "الغسيل والتنظيف"];
const PACKAGES = ["كل الباقات", "بدون باقات", "باقة العناية الكاملة", "باقة النانو والتلميع"];
const opts = (l: string[]) => l.map((v) => ({ value: v, label: v }));

type Channel = "واتساب" | "رسالة نصية";
type Form = {
  code: string;
  perNumber: boolean;
  phonesText: string;
  file: { name: string; phones: string[] } | null;
  channel: Channel;
  customerQ: string;
  customer: { id: string; name: string; phone: string; city: string } | null;
  message: string;
  discountType: "percent" | "fixed";
  value: string;
  max: string;
  min: string;
  centers: string;
  branches: string;
  services: string;
  packages: string;
  perUser: string;
  total: string;
  from: string;
  to: string;
};

const DEFAULTS: Record<CouponKind, Form> = {
  general: {
    code: "LINKAR20", perNumber: true, phonesText: "", file: null, channel: "واتساب", customerQ: "", customer: null, message: "",
    discountType: "percent", value: "20", max: "150", min: "", centers: "كل المراكز", branches: "كل الفروع", services: "كل الخدمات", packages: "كل الباقات",
    perUser: "1", total: "1000", from: "2026-11-01", to: "2026-11-30",
  },
  phones: {
    code: "OCT15", perNumber: true, phonesText: PHONES.join("\n"), file: null, channel: "واتساب", customerQ: "", customer: null,
    message: "لينكار: خصم 15% على نانو سيراميك والتظليل حتى 14 نوفمبر 2026. كودك: {الكود} · احجز من linkar.sa",
    discountType: "percent", value: "15", max: "200", min: "500", centers: "كل المراكز", branches: "كل الفروع", services: "نانو سيراميك، التظليل", packages: "بدون باقات",
    perUser: "1", total: "25", from: "2026-10-14", to: "2026-11-14",
  },
  customer: {
    code: "REEM100", perNumber: false, phonesText: "", file: null, channel: "رسالة نصية", customerQ: "ريم", customer: { id: "cu-rs", name: "ريم س.", phone: "055 124 7830", city: "جدة" },
    message: "لينكار: هديتك خصم 100 ر.س على نانو سيراميك في جونسون · فرع الزهراء حتى 14 نوفمبر 2026. كودك: {الكود} · احجز من linkar.sa",
    discountType: "fixed", value: "100", max: "", min: "500", centers: "جونسون Johnson", branches: "فرع الزهراء", services: "نانو سيراميك", packages: "بدون باقات",
    perUser: "1", total: "1", from: "2026-10-14", to: "2026-11-14",
  },
};

const parsePhones = (t: string) => [...new Set((t.match(/05\d{8}/g) ?? []).map((p) => p))];

export function CreateCouponModal() {
  const url = useUrlState();
  const open = url.get("modal") === "create-coupon";
  if (!open) return null;
  return <Inner />;
}

function Inner() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const kind = (["phones", "customer"].includes(url.get("kind") ?? "") ? url.get("kind") : "general") as CouponKind;
  const [forms, setForms] = useState<Partial<Record<CouponKind, Form>>>({});
  const f = forms[kind] ?? DEFAULTS[kind];
  const set = (patch: Partial<Form>) => {
    setForms((s) => ({ ...s, [kind]: { ...f, ...patch } }));
    setErrors({});
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = Object.keys(forms).length > 0;

  const phones = kind === "phones" ? (f.file ? f.file.phones : parsePhones(f.phonesText)) : [];
  const sampleCode = kind === "phones" && f.perNumber ? `${f.code}-7K2Q` : f.code;
  const preview = f.message.replaceAll("{الكود}", sampleCode);
  const close = () => url.replace({ modal: null, kind: null });
  const tryClose = () => {
    if (m.isPending) return;
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    close();
  };

  const m = useMutation({
    mutationFn: (v: CouponInput) => couponsMutations.create(v),
    onSuccess: (r, v) => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      qc.invalidateQueries({ queryKey: ["customers", "list"] });
      close();
      const code = r.coupon.code;
      if (v.kind === "phones") toast("أُنشئ الكوبون وأُرسل", `أُنشئ الكوبون ${code} وأُرسل إلى ${num(v.phones?.length ?? 0)} رقماً عبر ${v.channel}`);
      else if (v.kind === "customer") toast("أُنشئ الكوبون وأُرسل", `أُنشئ الكوبون ${code} وأُرسل إلى ${v.customer?.name} ${v.channel === "واتساب" ? "عبر واتساب" : "برسالة نصية"}`);
      else toast("أُنشئ الكوبون", r.coupon.status === "scheduled" ? `أُنشئ الكوبون ${code} · يبدأ ${dayLabel(v.from)}` : `أُنشئ الكوبون ${code}`);
    },
    onError: (e) => setErrors(isApiError(e) && e.fields ? e.fields : { form: "تعذّر إنشاء الكوبون. حاول مرة أخرى." }),
  });

  const submit = () => {
    const e: Record<string, string> = {};
    if (!/^[A-Za-z0-9]{3,16}$/.test(f.code)) e.code = "الكود من 3 إلى 16 حرفاً إنجليزياً أو رقماً";
    if (!(Number(f.value) > 0)) e.value = "أدخل قيمة الخصم";
    if (f.discountType === "percent" && Number(f.value) > 100) e.value = "النسبة لا تزيد عن 100%";
    if (kind === "phones" && phones.length === 0) e.phones = "أدخل رقم جوال واحداً على الأقل";
    if (kind === "customer" && !f.customer) e.customer = "اختر العميل";
    if (kind !== "general" && !f.message.includes("{الكود}")) e.message = "أضف {الكود} في نص الرسالة";
    if (f.to < f.from) e.to = "تاريخ النهاية قبل البداية";
    if (Object.keys(e).length) return setErrors(e);
    m.mutate({
      kind,
      code: f.code,
      perNumber: f.perNumber,
      phones,
      customer: f.customer ? { name: f.customer.name, phone: maskPhone(f.customer.phone) } : undefined,
      channel: f.channel,
      discountType: f.discountType,
      value: Number(f.value),
      max: Number(f.max) || undefined,
      min: Number(f.min) || undefined,
      centers: f.centers,
      branches: f.branches,
      services: f.services,
      packages: f.packages,
      perUser: Number(f.perUser) || 1,
      total: kind === "phones" ? phones.length : Number(f.total) || 1,
      from: f.from,
      to: f.to,
    });
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const list = parsePhones(String(r.result ?? ""));
      if (!list.length) return setErrors({ phones: "الملف لا يحتوي على أرقام جوال صحيحة" });
      set({ file: { name: file.name, phones: list } });
    };
    r.readAsText(file);
  };

  const codeField = (label: string, icon?: UiGlyph) => (
    <F label={label} error={errors.code}>
      <Input value={f.code} onChange={(v) => set({ code: v.toUpperCase().replace(/[^A-Z0-9]/g, "") })} label={label} icon={icon} ltr invalid={!!errors.code} />
    </F>
  );
  const channelField = (
    <F label="قناة الإرسال">
      <Chips value={f.channel} options={["رسالة نصية", "واتساب"]} onChange={(v) => set({ channel: v as Channel })} label="قناة الإرسال" />
    </F>
  );
  const messageCol = (
    <div className="flex min-w-0 flex-col gap-3.5">
      <F label="نص الرسالة" error={errors.message}>
        <textarea
          value={f.message}
          onChange={(e) => set({ message: e.target.value })}
          aria-label="نص الرسالة"
          className={`h-[72px] resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink ${errors.message ? "border-danger" : "border-border"}`}
        />
      </F>
      <F label="المعاينة">
        <p className="h-[72px] overflow-hidden rounded-10 bg-surface-1 px-3 pt-2.5 text-14 leading-[22px] text-ink">{ltrRuns(preview)}</p>
      </F>
    </div>
  );

  return (
    <Dialog.Root open onOpenChange={(o) => !o && tryClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          dir="rtl"
          onOpenAutoFocus={keepFocusQuiet}
          style={{ width: 1040 }}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[94vh] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6 shadow-card focus:outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <Dialog.Title className="text-18 font-bold text-ink">إنشاء كوبون</Dialog.Title>
            <Dialog.Close className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">إنشاء كوبون خصم جديد</Dialog.Description>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            <F label="نوع الكوبون">
              <Chips
                value={kind}
                options={["general", "phones", "customer"]}
                labels={{ general: "عام", phones: "أرقام جوال", customer: "عميل مسجّل" }}
                onChange={(v) => {
                  url.replace({ kind: v === "general" ? null : v });
                  setErrors({});
                }}
                label="نوع الكوبون"
              />
            </F>
            {kind === "phones" ? (
              <F label="الكود">
                <Chips value={f.perNumber ? "per" : "one"} options={["per", "one"]} labels={{ per: "كود لكل رقم", one: "كود واحد لكل الأرقام" }} onChange={(v) => set({ perNumber: v === "per" })} label="الكود" />
              </F>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 md:grid-cols-2">
            {kind === "general" ? (
              codeField("الكود", "copy")
            ) : kind === "phones" ? (
              <div className="flex min-w-0 flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex h-8 items-center justify-between gap-2">
                    <span className="text-12 leading-5 font-medium text-muted">أرقام الجوال</span>
                    <button
                      type="button"
                      onClick={() => (f.file ? set({ file: null }) : fileRef.current?.click())}
                      className="flex h-8 items-center rounded-12 border border-border bg-white px-3 text-14 leading-[22px] font-medium text-ink hover:bg-surface-1"
                    >
                      {f.file ? "لصق الأرقام" : <bdi>رفع ملف CSV</bdi>}
                    </button>
                    <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="ملف الأرقام" />
                  </div>
                  {f.file ? (
                    <div className={`flex h-11 items-center gap-2 rounded-10 border bg-white px-3 text-14 leading-[22px] text-ink ${errors.phones ? "border-danger" : "border-border"}`}>
                      <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
                      <Icon name="file" size={16} className="shrink-0" />
                    </div>
                  ) : (
                    <textarea
                      value={f.phonesText}
                      onChange={(e) => set({ phonesText: e.target.value })}
                      aria-label="أرقام الجوال"
                      dir="ltr"
                      className={`num h-[100px] resize-none rounded-10 border bg-white px-3 pt-2.5 text-right text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink ${errors.phones ? "border-danger" : "border-border"}`}
                    />
                  )}
                  {errors.phones ? <p role="alert" className="text-12 text-danger">{errors.phones}</p> : <p className="num text-12 leading-[18px] font-light text-muted">{`${num(phones.length)} رقماً`}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {f.perNumber ? (
                    <F label="بادئة الكود" error={errors.code}>
                      <Input value={f.code} onChange={(v) => set({ code: v.toUpperCase().replace(/[^A-Z0-9]/g, "") })} label="بادئة الكود" ltr invalid={!!errors.code} />
                    </F>
                  ) : (
                    codeField("الكود")
                  )}
                  {channelField}
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-3.5">
                <CustomerPicker f={f} set={set} error={errors.customer} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {codeField("الكود", "copy")}
                  {channelField}
                </div>
              </div>
            )}
            {kind === "general" ? <span className="hidden md:block md:min-h-[100px]" /> : messageCol}
          </div>

          <Group title="الخصم">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <F label="نوع الخصم">
                <Pick label="نوع الخصم" value={f.discountType} onChange={(v) => set({ discountType: v as Form["discountType"] })} options={DISCOUNT_TYPES} />
              </F>
              <F label="القيمة" error={errors.value}>
                <Input value={f.value} onChange={(v) => set({ value: v.replace(/[^\d]/g, "") })} label="القيمة" suffix={f.discountType === "percent" ? "%" : "ر.س"} tight={f.discountType === "percent"} invalid={!!errors.value} />
              </F>
              <F label="الحد الأقصى للخصم">
                <Input value={f.max} onChange={(v) => set({ max: v.replace(/[^\d]/g, "") })} label="الحد الأقصى للخصم" suffix="ر.س" placeholder="—" />
              </F>
              <F label="الحد الأدنى للحجز">
                <Input value={f.min} onChange={(v) => set({ min: v.replace(/[^\d]/g, "") })} label="الحد الأدنى للحجز" suffix="ر.س" placeholder="—" />
              </F>
            </div>
          </Group>

          <Group title="ينطبق على">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <F label="المراكز">
                <Pick label="المراكز" value={f.centers} onChange={(v) => set({ centers: v })} options={opts(CENTERS)} />
              </F>
              <F label="الفروع">
                <Pick label="الفروع" value={f.branches} onChange={(v) => set({ branches: v })} options={opts(BRANCHES)} />
              </F>
              <F label="الخدمات">
                <Pick label="الخدمات" value={f.services} onChange={(v) => set({ services: v })} options={opts(SERVICES)} />
              </F>
              <F label="الباقات">
                <Pick label="الباقات" value={f.packages} onChange={(v) => set({ packages: v })} options={opts(PACKAGES)} />
              </F>
            </div>
          </Group>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            <Group title="الصلاحية">
              <div className="grid grid-cols-2 gap-3">
                <F label="من">
                  <Pick label="من" value={f.from} onChange={(v) => set({ from: v })} options={DATES} icon="calendar" />
                </F>
                <F label="إلى" error={errors.to}>
                  <Pick label="إلى" value={f.to} onChange={(v) => set({ to: v })} options={DATES} icon="calendar" />
                </F>
              </div>
            </Group>
            <Group title="عدد مرات الاستخدام">
              <div className="grid grid-cols-2 gap-3">
                <F label="الإجمالي">
                  <Input value={kind === "phones" ? String(phones.length) : f.total} onChange={(v) => set({ total: v.replace(/[^\d]/g, "") })} label="الإجمالي" readOnly={kind === "phones"} />
                </F>
                <F label={kind === "phones" ? "لكل رقم" : "لكل عميل"}>
                  <Input value={f.perUser} onChange={(v) => set({ perUser: v.replace(/[^\d]/g, "") })} label={kind === "phones" ? "لكل رقم" : "لكل عميل"} />
                </F>
              </div>
            </Group>
          </div>

          {errors.form ? <p role="alert" className="text-13 text-danger">{errors.form}</p> : null}
          <div className="flex items-center justify-between gap-2.5">
            <Button variant="accent" onClick={submit} loading={m.isPending} className="h-11 px-5">
              {kind === "general" ? "إنشاء" : "إنشاء وإرسال"}
            </Button>
            <Button variant="secondary" onClick={tryClose} disabled={m.isPending} className="h-[46px] px-5">
              إلغاء
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ───────────── عناصر ─────────────
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <h3 className="text-[15px] leading-[30px] font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}
function F({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
      {children}
      {error ? <p role="alert" className="text-12 text-danger">{error}</p> : null}
    </div>
  );
}
function Input({ value, onChange, label, icon, ltr, suffix, tight, invalid, placeholder, readOnly }: { value: string; onChange: (v: string) => void; label: string; icon?: UiGlyph; ltr?: boolean; suffix?: string; tight?: boolean; invalid?: boolean; placeholder?: string; readOnly?: boolean }) {
  const empty = !value && placeholder;
  return (
    <label dir={tight ? "ltr" : undefined} className={`flex h-11 min-w-0 items-center rounded-10 border bg-white px-3 text-14 leading-[22px] text-ink focus-within:border-[1.5px] focus-within:border-ink ${tight ? "justify-end gap-0 [&>span]:flex-none" : "gap-2"} ${invalid ? "border-danger" : "border-border"}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        dir={ltr ? "ltr" : undefined}
        className={`num min-w-0 bg-transparent outline-none placeholder:text-ink ${suffix && !empty ? "w-auto max-w-[70%] [field-sizing:content]" : "flex-1"} ${ltr ? "text-right" : ""}`}
      />
      {suffix && !empty ? <span className="min-w-0 flex-1">{suffix}</span> : null}
      {icon ? <Icon name={icon} size={16} className="shrink-0" /> : null}
    </label>
  );
}
function Pick({ value, onChange, options, label, icon }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; icon?: UiGlyph }) {
  return <Select ariaLabel={label} value={value} onChange={onChange} icon={icon} options={options} className="[&>span]:text-14 [&>span]:leading-[22px] [&>span]:font-normal" />;
}
function Chips({ value, options, labels, onChange, label }: { value: string; options: string[]; labels?: Record<string, string>; onChange: (v: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`h-9 rounded-full px-3.5 text-13 leading-5 font-medium whitespace-nowrap ${value === o ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
        >
          {labels?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}

// «العميل»: بحث (إطار كحلي 1.5 + عدسة) والعميل المختار تحته (#F7FBE9 بإطار كحلي + ✓)
function CustomerPicker({ f, set, error }: { f: Form; set: (p: Partial<Form>) => void; error?: string }) {
  const q = f.customerQ.trim();
  const res = useQuery({ queryKey: ["customers", "list", { q }], queryFn: () => api.customers.list({ q }), enabled: q.length >= 2 && !f.customer });
  return (
    <F label="العميل" error={error}>
      <label className={`flex h-11 items-center gap-2 rounded-10 bg-white px-3 text-14 leading-[22px] text-ink ${error ? "border border-danger" : "border-[1.5px] border-ink"}`}>
        <input value={f.customerQ} onChange={(e) => set({ customerQ: e.target.value, customer: null })} aria-label="ابحث عن العميل بالاسم أو الجوال" placeholder="ابحث بالاسم أو الجوال" className="min-w-0 flex-1 bg-transparent outline-none placeholder:font-light placeholder:text-muted" />
        <Icon name="search" size={16} className="shrink-0" />
      </label>
      {f.customer ? (
        <div className="flex h-11 items-center gap-2 rounded-10 border-[1.5px] border-ink bg-lime-tint px-3 text-14 leading-[22px] font-medium text-ink">
          <span className="min-w-0 flex-1 truncate">{ltrRuns(`${f.customer.name} · ${maskPhone(f.customer.phone)} · ${f.customer.city}`)}</span>
          <Icon name="check" size={16} className="shrink-0" />
        </div>
      ) : q.length >= 2 ? (
        <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-10 border border-border p-1">
          {res.data?.items.slice(0, 6).map((c) => (
            <button key={c.id} type="button" onClick={() => set({ customer: { id: c.id, name: c.name, phone: c.phone, city: c.city }, customerQ: c.name.split(" ")[0] })} className="flex h-9 items-center rounded-8 px-2.5 text-start text-13 text-ink hover:bg-surface-1">
              {ltrRuns(`${c.name} · ${maskPhone(c.phone)} · ${c.city}`)}
            </button>
          ))}
          {res.data && !res.data.items.length ? <p className="px-2.5 py-2 text-13 text-muted">لا توجد نتائج</p> : null}
        </div>
      ) : null}
    </F>
  );
}
