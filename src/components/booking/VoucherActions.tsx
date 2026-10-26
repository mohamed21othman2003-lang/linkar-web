"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { Icon } from "@/components/icons/Icon";
import { ShareVoucherPopup } from "@/components/account/booking-modals";
import { Toast } from "./Modal";

// أزرار القسيمة في W2-36: الاتجاهات · مشاركة (نسخة العميل شالت أزرار Apple Wallet / محفظة Google)
// «مشاركة» ← P-08 مشاركة القسيمة (OVERLAY · DISSOLVE 200ms) — مكوّن P-08 من صفحات الحساب
export function VoucherActions({ locale, mapsUrl, shareLink }: { locale: Locale; mapsUrl: string; shareLink: string }) {
  const t = getBookingDict(locale);
  const [toast, setToast] = useState<string | null>(null);
  const done = useCallback(() => setToast(null), []);
  const [sharing, setSharing] = useState(false);
  return (
    <>
      <div className="grid grid-cols-2 gap-2 px-[22px] pb-[22px]">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex h-[46px] items-center justify-center gap-1.5 rounded-[14px] bg-cool-gray/30 text-body-s hover:bg-cool-gray/50">
          <Icon name="navigation" size={20} />
          {t.directions}
        </a>
        <button type="button" onClick={() => setSharing(true)} className="flex h-[46px] items-center justify-center gap-1.5 rounded-[14px] bg-cool-gray/30 text-body-s hover:bg-cool-gray/50">
          <Icon name="share" size={20} />
          {t.share}
        </button>
      </div>
      <ShareVoucherPopup
        locale={locale}
        open={sharing}
        onClose={() => setSharing(false)}
        link={shareLink}
        onCopied={() => (setSharing(false), setToast(t.linkCopied))}
      />
      <Toast message={toast} onDone={done} />
    </>
  );
}
