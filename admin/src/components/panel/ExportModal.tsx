"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { ExportFormat } from "@/lib/api/exports";

// CON5-M00 · تصدير (3114-65259) — نافذة مشتركة لكل الشاشات اللي فيها «تصدير».
// 520 عرض · ثلاث خيارات (Excel / CSV / PDF): المختار خلفية #F7FBE9 بإطار كحلي 1.5 · الفترة · ملاحظة التسجيل في السجل
// ملاحظة: الإطار في Figma مرسوم بترتيب معكوس عن باقي النوافذ (زر الاختيار والأيقونة والزر الرئيسي على الشمال) — متطبّق زي ما هو.
const FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: "xlsx", label: "Excel (.xlsx)", hint: "للتحليل والمعالجة" },
  { value: "csv", label: "CSV", hint: "للأنظمة الأخرى" },
  { value: "pdf", label: "PDF", hint: "للمشاركة والطباعة" },
];

// قائمة «الشهر» (القسم 17)
const MONTHS = ["أكتوبر 2026", "سبتمبر 2026", "أغسطس 2026", "يوليو 2026", "يونيو 2026", "مايو 2026", "أبريل 2026", "مارس 2026", "فبراير 2026", "يناير 2026", "ديسمبر 2025", "نوفمبر 2025"].map((m) => ({ value: m, label: m }));

export function ExportModal({ open, onOpenChange, module, tab, filters }: { open: boolean; onOpenChange: (o: boolean) => void; module: string; tab?: string; filters?: Record<string, string> }) {
  const toast = useToast();
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [period, setPeriod] = useState(MONTHS[0].value);
  const m = useMutation({
    mutationFn: () => api.exports.request({ module, tab, format, period, filters }),
    onSuccess: () => {
      onOpenChange(false);
      toast("جاري التصدير", "جاري تجهيز الملف وسيصلك رابط التنزيل على بريدك خلال دقيقة");
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !m.isPending && onOpenChange(o)}
      title="تصدير البيانات"
      subtitle="يُصدَّر ما يظهر حسب الفلاتر والتبويب الحالي"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={m.isPending}>
            إلغاء
          </Button>
          <Button onClick={() => m.mutate()} loading={m.isPending} icon={<Icon name="download" size={16} />}>
            تصدير
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="صيغة الملف" className="flex flex-col gap-3.5">
        {FORMATS.map((f) => {
          const on = f.value === format;
          return (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setFormat(f.value)}
              className={`flex items-start gap-2.5 rounded-12 px-3 py-2.5 text-start ${on ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span dir="ltr" className={`text-end text-13 leading-5 text-ink ${on ? "font-semibold" : "font-medium"}`}>
                  {f.label}
                </span>
                <span className="text-12 leading-[18px] font-light text-muted">{f.hint}</span>
              </span>
              <span aria-hidden className={`mt-px size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
            </button>
          );
        })}
      </div>
      <Field label="الفترة">{(id) => <Select id={id} value={period} onChange={setPeriod} options={MONTHS} icon="calendar" className="h-[42px] [&>span]:text-14 [&>span]:font-normal" />}</Field>
      <div className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 font-light text-ink">
        <p className="min-w-0 flex-1">يُسجَّل التصدير في «سجل التدقيق» باسمك.</p>
        <Icon name="info" size={16} className="mt-[3px] shrink-0" />
      </div>
    </Modal>
  );
}
