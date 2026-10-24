"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import type { Locale } from "@/i18n/config";
import { getHelpDict } from "@/i18n/dict/help";

export type HelpTopicView = {
  key: string;
  icon: UiGlyph;
  title: string;
  allHref: string;
  articles: { title: string; href: string }[];
};
export type HelpArticleLink = { title: string; summary: string; topic: string; href: string };

// تطبيع بسيط للبحث بالعربي: تجاهل التشكيل والهمزات والتاء المربوطة
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();

// W2-97 · البحث + كروت المواضيع. البحث بيفلتر كل المقالات محلياً (مفيش حالة نتائج في الفيجما — تصميمنا).
export function HelpCenter({ locale, topics, articles, placeholder }: { locale: Locale; topics: HelpTopicView[]; articles: HelpArticleLink[]; placeholder: string }) {
  const d = getHelpDict(locale);
  const [q, setQ] = useState("");
  const query = norm(q);
  const results = useMemo(
    () => (query ? articles.filter((a) => norm(`${a.title} ${a.summary} ${a.topic}`).includes(query)) : []),
    [articles, query],
  );

  return (
    <div className="flex flex-col gap-10">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-3 rounded-[14px] border border-border-default bg-white py-2 ps-3 pe-2 focus-within:border-deep-charcoal md:ps-2 md:pe-[18px]"
      >
        <Icon name="search" size={18} className="shrink-0 text-state-gray" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-[42px] min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label={d.clearSearch} className="flex size-8 shrink-0 items-center justify-center rounded-full text-state-gray hover:bg-tile">
            <Icon name="x" size={16} />
          </button>
        )}
        <button type="submit" className="shrink-0 rounded-md bg-deep-charcoal px-5 py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle">
          {d.search}
        </button>
      </form>

      {query ? (
        <section aria-live="polite" className="flex flex-col gap-3">
          <p className="text-label-m text-text-secondary">{results.length ? d.results(results.length) : d.noResults}</p>
          {results.map((a) => (
            <Link key={a.href} href={a.href} className="flex items-center justify-between gap-4 rounded-md bg-tile px-4 py-3 hover:bg-bg-muted">
              <span className="flex min-w-0 flex-col">
                <span className="text-body-m text-deep-charcoal">{a.title}</span>
                <span className="text-caption text-text-secondary">{a.topic}</span>
              </span>
              <Icon name="chevron-left" size={14} flip className="shrink-0 text-state-gray" />
            </Link>
          ))}
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-10">
          {topics.map((t) => (
            <section key={t.key} id={t.key} className="flex flex-col gap-3 rounded-xl border border-border-default bg-white p-6">
              <div className="flex items-center gap-3">
                {/* الفيجما: العنوان من بداية السطر والأيقونة بعده */}
                <h2 className="text-h5 text-deep-charcoal">{t.title}</h2>
                <span className="flex rounded-[14px] bg-neon-green p-3">
                  <Icon name={t.icon} size={22} className="text-deep-charcoal" />
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {t.articles.map((a) => (
                  <li key={a.href}>
                    <Link href={a.href} className="flex items-center justify-between gap-3 text-body-s text-deep-charcoal hover:text-green-active">
                      <span>{a.title}</span>
                      <Icon name="chevron-left" size={14} flip className="shrink-0 text-state-gray" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={t.allHref} className="mt-auto flex items-center gap-1.5 self-start py-0.5 text-label-m text-green-active hover:underline">
                {d.allArticles}
                <Icon name="chevron-left" size={16} flip className="text-nature-green" />
              </Link>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
