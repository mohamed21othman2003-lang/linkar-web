"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { ServiceSlug } from "@/lib/data/types";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { RadioDot } from "./Radio";
import { Summary, VoucherNote } from "./Summary";
import { LogoTile } from "./LogoTile";

export type BranchView = {
  id: string;
  name: string;
  street: string;
  district: string;
  city: string;
  hours: string;
  distance: string; // «5.6 كم»
  x: number;
  y: number;
  mapsUrl: string;
};

type Mode = "nearest" | "list" | "map";

// W2-33 (الأقرب لموقعك) · W2-33b (من القائمة) · W2-33c (من الخريطة)
export function BranchPicker({
  locale,
  initialMode,
  branches,
  intro,
  provider,
  chips,
  alternatives,
  me,
  summary,
  hrefs,
}: {
  locale: Locale;
  initialMode: Mode;
  branches: BranchView[];
  intro: string;
  provider: { slug: string; name: string; short: string; logo: string };
  chips: { slug: ServiceSlug; label: string }[];
  alternatives: { slug: string; label: string; logo: string; x: number; y: number; href: string }[];
  me: { x: number; y: number };
  summary: Omit<Parameters<typeof Summary>[0]["v"], "rows">;
  hrefs: Record<string, string>;
}) {
  const t = getBookingDict(locale);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selected, setSelected] = useState(branches[0].id);
  const current = branches.find((b) => b.id === selected) ?? branches[0];

  const switchMode = (m: Mode) => {
    setMode(m);
    const url = new URL(window.location.href);
    if (m === "nearest") url.searchParams.delete("mode");
    else url.searchParams.set("mode", m);
    window.history.replaceState(null, "", url.toString().replace(/%2C/g, ","));
  };

  const tabs: { key: Mode; label: string; icon: "navigation" | "menu" | "map-pin" }[] = [
    { key: "nearest", label: t.methods.nearest, icon: "navigation" },
    { key: "list", label: t.methods.list, icon: "menu" },
    { key: "map", label: t.methods.map, icon: "map-pin" },
  ];

  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-h4">{t.chooseBranch}</h2>
          <p className="text-body-s text-v3-text-meta">{intro}</p>
        </div>
        <div role="tablist" className="grid grid-cols-3 gap-1 rounded-[14px] bg-cool-gray/40 p-1">
          {tabs.map((tab) => {
            const on = mode === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => switchMode(tab.key)}
                className={`flex min-h-[42px] items-center justify-center gap-2 rounded-[11px] px-2 text-label-m transition-colors duration-200 ease-figma-out ${on ? "bg-deep-charcoal text-white" : "text-deep-charcoal hover:bg-white/60"}`}
              >
                <Icon name={tab.icon} size={16} className={`max-sm:hidden ${on ? "text-neon-green" : "text-solid-black"}`} />
                <span className="truncate max-sm:whitespace-normal max-sm:text-center max-sm:text-[12px] max-sm:leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {mode === "nearest" && <NearestList t={t} branches={branches} selected={selected} onSelect={setSelected} />}
        {mode === "list" && <ListMode t={t} branches={branches} selected={selected} onSelect={setSelected} />}
        {mode === "map" && (
          <MapMode
            t={t}
            branches={branches}
            selected={selected}
            onSelect={setSelected}
            provider={provider}
            chips={chips}
            alternatives={alternatives}
            me={me}
          />
        )}
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

function NearestList({ t, branches, selected, onSelect }: { t: T; branches: BranchView[]; selected: string; onSelect: (id: string) => void }) {
  const [nearest, ...others] = branches;
  const on = selected === nearest.id;
  return (
    <div role="radiogroup" className="flex flex-col gap-4">
      <div
        role="radio"
        aria-checked={on}
        tabIndex={0}
        onClick={() => onSelect(nearest.id)}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), onSelect(nearest.id))}
        className={`flex cursor-pointer items-start justify-between gap-3.5 rounded-lg p-4 md:px-[18px] transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/10" : "border border-border-default bg-white"}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <RadioDot on={on} />
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label-l">
                {nearest.name} · {nearest.distance}
              </span>
              <span className="rounded-full bg-deep-charcoal px-2 py-0.5 text-caption text-neon-green">{t.nearestTag}</span>
            </div>
            <span className="text-body-s text-v3-text-meta">{[nearest.street, nearest.district, nearest.city].filter(Boolean).join("، ")}</span>
            {nearest.hours && <span className="text-caption text-green-active">{nearest.hours}</span>}
          </div>
        </div>
        <a
          href={nearest.mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center gap-1 self-center text-caption text-v3-text-meta hover:text-deep-charcoal"
        >
          {t.directions}
          <Icon name="navigation" size={14} className="text-state-gray" />
        </a>
      </div>
      {others.length > 0 && <p className="text-label-m text-v3-text-meta">{t.otherBranches}</p>}
      {others.map((b) => (
        <BranchRow key={b.id} b={b} on={selected === b.id} onSelect={onSelect} />
      ))}
    </div>
  );
}

function BranchRow({ b, on, onSelect }: { b: BranchView; on: boolean; onSelect: (id: string) => void }) {
  return (
    <div
      role="radio"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onSelect(b.id)}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), onSelect(b.id))}
      className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-lg px-4 py-3.5 md:px-[18px] transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/10" : "border border-border-default bg-white"}`}
    >
      <RadioDot on={on} />
      <div className="flex flex-col gap-0.5">
        <span className="text-label-l">
          {b.name} · {b.distance}
        </span>
        <span className="text-caption text-v3-text-meta">{[b.street, b.district].filter(Boolean).join("، ")}</span>
      </div>
    </div>
  );
}

