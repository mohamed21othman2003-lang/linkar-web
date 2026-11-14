"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { keepFocusQuiet } from "./focus";

// الدرج الجانبي (القسم 3.5 · Figma CON5-23D 3114:24902): 600 عرض على يمين الشاشة · خلفية معتمة كحلي 45%
// الرأس: حشو 28·28·14 · عنوان 18 Bold + سطر 13 Light رمادي · زر إغلاق 40 r12 بإطار
// المحتوى: حشو 4·28·24 · مسافة 14 · الأزرار تحت بخط فاصل: حشو 16·28·28 · بعرض متساوي بفاصل 10
export function Drawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  width = 600,
  tight = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** رأس الإطارات الأحدث (3260:251028 · 3312:197286 · 3114:55444): سطر فرعي 13/20 والزر فوق — الأقدم (3114:24902): 13/22 والزر في النص */
  tight?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content dir="rtl" style={{ width }} onOpenAutoFocus={keepFocusQuiet} className="fixed inset-y-0 right-0 z-50 flex max-w-full flex-col bg-white shadow-drawer focus:outline-none">
          <div className={`flex justify-between gap-2.5 px-5 pt-5 pb-3.5 sm:px-7 sm:pt-7 ${tight ? "items-start" : "items-center"}`}>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Dialog.Title className="text-18 font-bold text-ink">{title}</Dialog.Title>
              {subtitle ? <Dialog.Description className={`text-13 font-light text-muted ${tight ? "leading-5" : ""}`}>{subtitle}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-12 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-1 pb-6 sm:px-7">{children}</div>
          {footer ? <div className="flex flex-wrap gap-2.5 border-t border-border [&>*]:min-w-[120px] px-5 pt-4 pb-5 sm:px-7 sm:pb-7 [&>*]:flex-1">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
