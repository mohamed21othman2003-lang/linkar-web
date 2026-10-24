"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { getCommon } from "@/i18n/dict/common";

export type PickerService = { service: Service; providers: Provider[] };
type Copy = Record<"selectedOne" | "selectedTwo" | "selectedMany" | "together" | "ctaOne" | "ctaTwo" | "ctaMany" | "hint", string>;

// أماكن الأيقونة والعنوان جوه الكارت (239.5) من W2-25 بالظبط — start = يمين في العربي.
// الأيقونات متصدّرة من الفيجما (public/figma/services) وكل واحدة بمقاسها، فالمسافة بينها وبين العنوان بتختلف من كارت للتاني.
const cardLayout: Record<ServiceSlug, { icon: [start: number, top: number, w: number, h: number]; title: [start: number, top: number] }> = {
  "nano-ceramic": { icon: [24.4, 24.8, 78, 69.19], title: [103.6, 64.7] },
  polish: { icon: [23.5, 35.2, 67.44, 59.64], title: [124.4, 64.7] },
  tint: { icon: [20.8, 56.2, 82.29, 37.79], title: [125.9, 64.7] },
  ppf: { icon: [22.9, 29.8, 60.33, 64.11], title: [101.3, 52.8] },
  wash: { icon: [28.6, 32.6, 52.57, 62.12], title: [120.1, 64.7] },
};

// كروت الخدمات الغامقة قابلة للاختيار المتعدد + شريط الاختيار (Selection bar) في W2-25
export function ServicePicker({
  locale,
  items,
  copy,
  defaultSelected = [],
  definiteNames = {},
}: {
  locale: Locale;
  items: PickerService[];
  copy: Copy;
  defaultSelected?: ServiceSlug[];
  // الاسم بأداة التعريف في جملة الاختيار («النانو سيراميك»)
  definiteNames?: Partial<Record<ServiceSlug, string>>;
}) {
  const t = getCommon(locale);
  // الحالة الافتراضية في الفيجما (W2-25): خدمتين مختارين
  const [selected, setSelected] = useState<ServiceSlug[]>(defaultSelected);
  const toggle = (s: ServiceSlug) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const names = selected.map((s) => definiteNames[s] ?? tx(locale, items.find((i) => i.service.slug === s)!.service, "name"));
  const n = names.length;
  const title =
    n === 1
      ? copy.selectedOne.replace("{a}", names[0])
      : n === 2
        ? copy.selectedTwo.replace("{a}", names[0]).replace("{b}", names[1])
        : copy.selectedMany.replace("{n}", String(n)).replace("{list}", names.join(" + "));
  const cta = n === 1 ? copy.ctaOne : n === 2 ? copy.ctaTwo : copy.ctaMany;

  return (
    <div className="flex flex-col gap-5">
      {/* الفيجما (W2-25): 5 كروت 239.5×239.5 وبينهم 20 جوه الحاوية (1280)، وكل كارت جوه إطار 250 (هامش 5.25 فوق وتحت) */}
      <div className="grid grid-cols-1 gap-5 py-[5.25px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map(({ service, providers }) => {
          const on = selected.includes(service.slug);
          const { icon, title } = cardLayout[service.slug];
          return (
            <article
              key={service.slug}
              role="checkbox"
              aria-checked={on}
              tabIndex={0}
              onClick={() => toggle(service.slug)}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), toggle(service.slug))}
              className={`relative h-[239.5px] cursor-pointer rounded-[15.5px] bg-v3-card-dark outline-2 outline-offset-2 ${on ? "outline outline-neon-green" : "outline-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/figma/services/card-${service.slug}.svg`}
                alt=""
                className="absolute"
                style={{ insetInlineStart: icon[0], top: icon[1], width: icon[2], height: icon[3] }}
              />
              {locale === "ar" ? (
                <h2
                  className="absolute w-[150px] text-start text-[19.87px] leading-[38px] font-medium text-neon-green"
                  style={{ insetInlineStart: title[0], top: title[1] }}
                >
                  {tx(locale, service, "name")}
                </h2>
              ) : (
                // مفيش نسخة إنجليزي للصفحة في الفيجما والأسماء أطول («Window tinting») — العنوان بيلف على سطرين جنب الأيقونة
                <h2
                  className="absolute end-[14px] top-[48px] flex h-[62px] items-center text-[17px] leading-[22px] font-medium text-neon-green"
                  style={{ insetInlineStart: icon[0] + icon[2] + 12 }}
                >
                  {tx(locale, service, "name")}
                </h2>
              )}
              <p className="absolute start-[25.5px] top-[113.3px] w-[200px] text-[14px] leading-[27px] text-v3-text-meta">{t.findItAt}</p>
              <p className="absolute start-[25.5px] top-[136.3px] w-[200px] text-[14px] leading-[18px] text-white">
                {providers.map((p) => tx(locale, p, "short_name")).join(" • ")}
              </p>
              <Link
                href={routes.search({ services: [service.slug] })}
                onClick={(e) => e.stopPropagation()}
                className="absolute end-[17px] top-[190.7px] flex h-[30.1px] w-[78.3px] items-center justify-center rounded-full bg-neon-green text-label-m font-bold text-deep-charcoal hover:bg-bg-brand-hover"
              >
                {t.book}
              </Link>
            </article>
          );
        })}
      </div>

      {n > 0 ? (
        <div className="flex flex-col gap-4 rounded-[20px] bg-deep-charcoal px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 text-white">
            <p className="text-label-l">{title}</p>
            {n > 1 && <p className="text-caption">{copy.together}</p>}
          </div>
          <Link
            href={routes.search({ services: selected })}
            className="flex items-center justify-center gap-1.5 rounded-md bg-neon-green px-[18px] py-2.5 text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {cta}
            <Icon name="chevron-left" size={16} flip />
          </Link>
        </div>
      ) : (
        <p className="text-body-s text-text-secondary">{copy.hint}</p>
      )}
    </div>
  );
}
