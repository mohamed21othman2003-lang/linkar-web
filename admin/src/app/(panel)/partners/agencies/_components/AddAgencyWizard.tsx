"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CITY_OPTIONS, type Arrangement } from "@/lib/api/agencies";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { APill, DKV, DTile } from "./bits";

// CON5-09W1 · إضافة وكالة · الشركة (3114:3625) → W2 · الترتيب المالي (3114:3687) → W3 · المراجعة (3114:3739) → T0908 (3114:3804)
// نافذة 720 · r20 · حشو 24 · مسافة 16 — ?modal=ag-add&step=1|2|3 (زر الرجوع يرجّع خطوة)
const STEPS = ["الشركة والمفوّضون", "الترتيب المالي", "المستندات والمراجعة"];
const ALERTS = ["50%", "60%", "70%", "80%", "90%"].map((v) => ({ value: v, label: v }));
const CITIES = CITY_OPTIONS.filter((c) => c !== "الكل").map((v) => ({ value: v, label: v }));

export function AddAgencyWizard() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  const step = Math.min(3, Math.max(1, Number(url.get("step") ?? 1) || 1));
  const [f, setF] = useState({
    name: "معارض الأصيل للسيارات",
    city: "جدة",
    cr: "4030719920",
    vat: "310662091200003",
    contact: "هاني الأصيل",
    phone: "055 771 0042",
    email: "hani@alaseel.sa",
    arrangement: "credit" as Arrangement,
    limit: "80,000",
    alert: "70%",
    alertAmount: "10,000",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const close = () => url.replace({ modal: null, step: null });
  const go = (s: number) => url.push({ step: s === 1 ? null : String(s) });
  const n = (s: string) => Number(s.replace(/[^\d]/g, ""));
  const fmt = (s: string) => (s.replace(/[^\d]/g, "") ? num(n(s)) : "");

  const create = useMutation({
    mutationFn: () =>
      api.agencies.create({
        name: f.name.trim(),
        city: f.city,
        branches: 1,
        contact: f.contact.trim(),
        phone: f.phone,
        arrangement: f.arrangement,
        limit: n(f.limit),
        alertAt: n(f.alertAmount),
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      url.replace({ modal: null, step: null });
      toast("أُضيفت الوكالة", r.toast);
    },
  });

  const next1 = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "اكتب اسم الشركة";
    if (!/^\d{10}$/.test(f.cr)) e.cr = "السجل التجاري 10 أرقام";
    if (!/^3\d{13}3$/.test(f.vat)) e.vat = "الرقم الضريبي 15 رقماً يبدأ وينتهي بـ3";
    if (!f.contact.trim()) e.contact = "اكتب اسم المفوّض";
    if (!/^05\d{8}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "رقم جوال سعودي يبدأ بـ05";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "بريد غير صحيح";
    setErrors(e);
    if (!Object.keys(e).length) go(2);
  };
  const next2 = () => {
    const e: Record<string, string> = {};
    if (f.arrangement === "credit" && !n(f.limit)) e.limit = "أدخل الحد الائتماني";
    if (f.arrangement === "prepaid" && !n(f.alertAmount)) e.alertAmount = "أدخل حد التنبيه";
    setErrors(e);
    if (!Object.keys(e).length) go(3);
  };
  const nextId = "DL-022";

  return (
    <Modal open onOpenChange={(v) => !v && close()} width={720} title="إضافة وكالة" className="gap-4!">
      <Stepper step={step} />
      {step === 1 ? (
        <>
          <Two>
            <Field label="اسم الشركة" error={errors.name}>{(id) => <TextInput id={id} value={f.name} invalid={!!errors.name} onChange={(e) => set("name")(e.target.value)} />}</Field>
            <Field label="المدينة">{(id) => <Select id={id} value={f.city} onChange={set("city")} options={CITIES} />}</Field>
          </Two>
          <Two>
            <Field label="السجل التجاري" error={errors.cr}>{(id) => <TextInput id={id} value={f.cr} ltr inputMode="numeric" invalid={!!errors.cr} onChange={(e) => set("cr")(e.target.value.replace(/\D/g, "").slice(0, 10))} />}</Field>
            <Field label="الرقم الضريبي" error={errors.vat}>{(id) => <TextInput id={id} value={f.vat} ltr inputMode="numeric" invalid={!!errors.vat} onChange={(e) => set("vat")(e.target.value.replace(/\D/g, "").slice(0, 15))} />}</Field>
          </Two>
          <h3 className="text-16 leading-[26px] font-medium text-ink">المفوّض الرئيسي</h3>
          <Two>
            <Field label="الاسم" error={errors.contact}>{(id) => <TextInput id={id} value={f.contact} invalid={!!errors.contact} onChange={(e) => set("contact")(e.target.value)} />}</Field>
            <Field label="الجوال" error={errors.phone}>{(id) => <TextInput id={id} value={f.phone} ltr inputMode="tel" invalid={!!errors.phone} onChange={(e) => set("phone")(e.target.value)} />}</Field>
          </Two>
          <Field label="البريد" error={errors.email} hint="يصله رابط بوابة الوكالة لإضافة الفروع والموظفين">
            {(id) => <TextInput id={id} value={f.email} ltr type="email" invalid={!!errors.email} onChange={(e) => set("email")(e.target.value)} />}
          </Field>
          <Foot primary="التالي" onPrimary={next1} secondary="إلغاء" onSecondary={close} />
        </>
      ) : step === 2 ? (
        <>
          <div role="radiogroup" aria-label="الترتيب المالي" className="flex flex-col gap-4">
            <Radio on={f.arrangement === "credit"} onClick={() => set("arrangement")("credit")} title="ائتمان شهري" sub="كشف حساب أول كل شهر ومهلة سداد 30 يوماً" />
            <Radio on={f.arrangement === "prepaid"} onClick={() => set("arrangement")("prepaid")} title="رصيد مسبق" sub="تُخصم المشتريات من الرصيد عند الشراء" />
          </div>
          {f.arrangement === "credit" ? (
            <Two>
              <Field label="الحد الائتماني (ر.س)" error={errors.limit}>{(id) => <TextInput id={id} value={f.limit} inputMode="numeric" invalid={!!errors.limit} onChange={(e) => set("limit")(fmt(e.target.value))} />}</Field>
              <Field label="حد التنبيه">{(id) => <Select id={id} value={f.alert} onChange={set("alert")} options={ALERTS} />}</Field>
            </Two>
          ) : (
            <Two>
              <Field label="حد التنبيه (ر.س)" error={errors.alertAmount}>{(id) => <TextInput id={id} value={f.alertAmount} inputMode="numeric" invalid={!!errors.alertAmount} onChange={(e) => set("alertAmount")(fmt(e.target.value))} />}</Field>
              <span />
            </Two>
          )}
          <Foot primary="التالي" onPrimary={next2} secondary="السابق" onSecondary={() => go(1)} />
        </>
      ) : (
        <>
          <Doc title="السجل التجاري" file={`CR-${f.cr}.pdf`} />
          <Doc title="شهادة التسجيل الضريبي" file={`VAT-${f.vat}.pdf`} />
          <Doc title="خطاب تفويض المفوّضين" file="Authorization.pdf" />
          <DTile title="الملخص">
            <DKV k="الوكالة">
              {f.name} · {f.city}
            </DKV>
            <DKV k="الترتيب">{f.arrangement === "credit" ? `ائتمان شهري · حد ${f.limit} ر.س` : `رصيد مسبق · تنبيه عند ${f.alertAmount} ر.س`}</DKV>
          </DTile>
          <div className="flex items-start gap-2 rounded-12 bg-success-tint p-3 text-13 leading-[22px] font-light text-success">
            <Icon name="check" size={16} className="mt-[3px] shrink-0 text-ink" />
            <p className="min-w-0 flex-1">تتفعّل الوكالة برقم {nextId} ويصل للمفوّض رابط البوابة.</p>
          </div>
          <Foot primary="إضافة وتفعيل" onPrimary={() => create.mutate()} loading={create.isPending} secondary="السابق" onSecondary={() => go(2)} />
        </>
      )}
    </Modal>
  );
}

const Two = ({ children }: { children: ReactNode }) => <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;

function Foot({ primary, onPrimary, secondary, onSecondary, loading }: { primary: string; onPrimary: () => void; secondary: string; onSecondary: () => void; loading?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
      <Button loading={loading} onClick={onPrimary}>
        {primary}
      </Button>
      <Button variant="secondary" className="h-[50px]!" onClick={onSecondary}>
        {secondary}
      </Button>
    </div>
  );
}

/** المؤشّر: دوائر 22 (الحالية خضراء · المنتهية كحلي بعلامة صح · القادمة بيضاء بإطار) + خط 18 بينها · 12 Medium */
function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label="خطوات الإضافة">
      {STEPS.map((s, i) => {
        const k = i + 1;
        const done = k < step;
        const cur = k === step;
        return (
          <Fragment key={s}>
            {i > 0 ? <li aria-hidden className="h-px w-[18px] bg-border" /> : null}
            <li className="flex items-center gap-1.5" aria-current={cur ? "step" : undefined}>
              <span className={`num flex size-[22px] items-center justify-center rounded-full text-12 font-medium ${done ? "bg-ink text-white" : cur ? "bg-lime text-ink" : "border border-border bg-white text-ink"}`}>
                {done ? <Icon name="check" size={14} /> : k}
              </span>
              <span className={`text-12 leading-5 font-medium ${k <= step ? "text-ink" : "text-muted"}`}>{s}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

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

function Doc({ title, file }: { title: string; file: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-10 bg-surface-1 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-white text-ink">
        <Icon name="file" size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-13 leading-[22px] font-medium text-ink">{title}</span>
        <bdi className="text-12 leading-5 font-medium text-muted">{file}</bdi>
      </span>
      <APill tone="success">مرفوع</APill>
    </div>
  );
}
