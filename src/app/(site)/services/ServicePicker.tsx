"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { getCommon } from "@/i18n/dict/common";
import { ServiceCardFace, serviceBookClass } from "@/components/cards/ServiceCard";

export type PickerService = { service: Service; providers: Provider[] };
type Copy = Record<"selectedOne" | "selectedTwo" | "selectedMany" | "together" | "ctaOne" | "ctaTwo" | "ctaMany" | "hint", string>;

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
              <ServiceCardFace
                locale={locale}
                service={service}
                providers={providers}
                book={
                  <Link href={routes.search({ services: [service.slug] })} onClick={(e) => e.stopPropagation()} className={`${serviceBookClass} hover:bg-bg-brand-hover`}>
                    {t.book}
                  </Link>
                }
              />
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
