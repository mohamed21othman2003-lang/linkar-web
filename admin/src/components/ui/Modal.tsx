"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

// نافذة (Figma CON5-24M 3114:28715): عرض 460 · r20 · حشو 24 · مسافة 14 · عنوان 18/30 Bold + زر إغلاق 36 r10 بإطار · الأزرار تحت بعرض متساوي بفاصل 10
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60" />
        <Dialog.Content
          dir="rtl"
          style={{ width }}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 overflow-y-auto rounded-[20px] bg-white p-6 shadow-card focus:outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <Dialog.Title className="text-18 font-bold text-ink">{title}</Dialog.Title>
            <Dialog.Close className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          {description ? <Dialog.Description className="text-13 font-light text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          {children}
          {footer ? <div className="flex gap-2.5 [&>*]:flex-1">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ملاحظة زرقاء جوه النوافذ (info-tint)
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 font-light text-info">
      <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink" />
      <span>{children}</span>
    </p>
  );
}
