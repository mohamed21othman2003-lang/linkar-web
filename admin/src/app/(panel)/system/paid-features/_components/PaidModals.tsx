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
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { PAYMENTS, PLAN_FEATURES, PLANS, TRIALS, type Subscription } from "@/lib/api/paid-features";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { ScrollX } from "@/components/ui/ScrollX";

// النوافذ CON5-22M: تفعيل الميزة · جونسون (3114:64901 · 560) · إعدادات الخطة (3114:64951 · 600) · إدارة الاشتراك · لومار (3114:65006) / XPEL (3114:65031 · 520)
// الرسائل CON5-22T: فُعّلت الميزة (64935) · حُفظت الخطة (64939) · مُددت التجربة (64943) · حُفظ الاشتراك (64947)
export function PaidModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const provider = url.get("provider");
  const close = () => url.replace({ modal: null, provider: null });
  if (modal === "paid-plan") return <PlanSettings onClose={close} />;
  if ((modal === "paid-activate" || modal === "paid-manage") && provider) return <ProviderModal kind={modal} id={provider} onClose={close} />;
  return null;
}

const SEL = "h-[42px]! text-14! [&>span]:font-normal!";
const opts = (l: readonly string[]) => l.map((v) => ({ value: v, label: v }));

function useDone(onClose: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (r: { toast: string }) => {
    qc.invalidateQueries({ queryKey: ["paid-features"] });
    toast(r.toast);
    onClose();
  };
}

function ProviderModal({ kind, id, onClose }: { kind: "paid-activate" | "paid-manage"; id: string; onClose: () => void }) {
  const q = useQuery({ queryKey: ["paid-features", "one", id], queryFn: () => api.paidFeatures.get(id) });
  if (!q.data) return null;
  return kind === "paid-activate" ? <Activate s={q.data} onClose={onClose} /> : <Manage s={q.data} onClose={onClose} />;
}

const activateSchema = z.object({ plan: z.string().min(1), start: z.string().min(1), payment: z.string().min(1) });

function Activate({ s, onClose }: { s: Subscription; onClose: () => void }) {
  const done = useDone(onClose);
  const payments = [`خصم من مستحقات ${s.name} الشهرية · أول خصم 1 ديسمبر 2026`, ...PAYMENTS.slice(1)];
  const f = useForm({ resolver: zodResolver(activateSchema), defaultValues: { plan: PLANS[0], start: "1 نوفمبر 2026", payment: payments[0] } });
  const activate = useMutation({ mutationFn: (v: z.infer<typeof activateSchema>) => api.paidFeatures.activate(s.providerId, v), onSuccess: done });
  const extend = useMutation({ mutationFn: () => api.paidFeatures.extendTrial(s.providerId), onSuccess: done });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="تفعيل «ظهورك على لينكار»" subtitle={`${s.name} · ${s.code} · التجربة حتى ${s.end}`} width={560}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Field label="الخطة">{(fid) => <Controller control={f.control} name="plan" render={({ field }) => <Select id={fid} value={field.value} options={opts(PLANS)} onChange={field.onChange} className={SEL} />} />}</Field>
        <Field label="تبدأ">
          {(fid) => <Controller control={f.control} name="start" render={({ field }) => <Select id={fid} icon="calendar" value={field.value} options={opts(["1 نوفمبر 2026", "1 ديسمبر 2026"])} onChange={field.onChange} className={SEL} />} />}
        </Field>
      </div>
      <Field label="الدفع">{(fid) => <Controller control={f.control} name="payment" render={({ field }) => <Select id={fid} value={field.value} options={opts(payments)} onChange={field.onChange} className={SEL} />} />}</Field>
      {/* ملاحظة الإطار: خلفية زرقاء بنص كحلي والأيقونة على الشمال */}
      <div className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 font-light text-ink">
        <p className="min-w-0 flex-1">يبقى القسم ظاهراً ل{s.name} دون انقطاع بعد انتهاء التجربة، ويظهر الاشتراك في «الإعدادات» لديهم.</p>
        <Icon name="info" size={16} className="mt-[3px] shrink-0" />
      </div>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="accent" className="h-11!" loading={activate.isPending} disabled={extend.isPending} onClick={f.handleSubmit((v) => activate.mutate(v))}>
          تفعيل الاشتراك
        </Button>
        <Button variant="secondary" className="h-[46px]!" loading={extend.isPending} disabled={activate.isPending} onClick={() => extend.mutate()}>
          تمديد التجربة 14 يوماً
        </Button>
      </div>
    </Modal>
  );
}

function KVRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-between gap-2 text-13">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

