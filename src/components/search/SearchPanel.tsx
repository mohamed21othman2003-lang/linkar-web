"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider, Service } from "@/lib/data/types";
import type { RecentSearch } from "@/lib/data/search/options";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph, type UiGlyph } from "@/components/icons/Icon";
import { SearchBar, type CarSize } from "./SearchBar";

type PanelData = {
  services: Service[];
  providers: Provider[];
  named: { label_ar: string; label_en: string; service: Service["slug"]; provider: string }[];
  recent: RecentSearch[];
  popular: Service["slug"][];
  carSizes: CarSize[];
  location: { label_ar: string; label_en: string; city_ar: string; city_en: string };
};

let cache: PanelData | null = null;

// تطبيع عربي بسيط للمطابقة: الهمزات، التاء المربوطة، الألف المقصورة، التشكيل
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ‏]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();

type Suggestion = { key: string; title: string; sub: string; href: string; icon: UiGlyph };

// W2-29 · البحث من الهيدر · لوحة البحث (769:16533)
export function SearchPanel({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = getSearchDict(locale);
  const router = useRouter();
  const [data, setData] = useState<PanelData | null>(cache);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    if (cache) return;
    let alive = true;
    fetch("/search/suggest")
      .then((r) => r.json())
      .then((d: PanelData) => {
        cache = d;
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = norm(q);
    if (!data || !query) return [];
    const city = locale === "en" ? data.location.city_en : data.location.city_ar;
    const hit = (...xs: string[]) => xs.some((x) => norm(x).includes(query));
    const pname = (slug: string) => {
      const p = data.providers.find((x) => x.slug === slug);
      return p ? tx(locale, p, "name") : slug;
    };
    const out: Suggestion[] = [];
    for (const p of data.providers)
      if (hit(p.name_ar, p.name_en, p.short_name_ar, p.short_name_en))
        out.push({ key: `p-${p.slug}`, title: tx(locale, p, "name"), sub: t.providerResult(p.branches, city), href: routes.provider(p.slug), icon: "store" });
    for (const n of data.named)
      if (hit(n.label_ar, n.label_en) || hit(pname(n.provider)))
        out.push({
          key: `n-${n.provider}-${n.label_en}`,
          title: tx(locale, n, "label"),
          sub: t.serviceAt(tx(locale, data.services.find((s) => s.slug === n.service)!, "name"), pname(n.provider)),
          href: routes.providerService(n.provider, n.service),
          icon: "grid",
        });
    for (const s of data.services)
      if (hit(s.name_ar, s.name_en, s.chip_ar, s.chip_en))
        out.push({ key: `s-${s.slug}`, title: tx(locale, s, "name"), sub: tx(locale, s, "description"), href: routes.search({ services: [s.slug] }), icon: "grid" });
    return out.slice(0, 6);
  }, [q, data, locale, t]);

  const recentHref = (r: RecentSearch) =>
    r.kind === "provider" ? routes.provider(r.provider) : r.kind === "providerService" ? routes.providerService(r.provider, r.service) : routes.search({ services: r.services });

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 z-50" role="dialog" aria-modal="true" aria-label={t.search}>
      <div className="absolute inset-0 animate-dissolve bg-deep-charcoal/72" onClick={onClose} />
      <div className="relative max-h-full animate-dissolve overflow-y-auto rounded-b-[32px] bg-white shadow-elevation-2">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-[18px] px-4 pt-5 pb-7 md:px-10 xl:px-20">
          <div className="flex flex-col gap-2">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(suggestions[0]?.href ?? routes.search());
              }}
              className="flex h-[54px] items-center gap-2.5 rounded-md border border-deep-charcoal bg-white px-3.5"
            >
              <Icon name="search" size={18} className="shrink-0 text-deep-charcoal" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.panelPlaceholder}
                aria-label={t.panelPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none"
              />
              <button type="button" aria-label={q ? t.clearSearch : getCommon(locale).close} onClick={() => (q ? setQ("") : onClose())} className="flex size-6 shrink-0 items-center justify-center text-state-gray hover:text-deep-charcoal">
                <Icon name="x" size={16} />
              </button>
            </form>
            {q.trim() && (
              <div className="flex flex-col gap-0.5 rounded-md border border-cool-gray bg-white p-1.5">
                {suggestions.length ? (
                  suggestions.map((s) => (
                    <Link key={s.key} href={s.href} onClick={onClose} className="flex min-h-[60px] items-center gap-3 rounded-[10px] px-3 py-2 hover:bg-tile">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-suggest-icon text-deep-charcoal">
                        <Icon name={s.icon} size={18} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col items-start">
                        <span className="text-label-m text-deep-charcoal">{s.title}</span>
                        <span className="truncate text-caption text-state-gray">{s.sub}</span>
                      </span>
                      <Icon name="chevron-left" size={14} flip className="shrink-0 text-state-gray" />
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-4 text-caption text-state-gray">{t.noMatches}</p>
                )}
              </div>
            )}
            <p className="pt-2 text-caption text-state-gray">{t.orPick}</p>
          </div>

          {data && (
            <SearchBar
              locale={locale}
              services={data.services}
              selected={["nano-ceramic", "polish"]}
              carSizes={data.carSizes}
              location={tx(locale, data.location, "label")}
              onSearch={onClose}
            />
          )}

          {data && (
            <div className="flex flex-col gap-3">
              <p className="text-label-l text-deep-charcoal">{t.recent}</p>
              <div className="flex flex-wrap gap-2">
                {data.recent.map((r) => (
                  <Link key={r.label_en} href={recentHref(r)} onClick={onClose} className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-tile px-3 text-label-m text-deep-charcoal hover:bg-bg-muted">
                    <Icon name="clock" size={14} className="text-state-gray" />
                    {tx(locale, r, "label")}
                  </Link>
                ))}
              </div>
              <p className="text-label-l text-deep-charcoal">{t.popular}</p>
              <div className="flex flex-wrap gap-2">
                {data.popular.map((slug) => {
                  const s = data.services.find((x) => x.slug === slug)!;
                  return (
                    <Link
                      key={slug}
                      href={routes.search({ services: [slug] })}
                      onClick={onClose}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cool-gray py-1 ps-1 pe-3 text-label-m text-deep-charcoal hover:border-border-strong"
                    >
                      <span className="flex size-[26px] items-center justify-center">
                        <ServiceGlyph name={slug} size={16} className="text-state-gray" />
                      </span>
                      {tx(locale, s, "name")}
                    </Link>
                  );
                })}
              </div>
              <p className="flex items-start gap-1.5 text-caption text-state-gray">
                <Icon name="info" size={14} className="mt-1 shrink-0" />
                {t.panelHint}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

