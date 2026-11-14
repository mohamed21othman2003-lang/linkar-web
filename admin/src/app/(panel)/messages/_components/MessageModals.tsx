"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { KV } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import {
  NOMINEE_DEFAULT,
  NOMINEES,
  REPLY_TEMPLATES,
  STAFF,
  SUGGESTION_STATUSES,
  suggestionDraft,
  templateFor,
  transferDefault,
  type ContactMessage,
  type CorpRequest,
  type Suggestion,
} from "@/lib/api/messages";
import { ltrRuns } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { TEXTAREA } from "./bits";

// النوافذ CON5-19M (520 عرض): رد · MSG-0418 (3114:1806) / 0417 (1855) / 0416 (1904) · رد على مقترح SG-0033 (1953) / SG-0032 (1979)
// · تحويل لموظف MSG-0418 (1833) / 0417 (1882) / 0416 (1931) · ترشيح مراكز CORP-0012 (2005)
// الرسائل بعدها: CON5-T1901 «أُرسل الرد للمرسل» (2049) · T1902 «حُوّلت الرسالة للموظف» (2053) · T1903 «أُرسل طلب الشركة للمراكز المرشّحة» (2057)
export function MessageModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const ref = url.get("ref");
  const q = useQuery({ queryKey: ["messages", "one", ref], queryFn: () => api.messages.get(ref!), enabled: !!ref && !!modal?.startsWith("msg-") });
  const m = q.data;
  const close = () => url.replace({ modal: null, ref: null });
  if (!modal?.startsWith("msg-") || !m) return null;
  if (modal === "msg-reply" && m.tab === "contact") return <ReplyContact key={m.id} m={m} onClose={close} />;
  if (modal === "msg-reply" && m.tab === "suggestions") return <ReplySuggestion key={m.id} m={m} onClose={close} />;
  if (modal === "msg-transfer" && m.tab === "contact") return <Transfer key={m.id} m={m} onClose={close} />;
  if (modal === "msg-nominate" && m.tab === "corp") return <Nominate key={m.id} m={m} onClose={close} />;
  return null;
}

function useDone(onClose: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (r: { toast: string }) => {
    qc.invalidateQueries({ queryKey: ["messages"] });
    toast(r.toast);
    onClose();
  };
}

const replySchema = z.object({ template: z.string(), text: z.string().trim().min(1, "اكتب الرد") });

function Footer({ primary, loading, onCancel }: { primary: string; loading: boolean; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
      <Button type="submit" loading={loading}>
        {primary}
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        إلغاء
      </Button>
    </div>
  );
}

function ReplyContact({ m, onClose }: { m: ContactMessage; onClose: () => void }) {
  const done = useDone(onClose);
  const t = templateFor(m);
  const f = useForm({ resolver: zodResolver(replySchema), defaultValues: { template: t.value, text: t.text } });
  const mut = useMutation({ mutationFn: (v: { text: string }) => api.messages.reply(m.id, v), onSuccess: done, onError: (e) => isApiError(e) && e.fields?.text && f.setError("text", { message: e.fields.text }) });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`الرد على ${m.name}`} width={520}>
      <form onSubmit={f.handleSubmit((v) => mut.mutate(v))} className="flex flex-col gap-3.5">
        <KV k="إلى">
          <span>{ltrRuns(`${m.phone} · رسالة نصية + بريد`)}</span>
        </KV>
        <Field label="قالب الرد" hint="من «الإعدادات والقوائم ← قوالب الردود»">
          {(id) => (
            <Controller
              control={f.control}
              name="template"
              render={({ field }) => (
                <Select
                  id={id}
                  value={field.value}
                  options={REPLY_TEMPLATES}
                  onChange={(v) => {
                    field.onChange(v);
                    f.setValue("text", REPLY_TEMPLATES.find((x) => x.value === v)?.text ?? "", { shouldDirty: true });
                  }}
                />
              )}
            />
          )}
        </Field>
        <Field label="الرد" error={f.formState.errors.text?.message}>
          {(id) => <textarea id={id} {...f.register("text")} aria-invalid={!!f.formState.errors.text || undefined} className={`${TEXTAREA} ${f.formState.errors.text ? "border-danger" : "border-border"}`} />}
        </Field>
        <Footer primary="إرسال الرد" loading={mut.isPending} onCancel={onClose} />
      </form>
    </Modal>
  );
}

const sgSchema = z.object({ status: z.enum(["review", "answered"]), text: z.string().trim().min(1, "اكتب الرد") });