function Manage({ s, onClose }: { s: Subscription; onClose: () => void }) {
  const done = useDone(onClose);
  const save = useMutation({ mutationFn: () => api.paidFeatures.saveSubscription(s.providerId), onSuccess: done });
  const stop = useMutation({ mutationFn: () => api.paidFeatures.stopSubscription(s.providerId), onSuccess: done });
  const short = s.name.replace(" السعودية", "");
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`إدارة اشتراك ${short}`} subtitle={`${s.code} · مشترك منذ ${s.since ?? s.start}`} width={520}>
      <div className="flex flex-col gap-3.5">
        <KVRow k="الحالة">مشترك</KVRow>
        <KVRow k="الدفعة">{s.renewal ?? "—"}</KVRow>
        <KVRow k="طريقة الدفع">خصم من المستحقات الشهرية</KVRow>
      </div>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button
          variant="danger"
          className="h-11!"
          loading={stop.isPending}
          disabled={save.isPending}
          onClick={() => window.confirm(`إيقاف اشتراك ${short}؟ يتوقف ظهور القسم لدى المزوّد من الدورة القادمة.`) && stop.mutate()}
        >
          إيقاف الاشتراك
        </Button>
        <Button className="h-11!" loading={save.isPending} disabled={stop.isPending} onClick={() => save.mutate()}>
          حفظ
          <Icon name="check" size={16} />
        </Button>
      </div>
    </Modal>
  );
}

const planSchema = z.object({
  price: z.string().refine((v) => Number(v.replace(/[^\d.]/g, "")) > 0, "اكتب السعر الشهري"),
  trial: z.string().min(1),
  payment: z.string().min(1),
});

/** أعمدة «ما تشمله الخطة» كما في Figma (ترتيب LTR): بعد الاشتراك 110 · في التجربة 110 · ما تشمله الخطة (الباقي، من اليمين) */
const GRID = "grid grid-cols-[110px_110px_minmax(0,1fr)] items-center px-2.5 py-2 [&>span]:text-left [&>span:last-child]:text-right [&>span]:[direction:rtl]";

function PlanSettings({ onClose }: { onClose: () => void }) {
  const q = useQuery({ queryKey: ["paid-features", "plan"], queryFn: () => api.paidFeatures.plan() });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="إعدادات خطة «ظهورك على لينكار»" subtitle="ميزة تحليلات مدفوعة لمقدّمي الخدمة" width={600}>
      {q.data ? <PlanForm initial={q.data} onClose={onClose} /> : <Skeleton className="h-[480px] w-full" />}
    </Modal>
  );
}

function PlanForm({ initial, onClose }: { initial: { price: number; trial: string; payment: string }; onClose: () => void }) {
  const done = useDone(onClose);
  const [trialOpts] = useState(() => [`${initial.trial} لكل منشأة`, ...TRIALS.filter((t) => t !== initial.trial).map((t) => `${t} لكل منشأة`)]);
  const f = useForm({ resolver: zodResolver(planSchema), defaultValues: { price: `${num(initial.price)} ر.س`, trial: trialOpts[0], payment: initial.payment } });
  const mut = useMutation({
    mutationFn: (v: z.infer<typeof planSchema>) => api.paidFeatures.savePlan({ price: Number(v.price.replace(/[^\d.]/g, "")), trial: v.trial.replace(" لكل منشأة", ""), payment: v.payment }),
    onSuccess: done,
    onError: (e) => isApiError(e) && e.fields?.price && f.setError("price", { message: e.fields.price }),
  });
  const err = f.formState.errors.price?.message;
  return (
    <form onSubmit={f.handleSubmit((v) => mut.mutate(v))} className="flex flex-col gap-3.5">
      <Field label="السعر الشهري · شامل الضريبة" error={err}>
        {(fid) => <TextInput id={fid} inputMode="decimal" invalid={!!err} className="h-[42px]! [&_input]:text-14! [&_input]:font-normal!" {...f.register("price")} />}
      </Field>
      <Field label="التجربة المجانية">{(fid) => <Controller control={f.control} name="trial" render={({ field }) => <Select id={fid} value={field.value} options={opts(trialOpts)} onChange={field.onChange} className={SEL} />} />}</Field>
      <ScrollX className="rounded-10 border border-border">
        <div className="min-w-[420px]">
          <div dir="ltr" className={`${GRID} bg-surface-1 text-12 font-medium text-muted`}>
            <span>بعد الاشتراك</span>
            <span>في التجربة</span>
            <span>ما تشمله الخطة</span>
          </div>
          {PLAN_FEATURES.map(([label, trial, paid]) => (
            <div key={label} dir="ltr" className={`${GRID} text-13 leading-5 text-ink`}>
              <span>{paid ? "✓" : "—"}</span>
              <span>{trial ? "✓" : "—"}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </ScrollX>
      <Field label="الدفع">{(fid) => <Controller control={f.control} name="payment" render={({ field }) => <Select id={fid} value={field.value} options={opts(PAYMENTS)} onChange={field.onChange} className={SEL} />} />}</Field>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" className="h-11!" loading={mut.isPending}>
          حفظ
          <Icon name="check" size={16} />
        </Button>
      </div>
    </form>
  );
}
