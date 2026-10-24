"use client";

import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { ContactBranchPopup, type BranchView } from "@/components/account/booking-modals";

// W2-36s «تواصل مع الفرع» ← P-07 تواصل مع الفرع (مكوّن P-07 من صفحات الحساب)
export function ContactBranchButton({ locale, branch, className, children }: { locale: Locale; branch: BranchView; className: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ContactBranchPopup locale={locale} open={open} onClose={() => setOpen(false)} b={branch} />
    </>
  );
}
