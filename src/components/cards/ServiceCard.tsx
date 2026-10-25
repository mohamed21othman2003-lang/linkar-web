import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";

// أماكن الأيقونة والعنوان جوه الكارت (239.5) من v2 · Service card (W2-25 / 1626:26003…) بالظبط — start = يمين في العربي.
// الأيقونات متصدّرة من الفيجما (public/figma/services) وكل واحدة بمقاسها، فالمسافة بينها وبين العنوان بتختلف من كارت للتاني.
const cardLayout: Record<ServiceSlug, { icon: [start: number, top: number, w: number, h: number]; title: [start: number, top: number] }> = {
  "nano-ceramic": { icon: [24.4, 24.8, 78, 69.19], title: [103.6, 64.7] },
  polish: { icon: [23.5, 35.2, 67.44, 59.64], title: [124.4, 64.7] },
  tint: { icon: [20.8, 56.2, 82.29, 37.79], title: [125.9, 64.7] },
  ppf: { icon: [22.9, 29.8, 60.33, 64.11], title: [101.3, 52.8] },
  wash: { icon: [28.6, 32.6, 52.57, 62.12], title: [120.1, 64.7] },
};

// وش الكارت: الأيقونة والاسم و«تجدها لدى» والمقدّمين، و«احجز» في مكانه — الكارت نفسه (الخلفية والارتفاع) عند اللي بيستخدمه
export function ServiceCardFace({ locale, service, providers, book }: { locale: Locale; service: Service; providers: Provider[]; book: ReactNode }) {
  const t = getCommon(locale);
  const { icon, title } = cardLayout[service.slug];
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/figma/services/card-${service.slug}.svg`}
        alt=""
        className="pointer-events-none absolute"
        style={{ insetInlineStart: icon[0], top: icon[1], width: icon[2], height: icon[3] }}
      />
      {locale === "ar" ? (
        <h3 className="pointer-events-none absolute w-[150px] text-start text-[19.87px] leading-[38px] font-medium text-neon-green" style={{ insetInlineStart: title[0], top: title[1] }}>
          {tx(locale, service, "name")}
        </h3>
      ) : (
        // مفيش نسخة إنجليزي في الفيجما والأسماء أطول («Window tinting») — العنوان بيلف على سطرين جنب الأيقونة
        <h3
          className="pointer-events-none absolute end-[14px] top-[48px] flex h-[62px] items-center text-[17px] leading-[22px] font-medium text-neon-green"
          style={{ insetInlineStart: icon[0] + icon[2] + 12 }}
        >
          {tx(locale, service, "name")}
        </h3>
      )}
      <p className="pointer-events-none absolute start-[25.5px] top-[113.3px] w-[200px] text-[14px] leading-[27px] text-v3-text-meta">{t.findItAt}</p>
      <p className="pointer-events-none absolute start-[25.5px] top-[136.3px] w-[200px] text-[14px] leading-[18px] text-white">
        {providers.map((p) => tx(locale, p, "short_name")).join(" • ")}
      </p>
      <span className="absolute end-[17px] top-[190.7px]">{book}</span>
    </>
  );
}

export const serviceBookClass =
  "flex h-[30.1px] w-[78.3px] items-center justify-center rounded-full bg-neon-green text-label-m font-bold text-deep-charcoal";

// v2 · Service card · Dark (1626:26018) — 239.5×239.5، r15.5: الكارت كله لينك لنتايج الخدمة
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
    <article className={`relative h-[239.5px] w-full rounded-[15.5px] bg-v3-card-dark ${selected ? "ring-2 ring-neon-green" : ""}`}>
      <Link href={link} aria-label={tx(locale, service, "name")} className="absolute inset-0 rounded-[15.5px]" />
      <ServiceCardFace locale={locale} service={service} providers={providers} book={<span className={`pointer-events-none ${serviceBookClass}`}>{t.book}</span>} />
    </article>
  );
}
