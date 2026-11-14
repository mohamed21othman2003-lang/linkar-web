"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { BANKS, NEXT_CYCLE, WALLETS, bankToastName, isSaudiIban, type AccountType } from "@/lib/api/bank";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import { iban as fmtIban, phone as fmtPhone } from "@/lib/format";
import { RadioCard } from "../offers/bits";

const SEL = "[&>span]:text-14! [&>span]:font-normal!";
const IN = "[&_input]:text-14! [&_input]:font-normal!";
const short = (p: ProviderProfile) => p.provider.short ?? p.provider.name;

/** ملاحظة النوافذ: تنبيه (#FDF3E1 بنص #9A5B00 · alert) أو معلومة (#E7F0F8 بنص كحلي · info) — r12 · حشو 12 · 13 Light */
function MNote({ tone, children, className }: { tone: "warning" | "info"; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[21px] font-light ${className ?? ""} ${tone === "warning" ? "bg-[#fdf3e1] text-warning" : "bg-info-tint text-ink"}`}>
      <p className="min-w-0 flex-1">{children}</p>
      {/* الأيقونة على الشمال زي Figma (3114-54387 · 3114-54442) */}
      <Icon name={tone === "warning" ? "alert" : "info"} size={16} className="mt-0.5 shrink-0 text-ink" />
    </div>
  );
}

// ───────────── CON5-07M · إضافة حساب استلام · جونسون (3114-54387) ─────────────
// 580 · حشو 24 · مسافة 14 · الرأس: العنوان 18 Bold + «جونسون · LK-JN-001 · تسجّله لينكار وتتحقق منه» 13 Light
// نوع الحساب: كارتين راديو (حساب بنكي · محفظة إلكترونية) ← البنك + يُستخدم لـ ← الآيبان ← اسم صاحب الحساب ← شهادة الآيبان ← ملاحظة تنبيه
// «إضافة الحساب» رئيسي (كحلي) يمين + «إلغاء» شمال بعرض متساوي.
const accountSchema = z
  .object({
    type: z.enum(["bank", "wallet"]),
    provider: z.string().min(1, "اختر البنك"),
    usage: z.string(),
    number: z.string(),
    holder: z.string().trim().min(2, "أدخل اسم صاحب الحساب كما في السجل التجاري"),
    certificate: z.object({ name: z.string(), sizeKb: z.number() }).nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "bank") {
      if (!isSaudiIban(v.number)) ctx.addIssue({ code: "custom", path: ["number"], message: "أدخل آيبان سعودي صحيح: SA ثم 22 رقماً" });
      if (!v.certificate) ctx.addIssue({ code: "custom", path: ["certificate"], message: "ارفع شهادة الآيبان من البنك" });
    } else if (!/^05\d{8}$/.test(v.number.replace(/\D/g, ""))) ctx.addIssue({ code: "custom", path: ["number"], message: "أدخل رقم جوال المحفظة: 05 ثم 8 أرقام" });
  });
type AccountValues = z.infer<typeof accountSchema>;

export function AddAccountModal({ profile, branches, close }: { profile: ProviderProfile; branches: ProviderBranch[]; close: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const pid = profile.provider.id;
  const approved = branches.filter((b) => b.status === "approved");
  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: "bank", provider: "", usage: "all", number: "", holder: profile.provider.company.legalName, certificate: null },
  });
  const { control, register, setValue, setError, formState } = form;
  const e = formState.errors;
  const v = useWatch({ control }) as AccountValues;
  const bank = v.type === "bank";
  const save = useMutation({
    mutationFn: (val: AccountValues) =>
      api.bank.add(pid, {
        type: val.type,
        provider: val.provider,
        number: val.number,
        holder: val.holder.trim(),
        branchId: val.usage === "all" ? null : val.usage,
        certificate: val.certificate ?? undefined,
      }),
    onSuccess: (_r, val) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      close();
      toast("أُضيف حساب استلام", `أُضيف حساب ${bankToastName(val.provider)} ل${short(profile)} بانتظار تحقق المالية · لا تُحوَّل عليه مستحقات قبل التحقق`);
    },
    onError: (err) => {
      if (isApiError(err) && err.fields) for (const [k, msg] of Object.entries(err.fields)) setError(k === "branchId" ? "usage" : (k as keyof AccountValues), { message: msg });
      else toast("تعذّر الحفظ", "تعذّر إضافة الحساب، حاول مرة أخرى");
    },
  });
  const tryClose = () => {
    if (save.isPending) return;
    if (formState.isDirty && !confirm("تجاهل التعديلات غير المحفوظة؟")) return;
    close();
  };
  const setType = (t: AccountType) => {
    if (t === v.type) return;
    setValue("type", t, { shouldDirty: true });
    setValue("provider", "", { shouldDirty: true });
    setValue("number", "", { shouldDirty: true });
    form.clearErrors();
  };
  const submit = form.handleSubmit(
    (val) => save.mutate(val),
    () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[role=dialog] [aria-invalid=true]")?.focus()),
  );

  return (
    <Modal
      open
      onOpenChange={(o) => !o && tryClose()}
      width={580}
      title="إضافة حساب استلام"
      subtitle={`${short(profile)} · ${profile.provider.code} · تسجّله لينكار وتتحقق منه`}
      footer={
        <>
          <Button className="h-11" loading={save.isPending} onClick={submit}>
            إضافة الحساب
          </Button>
          <Button variant="secondary" className="h-[46px]" onClick={tryClose} disabled={save.isPending}>
            إلغاء
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="نوع الحساب" className="flex flex-col gap-2.5 sm:flex-row">
        <RadioCard name="acc-type" on={bank} onClick={() => setType("bank")} title="حساب بنكي" sub="آيبان سعودي باسم المنشأة" />
        <RadioCard name="acc-type" on={!bank} onClick={() => setType("wallet")} title="محفظة إلكترونية" sub="‏STC Pay أعمال · urpay أعمال" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={bank ? "البنك" : "المحفظة"} error={e.provider?.message}>
          {(id) => (
            <Controller
              control={control}
              name="provider"
              render={({ field }) => (
                <Select
                  id={id}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  options={(bank ? BANKS : WALLETS).map((b) => ({ value: b, label: b }))}
                  placeholder={bank ? "اختر البنك" : "اختر المحفظة"}
                  invalid={!!e.provider}
                  className={SEL}
                  ariaLabel={bank ? "البنك" : "المحفظة"}
                />
              )}
            />
          )}
        </Field>
        <Field label="يُستخدم لـ" error={e.usage?.message}>
          {(id) => (
            <Controller
              control={control}
              name="usage"
              render={({ field }) => (
                <Select
                  id={id}
                  value={field.value}
                  onChange={field.onChange}
                  options={[{ value: "all", label: "كل الفروع · الحساب الافتراضي" }, ...approved.map((b) => ({ value: b.id, label: `فرع ${b.name}` }))]}
                  className={SEL}
                  ariaLabel="يُستخدم لـ"
                />
              )}
            />
          )}
        </Field>
      </div>
      <Field label={bank ? "رقم الآيبان (IBAN)" : "رقم جوال المحفظة"} error={e.number?.message}>
        {(id) => (
          <Controller
            control={control}
            name="number"
            render={({ field }) => (
              <TextInput
                id={id}
                dir="ltr"
                inputMode={bank ? "text" : "numeric"}
                autoComplete="off"
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) => field.onChange(bank ? fmtIban(ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24)) : fmtPhone(ev.target.value.replace(/\D/g, "").slice(0, 10)) || ev.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={bank ? "SA00 0000 0000 0000 0000 0000" : "05X XXX XXXX"}
                invalid={!!e.number}
                className={`num ${IN}`}
              />
            )}
          />
        )}
      </Field>
      <Field label="اسم صاحب الحساب" error={e.holder?.message}>
        {(id) => <TextInput id={id} {...register("holder")} invalid={!!e.holder} className={IN} />}
      </Field>
      {bank ? (
        <Field label="شهادة الآيبان من البنك" error={e.certificate?.message}>
          {(id) => (
            <label
              htmlFor={id}
              className={`flex h-11 cursor-pointer items-center gap-2 rounded-10 border bg-white px-3 text-14 leading-[22px] focus-within:border-[1.5px] focus-within:border-ink hover:bg-surface-1 ${e.certificate ? "border-danger" : "border-border"}`}
            >
              <input
                ref={fileRef}
                id={id}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                aria-invalid={!!e.certificate || undefined}
                className="sr-only"
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  if (!f) return;
                  if (f.size > 5 * 1024 * 1024) return setError("certificate", { message: "حجم الملف أكبر من 5 ميجابايت" });
                  setValue("certificate", { name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }, { shouldDirty: true, shouldValidate: true });
                }}
              />
              <span className={`min-w-0 flex-1 truncate ${v.certificate ? "text-ink" : "font-light text-muted"}`}>
                {v.certificate ? `‏${v.certificate.name}‏ · ${v.certificate.sizeKb} ك.ب · مرفوعة` : "ارفع الشهادة (PDF أو صورة · حتى 5 ميجابايت)"}
              </span>
              <Icon name="download" size={16} className="shrink-0 text-ink" />
            </label>
          )}
        </Field>
      ) : null}
      <MNote tone="warning">يجب أن يطابق اسم صاحب الحساب السجل التجاري. يُضاف الحساب «بانتظار التحقق»، ولا تُحوَّل عليه مستحقات قبل تحقق «المالية»، ويصل المزوّد إشعار.</MNote>
    </Modal>
  );
}

// ───────────── CON5-07M · إعدادات تسوية · جونسون (3114-54442) — مش مربوطة في Figma: ?tab=bank&modal=settlement ─────────────
// 600 · قاعدة التحويل ← طريقة التسوية (كارتين 100 · المختار #F7FBE9 بإطار كحلي) ← التسجيل الضريبي (للقراءة #F4F6F5) ← ملاحظة معلومة
// «حفظ الإعدادات» مميز يمين + «إلغاء» شمال.
export function SettlementModal({ profile, close }: { profile: ProviderProfile; close: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const pid = profile.provider.id;
  const q = useQuery({ queryKey: ["providers", "settlement", pid], queryFn: () => api.bank.settlement(pid) });
  const n = q.data?.branchCount ?? 0;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && close()}
      width={600}
      title={`إعدادات تسوية مستحقات ${short(profile)}`}
      subtitle={`‏${profile.provider.code}‏ · ${n === 1 ? "فرع واحد" : n === 2 ? "فرعان" : `${n} فروع`} · تحددها لينكار ويراها المزوّد في «المستحقات».`}
    >
      {q.isLoading || !q.data ? (
        <Skeleton className="h-[420px] rounded-12" />
      ) : (
        <SettlementForm
          key={pid}
          initial={q.data}
          onCancel={close}
          onSave={async (val) => {
            const r = await api.bank.saveSettlement(pid, val);
            qc.invalidateQueries({ queryKey: ["providers", "settlement", pid] });
            close();
            toast(`حُفظت إعدادات التسوية · ${short(profile)}`, `حُفظت إعدادات تسوية ${short(profile)} · تسري من دورة ${r.from}`);
          }}
        />
      )}
    </Modal>
  );
}

function SettlementForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: { rule: string; method: "grouped" | "per-branch"; vat: string; defaultAccount: string | null };
  onSave: (v: { rule: string; method: "grouped" | "per-branch" }) => Promise<void>;
  onCancel: () => void;
}) {
  const [rule, setRule] = useState(initial.rule);
  const [method, setMethod] = useState(initial.method);
  const [error, setErr] = useState("");
  const toast = useToast();
  const m = useMutation({ mutationFn: onSave, onError: () => toast("تعذّر الحفظ", "تعذّر حفظ إعدادات التسوية، حاول مرة أخرى") });
  const dirty = rule !== initial.rule || method !== initial.method;
  const cancel = () => {
    if (m.isPending) return;
    if (dirty && !confirm("تجاهل التعديلات غير المحفوظة؟")) return;
    onCancel();
  };
  const submit = () => {
    if (!rule.trim()) return setErr("أدخل قاعدة التحويل");
    m.mutate({ rule: rule.trim(), method });
  };
  const option = (k: "grouped" | "per-branch", title: string, sub: string) => {
    const on = method === k;
    return (
      <label className={`flex cursor-pointer items-start gap-2.5 rounded-12 border px-3.5 py-3 sm:h-[100px] ${on ? "border-ink bg-lime-tint" : "border-border bg-white hover:bg-surface-1"}`}>
        <input type="radio" name="settle-method" checked={on} onChange={() => setMethod(k)} className="peer sr-only" />
        <span aria-hidden className={`order-2 size-[18px] shrink-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
        <span className="order-1 flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-14 leading-[22px] font-semibold text-ink">{title}</span>
          <span className="text-12 leading-[18px] font-light text-muted">{sub}</span>
        </span>
      </label>
    );
  };
  return (
    <>
      <Field label="قاعدة التحويل" error={error}>
        {(id) => (
          <TextInput
            id={id}
            value={rule}
            onChange={(ev) => {
              setRule(ev.target.value);
              setErr("");
            }}
            invalid={!!error}
            className={IN}
          />
        )}
      </Field>
      <div role="radiogroup" aria-labelledby="settle-method" className="flex flex-col gap-3.5">
        <span id="settle-method" className="text-12 leading-5 font-medium text-muted">
          طريقة التسوية
        </span>
        {option("grouped", "مجمّعة لكل الفروع", `تحويل واحد على الحساب الافتراضي${initial.defaultAccount ? ` (${initial.defaultAccount})` : ""} لكل الفروع.`)}
        {option("per-branch", "لكل فرع على حدة", "تحويل مستقل لكل فرع على الحساب المخصص له، وكشف مستقل لكل فرع.")}
      </div>
      <Field label="التسجيل الضريبي">
        {(id) => <TextInput id={id} readOnly value={`مسجّل · ${initial.vat} · من بيانات المنشأة`} className={`bg-surface-1! ${IN}`} />}
      </Field>
      <MNote tone="info" className="sm:min-h-[100px]">يسري التغيير من الدورة القادمة ({NEXT_CYCLE}) ويصل المزوّد إشعار به. إن لم يبلغ المستحق الحد الأدنى يُرحَّل للدورة التالية. يُسجَّل التعديل في «سجل التدقيق».</MNote>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="accent" className="h-11" loading={m.isPending} onClick={submit}>
          حفظ الإعدادات
        </Button>
        <Button variant="secondary" className="h-[46px]" onClick={cancel} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </>
  );
}
