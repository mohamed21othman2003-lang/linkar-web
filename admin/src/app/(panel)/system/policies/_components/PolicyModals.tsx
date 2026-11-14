"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { APPEARS_IN } from "@/lib/api/policies";
import { useUrlState } from "@/lib/use-url-state";

// CON5-21M · سجل النسخ (3114:64520) و CON5-21M · سياسة جديدة (3114:64561) — 600 عرض
export function PolicyModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const close = () => url.replace({ modal: null });
  if (modal === "policy-history" && url.get("policy"))
    return <History id={url.get("policy")!} onClose={close} />;
  if (modal === "policy-new") return <NewPolicy onClose={close} />;
  return null;
}

/** أعمدة جدول النسخ كما في Figma (ترتيب LTR): التغيير 170 · التاريخ 120 · نشرها 110 · النسخة 130 — النص من الشمال إلا «النسخة» · صفوف 36 بحشو 8·10 */
const GRID =
  "grid grid-cols-[minmax(170px,1fr)_120px_110px_130px] items-center px-2.5 py-2 [&>span]:text-left [&>span:last-child]:text-right [&>span]:[direction:rtl]";

function History({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const url = useUrlState();
  const q = useQuery({
    queryKey: ["policies", "one", id],
    queryFn: () => api.policies.get(id),
  });
  const p = q.data;
  const prev = p
    ? p.history.find((h) => h.version === p.version - 1)
    : undefined;
  const mut = useMutation({
    mutationFn: (v: number) => api.policies.restore(id, v),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      toast(r.toast);
      url.replace({ modal: null, policy: null });
    },
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="سجل النسخ"
      subtitle="كل نشر يُنشئ نسخة جديدة ويُحفظ من نشرها ومتى"
      width={600}
    >
      <div className="overflow-x-auto rounded-10 border border-border">
        <div className="min-w-[530px]">
          <div dir="ltr"
            className={`${GRID} bg-surface-1 text-12 font-medium text-muted`}
          >
            <span>التغيير</span>
            <span>التاريخ</span>
            <span>نشرها</span>
            <span>النسخة</span>
          </div>
          {q.isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="m-2.5 h-4 w-3/4" />
              ))
            : p?.history.map((h) => (
                <div key={h.version} dir="ltr" className={`${GRID} text-13 leading-5 text-ink`}>
                  <span>{h.change}</span>
                  <span>{h.date}</span>
                  <span>{h.by}</span>
                  <span className="font-medium">
                    {h.version === p.version
                      ? `${h.version} · الحالية`
                      : h.version}
                  </span>
                </div>
              ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          إغلاق
        </Button>
        {prev ? (
          <Button
            variant="secondary"
            className="h-[46px]!"
            loading={mut.isPending}
            onClick={() => mut.mutate(prev.version)}
          >
            استعادة النسخة {prev.version}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}

const schema = z.object({
  name: z.string().trim().min(1, "اكتب اسم السياسة"),
  appearsIn: z.string().min(1, "اختر مكان الظهور"),
  text: z.string().trim().min(1, "اكتب نص السياسة"),
});
type Values = z.infer<typeof schema>;

function NewPolicy({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const f = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", appearsIn: APPEARS_IN[0], text: "" },
  });
  const mut = useMutation({
    mutationFn: (v: Values & { publish: boolean }) => api.policies.create(v),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      toast(r.toast);
      onClose();
    },
    onError: (e) => {
      if (isApiError(e) && e.fields)
        for (const [k, m] of Object.entries(e.fields))
          f.setError(k as keyof Values, { message: m });
    },
  });
  const tryClose = () => {
    if (
      f.formState.isDirty &&
      !window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة؟")
    )
      return;
    onClose();
  };
  const submit = (publish: boolean) =>
    f.handleSubmit((v) => mut.mutate({ ...v, publish }))();
  const err = f.formState.errors;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && tryClose()}
      title="سياسة جديدة"
      subtitle="تُنشأ كمسودة وتُنشر بعد المراجعة"
      width={600}
    >
      <Field label="اسم السياسة" error={err.name?.message}>
        {(id) => (
          <TextInput
            id={id}
            placeholder="سياسة الخصوصية للمزوّدين"
            invalid={!!err.name}
            className="h-[42px]! [&_input]:text-14! [&_input]:font-normal!"
            {...f.register("name")}
          />
        )}
      </Field>
      <Field label="تظهر في" error={err.appearsIn?.message}>
        {(id) => (
          <Controller
            control={f.control}
            name="appearsIn"
            render={({ field }) => (
              <Select
                id={id}
                value={field.value}
                options={APPEARS_IN.map((v) => ({ value: v, label: v }))}
                onChange={field.onChange}
                className="h-[42px]! text-14! [&>span]:font-normal!"
              />
            )}
          />
        )}
      </Field>
      <Field label="النص" error={err.text?.message}>
        {(id) => (
          <textarea
            id={id}
            placeholder="• تحفظ لينكار بيانات المنشأة والفروع لأغراض التشغيل والاعتماد فقط…"
            {...f.register("text")}
            aria-invalid={!!err.text || undefined}
            className={`h-[120px] w-full resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none placeholder:text-muted focus:border-[1.5px] focus:border-ink ${err.text ? "border-danger" : "border-border"}`}
          />
        )}
      </Field>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button
          variant="secondary"
          className="h-[46px]!"
          disabled={mut.isPending}
          onClick={() => submit(false)}
        >
          حفظ كمسودة
        </Button>
        <Button
          className="h-11!"
          loading={mut.isPending}
          onClick={() => submit(true)}
        >
          حفظ ونشر
          <Icon name="check" size={16} />
        </Button>
      </div>
    </Modal>
  );
}
