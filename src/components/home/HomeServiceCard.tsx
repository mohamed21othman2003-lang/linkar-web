import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";

// v2 · Service card · Dark في الهوم (85:30020…85:30025) — كارت 197.35 مربع r15.5 (جوه صندوق 206).
// أماكن الأيقونة (start, top, w, h) وبداية العنوان (start, top, حجم الخط) من الفيجما بالظبط — start = يمين في العربي.
// التابلت (238) والموبايل (148) نفس الكارت بـzoom (ServicesBand).
const layout: Record<ServiceSlug, { icon: [number, number, number, number]; title: [number, number, number?] }> = {
  wash: { icon: [23.57, 26.85, 43.318, 51.187], title: [98.96, 53.31] },
  ppf: { icon: [18.87, 24.59, 49.712, 52.827], title: [83.47, 43.51] },
  tint: { icon: [17.15, 46.28, 67.807, 31.139], title: [103.74, 53.31] },
  polish: { icon: [19.34, 29, 55.571, 49.143], title: [102.51, 53.31] },
  "nano-ceramic": { icon: [20.13, 20.4, 64.272, 57.013], title: [85.37, 53.31] },
  "color-change": { icon: [19.34, 29, 55.571, 49.143], title: [102.51, 53.31, 13.49] },
};

export function HomeServiceCard({ locale, service, providers }: { locale: Locale; service: Service; providers: Provider[] }) {
  const t = getCommon(locale);
  const { icon, title } = layout[service.slug];
  const name = tx(locale, service, "name");
  const ar = locale === "ar";
  return (
    <article className="relative size-[197.35px] overflow-hidden rounded-[15.5px] bg-v3-card-dark">
      <Link href={routes.search({ services: [service.slug] })} aria-label={name} className="absolute inset-0 z-10 rounded-[15.5px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/figma/services/card-${service.slug}.svg`}
        alt=""
        className="pointer-events-none absolute"
        style={{ insetInlineStart: icon[0], top: icon[1], width: icon[2], height: icon[3] }}
      />
      {ar ? (
        <h3
          className="absolute end-1 text-start text-[16.37px] leading-[1.91] font-medium whitespace-nowrap text-neon-green"
          style={{ insetInlineStart: title[0], top: title[1], fontSize: title[2] }}
        >
          {name}
        </h3>
      ) : (
        // مفيش نسخة إنجليزي في الفيجما والأسماء أطول — العنوان بيلف على سطرين جنب الأيقونة
        <h3
          className="absolute end-3 top-[38px] flex h-[52px] items-center text-[14px] leading-[18px] font-medium text-neon-green"
          style={{ insetInlineStart: icon[0] + icon[2] + 10 }}
        >
          {name}
        </h3>
      )}
      <p className="absolute start-[21px] top-[89px] text-[11.54px] leading-[22px] text-v3-text-meta">{t.findItAt}</p>
      <p className="absolute start-[21px] end-3 top-[110px] truncate text-[11.54px] leading-[20px] text-white">
        {providers.map((p) => tx(locale, p, "short_name")).join(" • ")}
      </p>
      <span className="absolute end-[14px] top-[157.14px] flex h-[24.8px] w-[64.5px] items-center justify-center rounded-full bg-neon-green text-[11.54px] font-bold text-deep-charcoal">
        {t.book}
      </span>
    </article>
  );
}
