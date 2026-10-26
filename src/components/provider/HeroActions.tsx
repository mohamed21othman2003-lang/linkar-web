"use client";

import { useState, type ReactNode } from "react";
import { FIGMA_EASE_IN_OUT, scrollToEl } from "./motion";
import type { Locale } from "@/i18n/config";
import { getProviderDict } from "@/i18n/dict/provider";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { useToast } from "./Modal";
import { ShareModal } from "./Popups";

// «حفظ» (P-10b) و«مشاركة» (P-08b) — العميل المعدّل: أزرار بيضاء بحدود #b3b3b3 في سطر الهوية (مفيش غلاف)
export function HeroActions({ locale, slug, shortName }: { locale: Locale; slug: string; shortName: string }) {
  const t = getProviderDict(locale);
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const btn = "flex items-center gap-1.5 rounded-md border border-v3-card-stroke bg-white px-3.5 py-[9px] text-label-m text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-tile";
  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => {
          const next = !saved;
          setSaved(next);
          if (next) toast({ text: t.addedToFavorites, icon: "heart", action: { label: t.view, href: routes.favorites() } });
        }}
        className={btn}
      >
        <Icon name={saved ? "heart-filled" : "heart"} size={20} className={saved ? "text-nature-green" : ""} />
        {t.save}
      </button>
      <button type="button" onClick={() => setSharing(true)} className={btn}>
        <Icon name="share" size={18} />
        {t.share}
      </button>
      <ShareModal locale={locale} open={sharing} onClose={() => setSharing(false)} shortName={shortName} path={routes.provider(slug)} slug={slug} />
    </div>
  );
}

// «تقييم لينكار» / «8 فروع · أقرب فرع…»: SCROLL_TO «Trust» · SCROLL_ANIMATE 500ms EASE_IN_AND_OUT + فتح التبويب المناسب
export function ScrollTabLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.history.replaceState(null, "", href);
        scrollToEl(document.getElementById("provider-trust") ?? document.getElementById("provider-tabs"), 0.5, FIGMA_EASE_IN_OUT);
      }}
    >
      {children}
    </a>
  );
}
