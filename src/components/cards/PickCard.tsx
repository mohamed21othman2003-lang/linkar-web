import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { RatingMeta, TagPill } from "@/components/ui/Badges";
import { LogoArea } from "./ClientLogo";

// v2 · Pick card (1669:21273) — «اخترنا لك»: Light (سبب الترشيح في شارة ليموني) أو AI (كارت غامق)
export function PickCard({
  locale,
  provider,
  reason,
  note,
  variant = "light",
  reasonTone = "neon",
}: {
  locale: Locale;
  provider: Provider;
  reason: string; // «لأنك حجزت خدمة التلميع من قبل»
  note: string; // «تقييم ممتاز من عملاء بسيارات مثل سيارتك»
  variant?: "light" | "ai";
  // green = شارة خضرا بنص أبيض («الأقرب إليك» في V2-01)
  reasonTone?: "neon" | "green";
}) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  const ai = variant === "ai";
  return (
    <article
      className={`relative flex h-[355px] w-full flex-col overflow-hidden rounded-[20px] ${
        ai ? "bg-deep-charcoal" : "border border-v3-card-stroke bg-white"
      }`}
    >
      <LogoArea slug={provider.slug} src={provider.logo} alt={name} height={133} />
      <div className="flex flex-1 flex-col items-start px-[22px] pt-[13px] pb-4">
        {ai ? (
          <span className="flex h-[29px] items-center gap-3 text-[12px] text-neon-green">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/glyphs/ai.svg" alt="" width={29} height={29} />
            {t.aiPick}
          </span>
        ) : (
          <TagPill className={reasonTone === "green" ? "bg-nature-green! text-white!" : ""}>{reason}</TagPill>
        )}
        <h3 className={`mt-1 text-[17px] leading-[1.5] font-bold ${ai ? "text-v3-text-on-dark" : "text-deep-charcoal"}`}>{name}</h3>
        <RatingMeta locale={locale} rating={provider.rating} distanceKm={provider.distance_km} branches={provider.branches} className="mt-1.5" />
        <p className="mt-2.5 text-body-s leading-[1.5] text-v3-text-meta">{ai ? reason : note}</p>
        <div className="mt-auto flex w-full items-center justify-between">
          <p className="flex items-baseline gap-[7px]">
            <span className="text-body-s text-v3-text-meta">{t.startsFrom}</span>
            <span className={`text-[17px] font-bold ${ai ? "text-white" : "text-deep-charcoal"}`}>
              {formatPrice(locale, provider.starting_price)}
            </span>
          </p>
          <Link
            href={routes.provider(provider.slug)}
            className={`flex items-center gap-1.5 text-label-m ${ai ? "text-neon-green" : "text-nature-green"}`}
          >
            {t.more}
            <Icon name="chevron-left" size={14} flip />
          </Link>
        </div>
      </div>
    </article>
  );
}
