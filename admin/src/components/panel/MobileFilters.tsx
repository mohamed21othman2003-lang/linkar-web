"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { keepFocusQuiet } from "@/components/ui/focus";

/** media query من غير setState في effect — على السيرفر بيرجع `server` */
export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

// الفلاتر على الموبايل (أقل من md): زر «تصفية» بعدد الفلاتر المفعّلة بيفتح لوحة من تحت فيها نفس القوائم بعرض كامل
// بدل 4–5 صفوف فلاتر قبل أول نتيجة. من md وأكبر: القوائم زي ما هي في السطر.
export function MobileFilters({ children, active = 0, onClear }: { children: ReactNode; active?: number; onClear?: () => void }) {
  const narrow = useMedia("(max-width: 767.98px)");
  const [open, setOpen] = useState(false);
  if (!narrow) return <>{children}</>;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="flex h-11 items-center gap-1.5 rounded-10 border border-border bg-white px-3 text-13 font-medium text-ink hover:bg-surface-1">
        <Icon name="filter" size={16} />
        تصفية
        {active ? <span className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-12 text-lime">{active}</span> : null}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content dir="rtl" onOpenAutoFocus={keepFocusQuiet} className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[20px] bg-white shadow-card focus:outline-none">
          <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
            <Dialog.Title className="text-18 font-bold text-ink">تصفية</Dialog.Title>
            <Dialog.Description className="sr-only">اختر الفلاتر</Dialog.Description>
            <Dialog.Close className="flex size-11 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          {/* القوائم بعرض كامل جوه اللوحة */}
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4 [&>*]:w-full! [&>button]:h-11! [&>button]:justify-between">{children}</div>
          <div className="flex gap-2.5 border-t border-border px-5 pt-3 pb-5 [&>*]:flex-1">
            <Button size="M" onClick={() => setOpen(false)}>
              عرض النتائج
            </Button>
            {onClear && active ? (
              <Button variant="secondary" size="M" onClick={onClear}>
                مسح الفلاتر
              </Button>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
