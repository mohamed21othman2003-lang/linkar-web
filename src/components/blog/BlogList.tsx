"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { PostCard, type PostCardView } from "./PostCard";

// تطبيع بسيط للبحث بالعربي: تجاهل التشكيل والهمزات والتاء المربوطة
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();

// W2-100 · شريط البحث والتصنيفات (Bar 85:48113) + الكروت — الفلترة محلية؛ «الكل» نشطة افتراضياً
export function BlogList({
  categories,
  posts,
  search,
  empty,
  featured,
  pagination,
}: {
  categories: { key: string; label: string }[];
  posts: PostCardView[];
  search: string;
  empty: string;
  featured: React.ReactNode;
  pagination: React.ReactNode;
}) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const query = norm(q);
  const filtered = useMemo(
    () => posts.filter((p) => (cat === "all" || p.category === cat) && (!query || norm(`${p.title} ${p.excerpt} ${p.tag}`).includes(query))),
    [posts, cat, query],
  );
  const showFeatured = cat === "all" && !query;

  return (
    <>
      <div className="flex flex-col-reverse gap-4 lg:h-11 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" className="-mx-4 flex gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => {
            const on = c.key === cat;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setCat(c.key)}
                className={`shrink-0 rounded-full border px-[18px] py-[9px] text-[15px]/[24px] whitespace-nowrap transition-colors duration-200 ease-figma-out ${
                  on ? "border-deep-charcoal bg-deep-charcoal font-bold text-neon-green" : "border-chip-line bg-white font-medium text-deep-charcoal hover:bg-tile"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <label className="flex h-11 w-full shrink-0 items-center gap-2.5 rounded-full border border-chip-line bg-white px-4 focus-within:border-deep-charcoal lg:w-[320px]">
          <Icon name="search" size={18} className="shrink-0 text-state-gray" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={search}
            aria-label={search}
            className="min-w-0 flex-1 bg-transparent text-[15px]/[24px] font-light text-deep-charcoal outline-none placeholder:text-meta-gray [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
      </div>
      {showFeatured && featured}
      {filtered.length ? (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug}>
              <PostCard p={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p aria-live="polite" className="rounded-lg bg-tile px-5 py-6 text-body-m text-state-gray">
          {empty}
        </p>
      )}
      {showFeatured && pagination}
    </>
  );
}