function ListMode({ t, branches, selected, onSelect }: { t: T; branches: BranchView[]; selected: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const districts = useMemo(() => [...new Set(branches.map((b) => b.district).filter(Boolean))], [branches]);
  const city = branches[0].city;
  const current = branches.find((b) => b.id === selected) ?? branches[0];
  const shown = branches.filter(
    (b) => (!district || b.district === district) && (!q || `${b.name} ${b.district} ${b.street}`.includes(q.trim())),
  );
  const field = "flex h-[50px] w-full items-center justify-between rounded-md border bg-white px-3.5 text-[16px] font-light leading-7";
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-label-m">{t.branchField}</span>
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`${field} border-2 border-deep-charcoal`}>
            <span>{current.name}</span>
            <Icon name="chevron-down" size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-label-m">{t.district}</span>
          <span className="relative">
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className={`${field} appearance-none border-border-default pe-10`}>
              <option value="">{t.allDistricts}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} className="pointer-events-none absolute end-3.5 top-4" />
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label-m">{t.city}</span>
          <span className="relative">
            <select defaultValue={city} className={`${field} appearance-none border-border-default pe-10`}>
              <option value={city}>{city}</option>
            </select>
            <Icon name="chevron-down" size={18} className="pointer-events-none absolute end-3.5 top-4" />
          </span>
        </label>
      </div>
      {open && (
        <div className="flex flex-col rounded-[14px] border border-border-default bg-white p-1.5 shadow-elevation-2">
          <label className="flex items-center gap-2 rounded-[10px] bg-cool-gray/30 px-3 py-2.5">
            <Icon name="search" size={18} className="text-nature-green" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchBranch}
              className="w-full bg-transparent text-body-s outline-none placeholder:text-v3-text-meta"
            />
          </label>
          <ul role="listbox" className="flex flex-col">
            {shown.map((b) => {
              const on = b.id === selected;
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => onSelect(b.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[10px] p-3 text-start transition-colors duration-150 ease-figma-out ${on ? "bg-neon-green/14" : "hover:bg-tile"}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-[18px] items-center justify-center">{on && <Icon name="check" size={18} className="text-nature-green" />}</span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-label-l">{b.name}</span>
                        <span className="text-caption text-v3-text-meta">{[b.street, b.district].filter(Boolean).join("، ")}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-label-m">{b.distance}</span>
                  </button>
                </li>
              );
            })}
            {!shown.length && <li className="p-3 text-caption text-text-secondary">{t.noBranches}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function MapMode({
  t,
  branches,
  selected,
  onSelect,
  provider,
  chips,
  alternatives,
  me,
}: {
  t: T;
  branches: BranchView[];
  selected: string;
  onSelect: (id: string) => void;
  provider: { slug: string; name: string; short: string; logo: string };
  chips: { slug: ServiceSlug; label: string }[];
  alternatives: { slug: string; label: string; logo: string; x: number; y: number; href: string }[];
  me: { x: number; y: number };
}) {
  const [scope, setScope] = useState<"all" | "provider">("all");
  const current = branches.find((b) => b.id === selected) ?? branches[0];
  // الخريطة رسم ثابت (ما بيتعكسش مع اتجاه اللغة) ← إحداثيات من اليسار
  const pos = (x: number, y: number) => ({ left: `${x}%`, top: `${y}%` });
  // الموبايل: الخريطة أعرض من الشاشة (680) وبتتسحب أفقياً — نبدأ وموقعك في النص
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mapRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (me.x / 100) * el.scrollWidth - el.clientWidth / 2;
  }, [me.x]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col-reverse items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" className="flex rounded-md bg-cool-gray/40 p-1">
            {(
              [
                ["provider", t.fill(t.scopeProvider, { provider: provider.short, n: branches.length })],
                ["all", t.scopeAll],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={scope === key}
                onClick={() => setScope(key)}
                className={`rounded-[9px] px-3 py-[7px] text-label-m transition-colors duration-200 ease-figma-out ${scope === key ? "bg-deep-charcoal text-white" : "text-deep-charcoal"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {chips.map((c) => (
            <span key={c.slug} className="flex items-center gap-1.5 rounded-full border border-neon-green bg-neon-green/20 px-2.5 py-1.5 text-caption">
              <ServiceGlyph name={c.slug} size={16} className="text-deep-charcoal" />
              {c.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSelect(branches[0].id)}
          className="flex items-center gap-1.5 self-start rounded-[10px] border border-border-default bg-white px-3 py-2 text-label-m lg:self-auto"
        >
          <Icon name="navigation" size={16} className="text-solid-black" />
          {t.nearMe}
        </button>
      </div>

      <div ref={mapRef} dir="ltr" className="overflow-x-auto overscroll-x-contain rounded-[18px] [scrollbar-width:none]">
        <div className="relative h-[320px] overflow-hidden rounded-[18px] bg-map-canvas max-md:w-[680px] max-md:whitespace-nowrap md:h-[420px]">
          {/* خلفية الخريطة من فيكتورات الفيجما (W2-33c · Map 806×420): ماء + طرق + حديقة */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/booking/map-bg.svg" alt="" aria-hidden className="absolute inset-0 size-full object-cover object-left" />
          {scope === "all" &&
            alternatives.map((a) => (
              <Link
                key={a.slug}
                href={a.href}
                style={pos(a.x, a.y)}
                dir="auto"
                className="absolute flex items-center gap-1.5 rounded-full border border-border-default bg-white/92 py-1 ps-1 pe-2.5 text-caption text-v3-text-meta opacity-85 shadow-elevation-2 hover:opacity-100"
              >
                <LogoTile slug={a.slug} src={a.logo} alt="" size={22} />
                {a.label}
              </Link>
            ))}
          {branches.map((b) => {
            const on = b.id === selected;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelect(b.id)}
                aria-pressed={on}
                dir="auto"
                style={pos(b.x, b.y)}
                className={`absolute flex items-center gap-1.5 rounded-full py-1 ps-1 pe-2.5 text-caption shadow-elevation-2 ${on ? "z-10 bg-deep-charcoal text-neon-green" : "border border-border-default bg-white text-deep-charcoal"}`}
              >
                <LogoTile slug={provider.slug} src={provider.logo} alt="" size={26} />
                {b.name}
              </button>
            );
          })}
          <span style={pos(me.x, me.y)} className="absolute size-4 rounded-full border-[5px] border-neon-green bg-deep-charcoal" />
          <span style={{ left: `calc(${me.x}% - 18px)`, top: `calc(${me.y}% + 22px)` }} className="absolute rounded-full bg-deep-charcoal px-2 py-[3px] text-caption text-white">
            {t.me}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 rounded-[20px] border-2 border-neon-green bg-neon-green/10 px-[18px] py-3.5">
        <span className="text-label-l">
          {current.name} · {current.distance}
        </span>
        <span className="text-caption text-v3-text-meta">
          {[current.street, current.district].filter(Boolean).join("، ")}
          {current.hours ? ` · ${current.hours.split(" · ")[0]}` : ""}
        </span>
      </div>
      <p className="flex items-center gap-2 rounded-md bg-cool-gray/30 px-3 py-2.5 text-caption">
        <Icon name="info" size={16} className="shrink-0 text-state-gray" />
        {t.switchNote}
      </p>
    </div>
  );
}
