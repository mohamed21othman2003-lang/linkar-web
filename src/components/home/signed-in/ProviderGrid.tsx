import Link from "next/link";
import { routes } from "@/lib/routes";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import { ProviderCard } from "@/components/cards/ProviderCard";

// فلاتر الخدمات (Chip · Size=M على كحلي) + 4 كروت مقدّمي خدمة — «الكل» = الكروت المختارة في الفيجما
export function ProviderGrid({
  locale,
  services,
  featured,
  allLabel,
  filterLabel,
}: {
  locale: Locale;
  services: Service[];
  featured: { provider: Provider; tag: string | null; ai: boolean }[];
  allLabel: string;
  filterLabel: string;
}) {
  // الفلاتر في الفيجما (Chip 557:141) بتودّي لصفحة كل مقدّمي الخدمة (W2-26)
  const list = featured;
  const chip = (on: boolean) =>
    `inline-flex h-control-sm shrink-0 items-center rounded-full px-3.5 text-label-m transition-colors ${
      on ? "bg-white text-deep-charcoal" : "border border-white/12 bg-white/6 text-white hover:bg-white/12"
    }`;
  return (
    <>
      <div role="toolbar" aria-label={filterLabel} className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0">
        <span aria-current="true" className={chip(true)}>
          {allLabel}
        </span>
        {services.map((s) => (
          <Link key={s.slug} href={routes.providers()} className={chip(false)}>
            {tx(locale, s, "name")}
          </Link>
        ))}
      </div>
      {/* 4 أعمدة من xl — في 1024 الكارت بيضيق لـ217px وسطر السعر و«احجز» مايكفّوش */}
      <div className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 xl:grid-cols-4">
        {list.map(({ provider, tag, ai }) => (
          <ProviderCard key={provider.slug} locale={locale} provider={provider} services={services} tagLabel={tag} aiLabel={ai} />
        ))}
      </div>
    </>
  );
}
