"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";

// CON5-08M · إضافة فرع · اختر مقدّم الخدمة (3114-59692) — ومن ملف جونسون (3114-59865)
// 560 · حشو 22 · مسافة 12 · بحث 44 بعدسة · خيارات 516×65 r12 حشو 10·12 مسافة 6: المختار #F7FBE9 بإطار كحلي والاسم 14 SemiBold
// «متابعة: بيانات الفرع» → /branches/new?provider=<id> (CON5-08N)
export function ChooseProviderModal({ close, initial }: { close: () => void; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [picked, setPicked] = useState<string | undefined>(initial);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);
  const list = useQuery({ queryKey: ["branches", "provider-options", debounced], queryFn: () => api.branches.providerOptions(debounced) });
  // من ملف مقدّم خدمة: البحث يبدأ باسمه
  const pre = useQuery({ queryKey: ["providers", "one", initial], queryFn: () => api.providers.get(initial!), enabled: !!initial });
  const [seeded, setSeeded] = useState(false);
  if (pre.data && !seeded) {
    setSeeded(true);
    setQ(pre.data.short ?? pre.data.name);
  }
  const items = list.data ?? [];
  const selected = picked && items.some((o) => o.id === picked) ? picked : items[0]?.id;
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={560} className="gap-3! p-[22px]!" title="إضافة فرع" subtitle="الخطوة 1 من 2 · لأي مقدّم خدمة هذا الفرع؟">
      <Field label="ابحث باسم المنشأة أو الكود">
        {(id) => (
          <TextInput
            id={id}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم المنشأة أو الكود"
            className="[&_input]:text-14! [&_input]:font-normal! flex-row-reverse"
            icon={<Icon name="search" size={16} className="text-ink" />}
          />
        )}
      </Field>
      <div role="radiogroup" aria-label="مقدّمو الخدمة" className="flex max-h-[300px] flex-col gap-3 overflow-y-auto">
        {list.isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-12" />)
        ) : list.isError ? (
          <div className="flex flex-col items-center gap-2 py-6 text-13 text-muted">
            تعذّر تحميل البيانات
            <Button variant="secondary" size="S" onClick={() => list.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : !items.length ? (
          <div className="flex flex-col items-center gap-2 py-6 text-13 text-muted">
            لا توجد نتائج
            <Button variant="secondary" size="S" onClick={() => setQ("")}>
              مسح البحث
            </Button>
          </div>
        ) : (
          items.map((o) => {
            const on = o.id === selected;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(o.id)}
                className={`flex items-start gap-2.5 rounded-12 px-3 text-start ${on ? "border-[1.5px] border-ink bg-lime-tint py-2" : "border border-border bg-white py-[9px] hover:bg-surface-1"}`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className={`text-14 leading-[22px] text-ink ${on ? "font-semibold" : "font-medium"}`}>
                  {o.name} · <bdi>{o.code}</bdi>
                </span>
                <span className="text-12 leading-[18px] font-light text-muted">{o.line}</span>
                </span>
                <span aria-hidden className={`mt-0.5 size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink bg-white" : "border-[1.5px] border-border-strong"}`} />
              </button>
            );
          })
        )}
      </div>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px] px-[18px]" onClick={close}>
          إلغاء
        </Button>
        <Button className="h-11 px-[18px]" disabled={!selected} onClick={() => router.push(`/branches/new?provider=${selected}`)}>
          متابعة: بيانات الفرع
          <Icon name="chevron-left" size={16} />
        </Button>
      </div>
    </Modal>
  );
}
