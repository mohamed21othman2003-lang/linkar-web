import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { ServiceGlyph } from "@/components/icons/Icon";

// مقاس صندوق الأيقونة لكل خدمة عشان الرسمة تطلع بنفس حجمها في الفيجما (v2 · Service card · Dark)
const glyphBox: Record<ServiceSlug, number> = { wash: 68, ppf: 70, tint: 90, polish: 74, "nano-ceramic": 85 };

// v2 · Service card · Dark (1626:26018) — 240×240، r15.5: أيقونة ليموني + الاسم، «تجدها لدى»، «احجز»
export function ServiceCard({
  locale,
  service,
  providers,
  href,
  selected = false,
}: {
  locale: Locale;
  service: Service;
  providers: Provider[];
  href?: string;
  selected?: boolean;
}) {
  const t = getCommon(locale);
  const link = href ?? routes.search({ services: [service.slug] });
  return (
    <article
      className={`relative flex min-h-[220px] w-full sm:aspect-square flex-col overflow-hidden rounded-[15.5px] bg-v3-card-dark px-[17px] pt-[18px] pb-[19px] ${
        selected ? "ring-2 ring-neon-green" : ""
      }`}
    >
      <Link href={link} aria-label={tx(locale, service, "name")} className="absolute inset-0" />
      <div className="flex h-[76px] items-end gap-1">
        <ServiceGlyph name={service.slug} size={glyphBox[service.slug]} className="-mb-2 -me-2 shrink-0 text-neon-green" />
        <h3 className={`min-w-0 pb-1 text-[19.9px] leading-[1.3] font-medium text-neon-green ${locale === "ar" ? "whitespace-nowrap" : ""}`}>{tx(locale, service, "name")}</h3>
      </div>
      <p className="mt-5 text-body-s leading-[1.4] text-v3-text-meta">{t.findItAt}</p>
      <p className="mt-1 text-body-s leading-[1.4] text-white">{providers.map((p) => tx(locale, p, "short_name")).join(" • ")}</p>
      <span className="pointer-events-none mt-auto flex h-[30px] w-[78px] items-center justify-center self-end rounded-full bg-neon-green text-label-m font-bold text-deep-charcoal">
        {t.book}
      </span>
    </article>
  );
}
