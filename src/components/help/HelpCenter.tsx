"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import type { Locale } from "@/i18n/config";
import { getHelpDict } from "@/i18n/dict/help";
import { Toast, useToast } from "./Toast";

export type HelpTopicView = {
  key: string;
  icon: UiGlyph;
  title: string;
  articles: { slug: string; title: string; answer: string }[];
};
export type HelpArticleLink = { title: string; summary: string; topic: string; href: string };
export type HelpCenterCopy = {
  placeholder: string;
  categories: string;
  count: string; // «{n} مقالات»
  hint: string;
  helpful: string;
  thanks: string;
};

// تطبيع بسيط للبحث بالعربي: تجاهل التشكيل والهمزات والتاء المربوطة
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();

const t200 = { duration: 0.2, ease: [0, 0, 0.58, 1] as const };

// W2-97 · مركز المساعدة (85:47378): البحث + «الفئات» (قائمة جانبية) + أسئلة الفئة المختارة (تتفتح في مكانها بالإجابة و«هل أفادتك الإجابة؟»)
// البحث بيفلتر كل المقالات محلياً ويودّي لصفحة المقال (W2-97b) — مفيش حالة نتائج في الفيجما (تصميمنا).
export function HelpCenter({ locale, topics, articles, initial, copy }: { locale: Locale; topics: HelpTopicView[]; articles: HelpArticleLink[]; initial: string; copy: HelpCenterCopy }) {
  const d = getHelpDict(locale);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(initial);
  const [open, setOpen] = useState<string[]>(() => {
    const first = topics.find((tp) => tp.key === initial)?.articles[0];
    return first ? [first.slug] : [];
  });
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const toast = useToast();
  const query = norm(q);
  const results = useMemo(
    () => (query ? articles.filter((a) => norm(`${a.title} ${a.summary} ${a.topic}`).includes(query)) : []),
    [articles, query],
  );
  const topic = topics.find((tp) => tp.key === active) ?? topics[0];
  const count = (n: number) => copy.count.replace("{n}", String(n));

  const pickTopic = (key: string) => {
    setActive(key);
    const first = topics.find((tp) => tp.key === key)?.articles[0];
    setOpen(first ? [first.slug] : []);
  };
  const toggle = (slug: string) => setOpen((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  const vote = (slug: string, v: "yes" | "no") => {
    if (votes[slug]) return;
    setVotes((cur) => ({ ...cur, [slug]: v }));
    toast.show(copy.thanks);
  };

  return (
    <div className="flex flex-col gap-10">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-3 rounded-[14px] border border-border-default bg-white py-2 ps-3 pe-2 focus-within:border-deep-charcoal md:ps-[18px]"
      >
        <Icon name="search" size={18} className="shrink-0 text-state-gray" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* الفئات — عمود 330 من lg، وتحت كده شريط أفقي بيتسكرول */}
          <nav
            aria-label={copy.categories}
            className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 lg:w-[330px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:rounded-xl lg:border lg:border-hairline lg:bg-white lg:px-3 lg:pt-4 lg:pb-3 [&::-webkit-scrollbar]:hidden"
          >
            <p className="hidden ps-2 pb-1 text-label-m leading-[27px] text-state-gray lg:block">{copy.categories}</p>
            {topics.map((tp) => {
              const on = tp.key === topic.key;
              return (
                <button
                  key={tp.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickTopic(tp.key)}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-md py-2.5 ps-3.5 pe-2.5 text-start transition-colors lg:w-full ${
                    on ? "border border-neon-green bg-[#f4fde6]" : "bg-tile hover:bg-bg-muted lg:bg-transparent"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className={`text-[15px]/[28px] whitespace-nowrap text-deep-charcoal ${on ? "font-bold" : "font-medium"}`}>{tp.title}</span>
                    <span className="text-[12px]/[15px] font-light text-state-gray">{count(tp.articles.length)}</span>
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-neon-green text-deep-charcoal">
                    <Icon name={tp.icon} size={17} />
                  </span>
                </button>
              );
            })}
          </nav>

          <section aria-live="polite" className="flex min-w-0 flex-1 flex-col rounded-xl border border-hairline bg-white px-4 pt-6 pb-3 md:px-7">
            <div className="flex flex-col gap-1 pb-3">
              <h2 className="text-[22px]/[40px] font-bold text-deep-charcoal md:text-[24px]/[46px]">{topic.title}</h2>
              <p className="text-[14px]/[18px] font-light text-state-gray">
                {count(topic.articles.length)} · {copy.hint}
              </p>
            </div>
            {topic.articles.map((a) => {
              const on = open.includes(a.slug);
              const id = `help-a-${a.slug}`;
              return (
                <div key={a.slug} className="border-t border-hairline py-4">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={id}
                      onClick={() => toggle(a.slug)}
                      className="flex w-full items-center justify-between gap-4 text-start text-[16px]/[30px] font-medium text-deep-charcoal hover:text-green-active"
                    >
                      {a.title}
                      <Icon name="chevron-left" size={14} flip className="shrink-0 text-state-gray" />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={id}
                        key="a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={t200}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2.5 pt-2.5">
                          <p className="text-[15px]/[19px] font-light text-state-gray max-md:leading-[26px]">
                            {a.answer}
                          </p>
                          <div className="flex items-center gap-3 text-[14px]/[27px]">
                            <span className="font-light text-state-gray">{copy.helpful}</span>
                            {(["yes", "no"] as const).map((v) => (
                              <button
                                key={v}
                                type="button"
                                aria-pressed={votes[a.slug] === v}
                                disabled={!!votes[a.slug]}
                                onClick={() => vote(a.slug, v)}
                                className={`font-medium text-green-active hover:underline disabled:cursor-default disabled:no-underline ${votes[a.slug] && votes[a.slug] !== v ? "opacity-50" : ""}`}
                              >
                                {v === "yes" ? d.yes : d.no}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </section>
        </div>
      )}
      <Toast message={toast.message} icon="check" />
    </div>
  );
}
