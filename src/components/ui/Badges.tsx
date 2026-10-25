import type { ProviderTier } from "@/lib/data/types";
import type { Locale } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";

// الشارة الليموني فوق اسم المركز («الأقرب إليك»، «عروض متاحة»…) — 30px، Regular 12
export function TagPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-[30px] items-center rounded-full bg-neon-green ps-3 pe-2.5 text-[12px] text-deep-charcoal ${className}`}>
      {children}
    </span>
  );
}

// شيبس الخدمات على الكروت الغامقة (v3/chip-dark)
export function DarkChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[24.5px] min-w-[84.7px] items-center justify-center rounded-full bg-v3-chip-dark px-3 text-body-s leading-none text-v3-text-on-dark">
      {children}
    </span>
  );
}

const tierColors: Record<ProviderTier, string> = {
  platinum: "bg-tier-platinum-bg text-tier-platinum-fg",
  gold: "bg-tier-gold-bg text-tier-gold-fg",
  silver: "bg-tier-silver-bg text-tier-silver-fg",
};

// LNK · شارات المركز: «معتمد LINKAR ✓» + التصنيف (بلاتيني/ذهبي/فضي)
// surface: dark = على كارت غامق (ليموني)، light = على خلفية فاتحة (كحلي)
export function ProviderBadges({
  locale,
  tier,
  certified,
  surface = "dark",
}: {
  locale: Locale;
  tier: ProviderTier;
  certified: boolean;
  surface?: "dark" | "light";
}) {
  const t = getCommon(locale);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {/* التصنيف أولاً من بداية السطر، وبعده «معتمد LINKAR» (زي W2-26 وكروت النتائج) */}
      {/* «ذهبي G»: دايرة الحرف في بداية الشارة (يمين في العربي) زي LNK · تصنيف المركز */}
      <span className={`inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[11px] ps-[3px] pe-2 text-micro whitespace-nowrap ${tierColors[tier]}`}>
        <span className="flex size-4 items-center justify-center rounded-lg bg-white text-[10px] leading-none">{t.tierLetters[tier]}</span>
        {t.tiers[tier]}
      </span>
      {certified && (
        <span
          className={`inline-flex h-[22px] shrink-0 items-center rounded-[11px] px-2 text-micro whitespace-nowrap ${
            surface === "dark" ? "bg-neon-green text-deep-charcoal" : "bg-deep-charcoal text-neon-green"
          }`}
        >
          {t.certified}
        </span>
      )}
    </span>
  );
}

// «★ 4.8 | 1.2 كم | فرعان» — سطر التقييم والمسافة في الكروت
export function RatingMeta({
  locale,
  rating,
  distanceKm,
  branches,
  meta,
  className = "",
}: {
  locale: Locale;
  rating: number;
  distanceKm?: number;
  branches?: number;
  // نص بديل لعدد الفروع (مثلاً اسم الفرع «فرع الروضة» في المفضلة W2-64)
  meta?: string;
  className?: string;
}) {
  const t = getCommon(locale);
  const parts = [rating.toFixed(1)];
  if (distanceKm !== undefined) parts.push(`${distanceKm.toFixed(1)} ${t.km}`);
  if (meta) parts.push(meta);
  else if (branches !== undefined) parts.push(t.branches(branches));
  return (
    <span className={`flex items-center gap-1 text-body-s leading-none text-v3-text-meta ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/glyphs/star-rating.svg" alt="" width={15} height={15} className="shrink-0" />
      <span dir={locale === "ar" ? "rtl" : "ltr"}>{parts.join(" | ")}</span>
    </span>
  );
}
