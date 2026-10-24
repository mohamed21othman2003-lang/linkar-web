import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ResolvedBooking } from "@/lib/server/booking";
import type { SummaryRow } from "./Summary";

// يحوّل الحجز لنصوص جاهزة لكارت الملخص
export function summaryModel(
  locale: Locale,
  b: ResolvedBooking,
  opts: { car?: boolean; branchStyle?: "distance" | "city" } = {},
) {
  const t = getBookingDict(locale);
  const branchValue =
    opts.branchStyle === "city"
      ? `${tx(locale, b.branch, "name")}${locale === "ar" ? "، " : ", "}${tx(locale, b.branch, "city")}`
      : `${tx(locale, b.branch, "name")} · ${formatNumber(b.branch.distance_km)} ${t.km}`;
  const rows: SummaryRow[] = [{ label: t.branch, value: branchValue, icon: "branch" }];
  if (opts.car && b.car) rows.push({ label: t.car, value: carTitle(locale, b.car, true), icon: "car" });
  return {
    at: t.bookingAt,
    providerName: tx(locale, b.provider, "name"),
    providerSlug: b.provider.slug,
    providerLogo: b.provider.logo,
    lines: b.lines.map((l) => ({ key: l.key, name: tx(locale, l, "name"), price: formatPrice(locale, l.price) })),
    rows,
  };
}

// «تويوتا كامري 2023» / «تويوتا كامري 2023 · سيدان»
export function carTitle(
  locale: Locale,
  car: { make_ar: string; make_en: string; model_ar: string; model_en: string; year: number; size: "sedan" | "suv" | "large" },
  withSize = false,
) {
  const t = getBookingDict(locale);
  const name = `${tx(locale, car, "make")} ${tx(locale, car, "model")} ${car.year}`;
  return withSize ? `${name} · ${t.sizes[car.size]}` : name;
}