function ReplySuggestion({ m, onClose }: { m: Suggestion; onClose: () => void }) {
  const done = useDone(onClose);
  const f = useForm({ resolver: zodResolver(sgSchema), defaultValues: { status: "review" as const, text: suggestionDraft(m.id) } });
  const mut = useMutation({ mutationFn: (v: z.infer<typeof sgSchema>) => api.messages.reply(m.id, v), onSuccess: done });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`الرد على ${m.name}`} width={520}>
      <form onSubmit={f.handleSubmit((v) => mut.mutate(v))} className="flex flex-col gap-3.5">
        <KV k="إلى">حساب العميل · «الشكاوى والمقترحات»</KV>
        <Field label="الحالة">
          {(id) => <Controller control={f.control} name="status" render={({ field }) => <Select id={id} value={field.value} options={SUGGESTION_STATUSES} onChange={field.onChange} />} />}
        </Field>
        <Field label="الرد" error={f.formState.errors.text?.message}>
          {(id) => <textarea id={id} {...f.register("text")} aria-invalid={!!f.formState.errors.text || undefined} className={`${TEXTAREA} ${f.formState.errors.text ? "border-danger" : "border-border"}`} />}
        </Field>
        <Footer primary="إرسال الرد" loading={mut.isPending} onCancel={onClose} />
      </form>
    </Modal>
  );
}

const transferSchema = z.object({ to: z.string().min(1, "اختر الموظف"), note: z.string() });

function Transfer({ m, onClose }: { m: ContactMessage; onClose: () => void }) {
  const done = useDone(onClose);
  const f = useForm({ resolver: zodResolver(transferSchema), defaultValues: { to: transferDefault(m), note: "يرجى المتابعة والرد اليوم." } });
  const mut = useMutation({ mutationFn: (v: z.infer<typeof transferSchema>) => api.messages.transfer(m.id, v), onSuccess: done });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`تحويل الرسالة ${m.id}`} width={520}>
      <form onSubmit={f.handleSubmit((v) => mut.mutate(v))} className="flex flex-col gap-3.5">
        <Field label="إلى" error={f.formState.errors.to?.message}>
          {(id) => <Controller control={f.control} name="to" render={({ field }) => <Select id={id} value={field.value} options={STAFF} onChange={field.onChange} invalid={!!f.formState.errors.to} />} />}
        </Field>
        <Field label="ملاحظة">{(id) => <textarea id={id} {...f.register("note")} className={`${TEXTAREA} border-border`} />}</Field>
        <Footer primary="تحويل" loading={mut.isPending} onCancel={onClose} />
      </form>
    </Modal>
  );
}

const nominateSchema = z.object({ centers: z.array(z.string()).min(1, "اختر مركزاً واحداً على الأقل"), message: z.string() });

function Nominate({ m, onClose }: { m: CorpRequest; onClose: () => void }) {
  const done = useDone(onClose);
  const f = useForm({
    resolver: zodResolver(nominateSchema),
    defaultValues: { centers: NOMINEE_DEFAULT, message: `شركة بأسطول ${m.cars} سيارة تطلب غسيلاً شهرياً ونانو للسيارات الجديدة. يرجى التواصل مع المسؤول وتقديم عرضكم.` },
  });
  const mut = useMutation({ mutationFn: (v: z.infer<typeof nominateSchema>) => api.messages.nominate(m.id, v), onSuccess: done });
  const err = f.formState.errors.centers?.message;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`ترشيح مراكز ل${m.company}`} width={520}>
      <form onSubmit={f.handleSubmit((v) => mut.mutate(v))} className="flex flex-col gap-3.5">
        <p className="text-12 font-medium text-muted">{m.serviceHint}</p>
        <Controller
          control={f.control}
          name="centers"
          render={({ field }) => (
            <div role="group" aria-label="المراكز" className="flex flex-col gap-3.5">
              {NOMINEES.map((n) => {
                const on = field.value.includes(n.id);
                return (
                  <label key={n.id} className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" className="peer sr-only" checked={on} onChange={() => field.onChange(on ? field.value.filter((x) => x !== n.id) : [...field.value, n.id])} />
                    <span aria-hidden className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${on ? "bg-ink text-white" : "border border-border bg-white"}`}>
                      {on ? <Icon name="check" size={14} /> : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <bdi className="text-13 font-medium text-ink">{n.name}</bdi>
                      <span className="text-12 font-medium text-muted">{n.sub}</span>
                    </span>
                  </label>
                );
              })}
              {err ? (
                <p role="alert" className="text-12 text-danger">
                  {err}
                </p>
              ) : null}
            </div>
          )}
        />
        <Field label="رسالة للمراكز">{(id) => <textarea id={id} {...f.register("message")} className={`${TEXTAREA} border-border`} />}</Field>
        <Note>يصل الطلب للمراكز المختارة في بوابة المزوّد، وتتفق الشركة مع المركز مباشرة.</Note>
        <Footer primary="إرسال للمراكز" loading={mut.isPending} onCancel={onClose} />
      </form>
    </Modal>
  );
}

