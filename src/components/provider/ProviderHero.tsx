import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import type { Provider } from "@/lib/data/types";
import type { ProviderDetail } from "@/lib/data/provider-details";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { ProviderBadges } from "@/components/ui/Badges";
import { Icon } from "@/components/icons/Icon";
import { BrandIcon, LogoTile } from "./bits";
import { HeroActions, ScrollTabLink } from "./HeroActions";

// W2-21 · الهوية (الاسم، الشارات، الوصف، المواعيد، الفروع، التقييمات) + شيبس الثقة
export function ProviderHero({ locale, provider, detail }: { locale: Locale; provider: Provider; detail: ProviderDetail }) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const name = tx(locale, provider, "name");
  const short = tx(locale, provider, "short_name");
  const hours = tx(locale, detail, "hours");
  return (
    <>
      {/* Identity (العميل المعدّل AVbWFtRb0aHpm34oqkI5ot · 85:35696): من غير غلاف — الهوية · التقييمات · «حفظ / مشاركة» في سطر واحد */}
      <Container className="flex flex-col gap-6 pt-7 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4 md:gap-5">
          <LogoTile src={provider.logo} alt={name} size={96} className="hidden md:flex" />
          <LogoTile src={provider.logo} alt={name} size={64} radius={12} className="md:hidden" />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-h3 md:text-h2">{name}</h1>
              {/* W2-21 بيعرض التصنيف بس (بدون «معتمد LINKAR») */}
              <ProviderBadges locale={locale} tier={provider.tier} certified={false} surface="light" />
            </div>
            <p className="text-body-m text-v3-text-meta">{tx(locale, detail, "tagline")}</p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <ScrollTabLink href={routes.provider(provider.slug, "branches")} className="flex items-center gap-2.5 text-label-m text-deep-charcoal hover:underline">
                <Icon name="map-pin" size={16} className="text-v3-text-meta" />
                {detail.nearest_branch_km !== null
                  ? t.branchesMeta(c.branches(provider.branches), detail.nearest_branch_km.toFixed(1))
                  : c.branches(provider.branches)}
              </ScrollTabLink>
              {hours && (
                <>
                  {/* على الموبايل المواعيد بتنزل سطر لوحدها ← من غير «·» معلّقة */}
                  <span className="text-caption text-v3-text-meta max-sm:hidden">·</span>
                  <span className="text-label-m text-green-active">{hours}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <ScrollTabLink
            href={routes.provider(provider.slug, "reviews")}
            className="flex flex-col items-start gap-0.5 rounded-[14px] border border-neon-green bg-neon-green/16 px-4 py-2.5 transition-colors duration-200 ease-figma-out hover:bg-neon-green/25"
          >
            <span className="text-caption text-v3-text-meta">{t.linkarRating}</span>
            <span className="flex items-center gap-1.5">
              <Icon name="star-filled" size={18} className="text-v3-rating-star" />
              <span className="text-[22px] leading-[34px] font-bold text-deep-charcoal">{detail.linkar.rating.toFixed(1)}</span>
            </span>
            {detail.linkar.count > 0 && <span className="text-caption text-v3-text-meta">{t.linkarRatingsCount(detail.linkar.count)}</span>}
          </ScrollTabLink>
          {detail.google && (
            <ScrollTabLink
              href={routes.provider(provider.slug, "reviews")}
              className="flex flex-col items-start gap-0.5 rounded-[14px] bg-cool-gray/30 px-4 py-2.5 transition-colors duration-200 ease-figma-out hover:bg-cool-gray/45"
            >
              <span className="text-caption text-v3-text-meta">{t.googleRating}</span>
              <span className="flex items-center gap-1.5">
                <Icon name="star-filled" size={18} className="text-v3-rating-star" />
                <span className="text-[22px] leading-[34px] font-bold text-deep-charcoal">{detail.google.rating.toFixed(1)}</span>
              </span>
              <span className="text-caption text-v3-text-meta">{t.ratingsCount(detail.google.count)}</span>
            </ScrollTabLink>
          )}
        </div>
        <HeroActions locale={locale} slug={provider.slug} shortName={short} />
      </Container>

      {/* Trust */}
      {detail.trust.length > 0 && (
        <div id="provider-trust">
        <Container className="flex flex-wrap gap-3 pb-6">
          {detail.trust.map((it, i) => (
            <span key={i} className="flex items-center gap-2 rounded-full bg-cool-gray/30 px-3.5 py-2 text-label-m text-deep-charcoal">
              {it.icon === "check" ? <Icon name="check" size={20} className="text-nature-green" /> : <BrandIcon name={it.icon} size={22} />}
              {tx(locale, it, "label")}
            </span>
          ))}
        </Container>
        </div>
      )}
    </>
  );
}
