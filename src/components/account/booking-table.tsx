"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import type {
  BookingCar,
  BookingRowAction,
  BookingStatus,
  BookingTab,
} from "@/lib/data/account/bookings";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { BrandIcon, ProviderTile, StatusDotPill } from "./account-ui";
import { FilterDropdown } from "./booking-dropdown";

export type BookingRowView = {
  id: string;
  status: BookingStatus;
  tab: BookingTab;
  providerSlug: string;
  provider: string;
  services: string;
  date: string;
  dateIso: string;
  branch: string;
  car: string;
  carKey: BookingCar;
  amount: string;
  action: BookingRowAction;
  hasDetail: boolean;
};

type Period = "3m" | "6m" | "year" | "all";
type TabKey = "all" | BookingTab;

const tabOrder: TabKey[] = ["all", "upcoming", "completed", "cancelled"];
// عرض الأعمدة في الفيجما (976): رقم الحجز 96 · مقدّم الخدمة مرن · التاريخ 176 · السيارة 96 · المبلغ 84 · الحالة 140 · الأزرار 136
const cols = "grid grid-cols-[96px_minmax(0,1fr)_176px_96px_84px_140px_136px]";

function inPeriod(iso: string, p: Period) {
  if (p === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  if (p === "year") return d.getFullYear() === now.getFullYear();
  const from = new Date(now);
  from.setMonth(from.getMonth() - (p === "3m" ? 3 : 6));
  return d >= from;
}

// W2-38 · حجوزاتي · جدول + «W2-38 · تبويبات» (1132:33799): التبويبات والفلاتر والبحث بتشتغل في المتصفح
export function BookingTable({
  locale,
  rows,
  cars,
  initialTab,
}: {
  locale: Locale;
  rows: BookingRowView[];
  cars: { key: BookingCar; label: string }[];
  initialTab: TabKey;
}) {
  const t = getAccountDict(locale).bookings;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [period, setPeriod] = useState<Period>("3m");
  const [car, setCar] = useState<BookingCar | "all">("all");
  const [q, setQ] = useState("");

  const selectTab = (k: TabKey) => {
    setTab(k);
    // الرابط يفضل قابل للمشاركة (routes.bookings(tab)) من غير إعادة تحميل
    window.history.replaceState(
      null,
      "",
      routes.bookings(k === "all" ? undefined : k),
    );
  };

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: rows.length,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    };
    rows.forEach((r) => c[r.tab]++);
    return c;
  }, [rows]);

  const inTab = rows.filter((r) => tab === "all" || r.tab === tab);
  const needle = q.trim().toLowerCase();
  const visible = inTab.filter(
    (r) =>
      inPeriod(r.dateIso, period) &&
      (car === "all" || r.carKey === car) &&
      (!needle ||
        r.id.toLowerCase().includes(needle) ||
        r.provider.toLowerCase().includes(needle)),
  );

  // card: في الكروت (موبايل/تابلت) الزر 40px على الأقل عشان يبقى سهل اللمس
  const action = (r: BookingRowView, card = false) => {
    const dark =
      r.action === "voucher" || r.action === "track" || r.action === "rate";
    const cls = `rounded-sm text-caption whitespace-nowrap ${card ? "flex h-10 items-center px-4" : "px-2.5 py-1.5"} ${
      dark
        ? "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle"
        : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
    }`;
    // «الفاتورة» في الفيجما بتودّي W2-68 (طرق الدفع)
    const href =
      r.action === "invoice"
        ? routes.paymentMethods
        : r.action === "voucher"
        ? routes.voucher(r.id)
        : r.action === "rate"
          ? routes.bookingReview(r.id)
          : routes.booking(r.id);
    return (
      <Link href={href} className={cls}>
        {t.actions[r.action]}
      </Link>
    );
  };

  const chevron = (r: BookingRowView, card = false) =>
    r.hasDetail ? (
      <Link
        href={routes.booking(r.id)}
        aria-label={`${t.actions.details} ${r.id}`}
        className={`text-state-gray hover:text-deep-charcoal ${card ? "-me-3 flex size-10 items-center justify-center" : ""}`}
      >
        <Icon name="chevron-left" size={16} flip />
      </Link>
    ) : (
      <span className="size-4" />
    );

  return (
    <div className="flex flex-col gap-5">
      {/* شريط التبويبات + الفلاتر: التبويبات كبسولة مجزّأة (كل تبويب سطر واحد والعدد في شارة)،
          والفلاتر بتنزل سطر لوحدها لما المساحة متكفيش بدل ما التبويبات تتزنق وتلف */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] bg-cool-gray/40 p-1 [scrollbar-width:none]">
          {tabOrder.map((k) => {
            const on = k === tab;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => selectTab(k)}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] ps-4 pe-3 text-label-m whitespace-nowrap transition-colors duration-200 ease-figma-out ${
                  on ? "bg-deep-charcoal text-neon-green shadow-elevation-1" : "text-deep-charcoal hover:bg-white/70"
                }`}
              >
                {t.tabs[k]}
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-caption tabular-nums ${
                    on ? "bg-neon-green text-deep-charcoal" : "bg-white text-state-gray"
                  }`}
                >
                  {counts[k]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label className="flex min-w-0 basis-full items-center gap-2 rounded-md border border-cool-gray bg-white px-3 py-[9px] focus-within:border-deep-charcoal sm:w-[252px] sm:basis-auto">
            <BrandIcon name="brand-search" size={18} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="min-w-0 flex-1 bg-transparent text-body-s text-deep-charcoal outline-none placeholder:text-state-gray"
            />
          </label>
          <FilterDropdown
            label={t.car}
            value={car}
            onChange={setCar}
            options={[
              { value: "all" as const, label: t.allCars },
              ...cars.map((c) => ({ value: c.key, label: c.label })),
            ]}
          />
          <FilterDropdown
            label={t.period}
            value={period}
            onChange={setPeriod}
            options={(["3m", "6m", "year", "all"] as Period[]).map((p) => ({
              value: p,
              label: t.periods[p],
            }))}
          />
        </div>
      </div>

      {/* المحتوى بيتبدّل بـ DISSOLVE 200ms EASE_OUT زي «W2-38 · تبويبات» */}
      <div key={tab} className="flex animate-dissolve flex-col gap-5">
        {/* الجدول (ديسكتوب ≥1400) — أعمدته الثابتة 752px: على 1280 المحتوى 816 بس فعمود مقدّم الخدمة بيتزنق
            (≈60px) والنصوص بتركب على العمود اللي جنبه، فتحت 1400 بنعرض الكروت */}
        <div className="hidden overflow-hidden rounded-[20px] border border-cool-gray bg-white min-[1400px]:block">
          <div
            className={`${cols} h-11 items-center bg-cool-gray/30 px-3 text-label-m text-state-gray`}
          >
            <span className="px-1.5">{t.cols.id}</span>
            <span className="truncate px-1.5">{t.cols.provider}</span>
            <span className="truncate px-1.5">{t.cols.date}</span>
            <span className="px-1.5">{t.cols.car}</span>
            <span className="px-1.5">{t.cols.amount}</span>
            <span className="px-1.5">{t.cols.status}</span>
            <span />
          </div>
          {visible.map((r) => (
            <div
              key={r.id}
              className={`${cols} h-[76px] items-center border-t border-cool-gray px-3 ${r.status === "waiting" ? "bg-neon-green/6" : ""}`}
            >
              <span className="px-1.5 text-body-s text-deep-charcoal">
                {r.id}
              </span>
              <span className="flex min-w-0 items-center gap-2 px-1.5">
                <ProviderTile slug={r.providerSlug} alt="" size={34} />
                <span className="flex min-w-0 flex-col gap-0.5 text-[14px] leading-[22px]">
                  <span className="truncate font-medium text-deep-charcoal">
                    {r.provider}
                  </span>
                  <span className="truncate font-light text-state-gray">
                    {r.services}
                  </span>
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 px-1.5 text-[14px] leading-[22px]">
                <span className="truncate font-medium text-deep-charcoal">{r.date}</span>
                <span className="truncate font-light text-state-gray">{r.branch}</span>
              </span>
              <span className="truncate px-1.5 text-body-s text-deep-charcoal">
                {r.car}
              </span>
              <span className="px-1.5 text-body-s whitespace-nowrap text-deep-charcoal">
                {r.amount}
              </span>
              <span className="px-1.5">
                <StatusDotPill
                  status={r.status}
                  label={getAccountDict(locale).status[r.status]}
                />
              </span>
              <span className="flex items-center justify-end gap-1.5 px-1.5">
                {chevron(r)}
                {action(r)}
              </span>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="border-t border-cool-gray px-5 py-8 text-center text-body-s text-state-gray">
              {t.noResults}
            </p>
          )}
        </div>

        {/* كروت (موبايل وتابلت ولابتوب لحد 1400) — عمودين من التابلت */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 min-[1400px]:hidden">
          {visible.map((r) => (
            <div
              key={r.id}
              className={`flex flex-col gap-3 rounded-[20px] border border-cool-gray p-4 ${r.status === "waiting" ? "bg-tint-lime" : "bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-label-m text-deep-charcoal">{r.id}</span>
                <StatusDotPill
                  status={r.status}
                  label={getAccountDict(locale).status[r.status]}
                />
              </div>
              <div className="flex items-center gap-2">
                <ProviderTile slug={r.providerSlug} alt="" size={34} />
                <span className="flex min-w-0 flex-col text-[14px] leading-[22px]">
                  <span className="font-medium text-deep-charcoal">
                    {r.provider}
                  </span>
                  <span className="font-light text-state-gray">
                    {r.services}
                  </span>
                </span>
              </div>
              {/* المبلغ سطر لوحده: لما كان في آخر نفس السطر كانت «·» بتفضل معلّقة، و<bdi> عشان «ES 2022» ماتقلبش ترتيب الفواصل */}
              <div className="flex flex-col gap-0.5">
                <p className="text-body-s text-state-gray">
                  {r.date} · {r.branch} · <bdi>{r.car}</bdi>
                </p>
                <span className="text-label-m whitespace-nowrap text-deep-charcoal">
                  {r.amount}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                {action(r, true)}
                {chevron(r, true)}
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="rounded-[20px] border border-cool-gray bg-white px-5 py-8 text-center text-body-s text-state-gray md:col-span-2">
              {t.noResults}
            </p>
          )}
        </div>
      </div>

      {/* الترقيم */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption text-state-gray">
          {t.showing(visible.length, visible.length, tab === "all")}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled
            aria-label={t.prev}
            className="flex size-9 items-center justify-center rounded-[10px] border border-cool-gray bg-white text-state-gray max-md:size-10"
          >
            <Icon name="chevron-right" size={16} flip />
          </button>
          <span
            aria-current="page"
            className="flex size-9 items-center justify-center rounded-[10px] bg-deep-charcoal text-label-m text-neon-green max-md:size-10"
          >
            1
          </span>
          <button
            type="button"
            disabled
            aria-label={t.next}
            className="flex size-9 items-center justify-center rounded-[10px] border border-cool-gray bg-white text-state-gray max-md:size-10"
          >
            <Icon name="chevron-left" size={16} flip />
          </button>
        </div>
      </div>
    </div>
  );
}
