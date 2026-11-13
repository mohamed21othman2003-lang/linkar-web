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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content dir="rtl" style={{ width }} onOpenAutoFocus={keepFocusQuiet} className="fixed inset-y-0 right-0 z-50 flex max-w-full flex-col bg-white shadow-drawer focus:outline-none">
          <div className="flex items-center justify-between gap-2.5 px-7 pt-7 pb-3.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <Dialog.Title className="text-18 font-bold text-ink">{title}</Dialog.Title>
              {subtitle ? <Dialog.Description className="text-13 font-light text-muted">{subtitle}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-12 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-7 pt-1 pb-6">{children}</div>
          {footer ? <div className="flex gap-2.5 border-t border-border px-7 pt-4 pb-7 [&>*]:flex-1">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
