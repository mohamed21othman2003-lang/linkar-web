"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { Icon } from "@/components/icons/Icon";
import { RadioDot } from "./Radio";
import { Summary, VoucherNote } from "./Summary";

export type BranchView = {
  id: string;
  name: string;
  street: string;
  district: string;
  city: string;
  hours: string;
  distance: string; // «5.6 كم»
  mapsUrl: string;
};

// W2-33 · الفرع · الأقرب لموقعك (تلقائي): الفرع الأقرب مختار تلقائياً + «فروع أخرى» مرتّبة حسب المسافة
// (نسخة العميل شالت تبويبات «من القائمة» و«من الخريطة» — W2-33b / W2-33c)
export function BranchPicker({
  locale,
  branches,
  intro,
  summary,
  hrefs,
}: {
  locale: Locale;
  branches: BranchView[];
  intro: string;
  summary: Omit<Parameters<typeof Summary>[0]["v"], "rows">;
  hrefs: Record<string, string>;
}) {
  const t = getBookingDict(locale);
  const [selected, setSelected] = useState(branches[0].id);
  const current = branches.find((b) => b.id === selected) ?? branches[0];
  const [nearest, ...others] = branches;

  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-h4">{t.chooseBranch}</h2>
          <p className="text-[14px] leading-6 font-light text-v3-text-meta">{intro}</p>
        </div>
        <div role="radiogroup" aria-label={t.chooseBranch} className="flex flex-col gap-4">
          <BranchOption t={t} b={nearest} on={selected === nearest.id} onSelect={setSelected} nearest />
          {others.length > 0 && <p className="text-label-m text-v3-text-meta">{t.otherBranches}</p>}
          {others.map((b) => (
            <BranchOption key={b.id} t={t} b={b} on={selected === b.id} onSelect={setSelected} />
          ))}
        </div>
      </section>

      <Summary
        v={{ ...summary, rows: [{ label: t.branch, value: `${current.name} · ${current.distance}`, icon: "branch" }] }}
        cta={
          <Link
            href={hrefs[current.id]}
            className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green text-label-l text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
          >
            {t.continue}
            <Icon name="chevron-left" size={18} flip />
          </Link>
        }
        footer={<VoucherNote text={t.voucherNote} />}
      />
    </>
  );
}

type T = ReturnType<typeof getBookingDict>;

// كارت فرع: الأقرب (Auto branch · 806×139) فيه وسم «الأقرب لموقعك» + العنوان كامل + المواعيد + «الاتجاهات»؛
// الباقي (Branch · 806×104) اسم + المسافة + العنوان. المختار: حدود ليموني 2px وخلفية ليموني 10%
function BranchOption({ t, b, on, onSelect, nearest = false }: { t: T; b: BranchView; on: boolean; onSelect: (id: string) => void; nearest?: boolean }) {
  return (
    <div
      role="radio"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onSelect(b.id)}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), onSelect(b.id))}
      className={`flex cursor-pointer items-center justify-between gap-3.5 rounded-lg px-4 md:px-[18px] transition-colors duration-200 ease-figma-out ${nearest ? "py-4" : "min-h-[104px] py-[13px]"} ${on ? "border-2 border-neon-green bg-neon-green/10" : "border border-cool-gray bg-white"}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <RadioDot on={on} />
        <div className={`flex min-w-0 flex-col ${nearest ? "gap-[3px]" : "gap-0.5"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-l">{b.name}</span>
            {nearest && <span className="rounded-full bg-deep-charcoal px-2 py-0.5 text-[14px] leading-[22px] font-light text-neon-green">{t.nearestTag}</span>}
          </div>
          <span className="text-[14px] leading-[22px] font-medium text-green-active">{t.fill(t.distanceFromYou, { d: b.distance })}</span>
          <span className={`text-[14px] font-light text-v3-text-meta ${nearest ? "leading-6" : "leading-[22px]"}`}>
            {(nearest ? [b.street, b.district, b.city] : [b.street, b.district]).filter(Boolean).join("، ")}
          </span>
          {nearest && b.hours && <span className="text-[14px] leading-[22px] font-light text-green-active">{b.hours}</span>}
        </div>
      </div>
      {nearest && (
        <a
          href={b.mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center gap-1 text-[14px] leading-[22px] font-light text-v3-text-meta hover:text-deep-charcoal"
        >
          {t.directions}
          <Icon name="navigation" size={14} className="text-state-gray" />
        </a>
      )}
    </div>
  );
}
