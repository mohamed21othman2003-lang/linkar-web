"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { Icon } from "@/components/icons/Icon";
import { ShareVoucherPopup } from "@/components/account/booking-modals";
import { Toast } from "./Modal";

// أزرار القسيمة في W2-36: مشاركة · الاتجاهات · إضافة إلى المحفظة (P-10u «أُضيفت القسيمة إلى محفظتك»)
// «مشاركة» ← P-08 مشاركة القسيمة (OVERLAY · DISSOLVE 200ms) — مكوّن P-08 من صفحات الحساب
export function VoucherActions({ locale, mapsUrl, shareLink }: { locale: Locale; mapsUrl: string; shareLink: string }) {
  const t = getBookingDict(locale);
  const [toast, setToast] = useState<string | null>(null);
  const done = useCallback(() => setToast(null), []);
  const [sharing, setSharing] = useState(false);
  // min-h بدل h: على الموبايل «إضافة إلى محفظة Google» بتنزل سطرين
  const wallet = "flex min-h-[42px] flex-1 items-center justify-center gap-2 bg-pay-black px-3.5 py-2 text-center text-label-m text-white";
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
      <div className="flex gap-2.5">
        <button type="button" onClick={() => setToast(t.walletAdded)} className={wallet}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/gift/wallet-apple.svg" alt="" width={18} height={18} />
          {t.addApple}
        </button>
        <button type="button" onClick={() => setToast(t.walletAdded)} className={wallet}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/gift/wallet-google.svg" alt="" width={18} height={18} />
          {t.addGoogle}
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
