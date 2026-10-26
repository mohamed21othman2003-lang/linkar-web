"use client";

import { Icon } from "@/components/icons/Icon";
import { Toast, useToast } from "@/components/help/Toast";

// W2-100b · «Share» — مشاركة (Web Share API، وإلا نسخ الرابط) + نسخ الرابط، دوائر 40 بحد #dfe3e1
export function ShareButtons({ title, share, copy, copied }: { title: string; share: string; copy: string; copied: string }) {
  const toast = useToast();
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show(copied);
    } catch {}
  };
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {}
    } else copyLink();
  };
  const btn = "flex size-10 items-center justify-center rounded-full border border-chip-line bg-white text-deep-charcoal transition-colors hover:bg-tile";
  return (
    <div className="flex gap-2">
      <button type="button" onClick={copyLink} aria-label={copy} title={copy} className={btn}>
        <Icon name="copy" size={18} />
      </button>
      <button type="button" onClick={shareLink} aria-label={share} title={share} className={btn}>
        <Icon name="share" size={18} />
      </button>
      <Toast message={toast.message} icon="check" />
    </div>
  );
}
