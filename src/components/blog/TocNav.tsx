"use client";

import { useEffect, useState } from "react";

// W2-100b · «في هذا المقال» (TOC 85:48239) — العنصر النشط (خلفية #f1fbe0 + خط أخضر) بيتبع القسم الظاهر وقت السكرول
export function TocNav({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const onScroll = () => {
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top < 160) cur = el.id;
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);
  return (
    <nav aria-label={title} className="flex flex-col gap-1 rounded-xl border border-hairline bg-white p-[22px]">
      <p className="text-[16px]/[26px] font-bold text-deep-charcoal">{title}</p>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <a
            key={it.id}
            href={`#${it.id}`}
            aria-current={on ? "location" : undefined}
            className={`flex items-center gap-2.5 rounded-[10px] px-3 py-[9px] text-[14px]/[22px] transition-colors duration-200 ease-figma-out ${
              on ? "bg-tip-lime font-bold text-green-active" : "font-light text-state-gray hover:bg-tile"
            }`}
          >
            <span aria-hidden className={`h-[18px] w-[3px] shrink-0 rounded-[2px] ${on ? "bg-green-active" : "bg-chip-line"}`} />
            {it.label}
          </a>
        );
      })}
    </nav>
  );
}
