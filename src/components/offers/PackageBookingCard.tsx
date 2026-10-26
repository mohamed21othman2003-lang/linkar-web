"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { VoucherNote } from "@/components/booking/Summary";
import { AddCarModal, ChooseCarModal, type CarCatalog, type CarOption } from "@/components/booking/popups";
import { bookingHref, customCarId, type BookingQuery } from "@/components/booking/query";

// Booking card في W2-42: سيارتك (تغيير ← P-15) · الفرع الأقرب (تغيير ← خطوة الفرع) · تشمل الباقة · سعر الباقة · متابعة ← خطوة الفرع
export function PackageBookingCard({
  locale,
  query,
  cars: initialCars,
  items,
  total,
  totalTitle,
  totalSub,
  catalog,
  branch,
}: {
  locale: Locale;
  query: BookingQuery;
  cars: (CarOption & { label: string })[];
  items: { name: string; price: string; free: boolean }[];
  total: string;
  totalTitle: string;
  totalSub: string;
  catalog: CarCatalog;
  // تصميم العميل المعدّل (85:37809): صندوق الفرع الأقرب تحت السيارة
  branch?: { name: string; meta: string };
}) {
  const t = getBookingDict(locale);
  const [cars, setCars] = useState(initialCars);
  const [car, setCar] = useState(initialCars[0]?.id ?? "");
  const [dialog, setDialog] = useState<null | "choose" | "add">(null);
  const current = cars.find((c) => c.id === car);
  return (
    <aside className="flex w-full flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-6 shadow-elevation-2 lg:w-[400px] lg:shrink-0">
      <div className="flex flex-col gap-1.5">
        <span className="text-label-m">{t.yourCar}</span>
        <div className="flex h-[52px] items-center justify-between gap-2 rounded-md border border-border-default bg-white px-3.5">
          <span className="text-label-l">{current?.label}</span>
          <button type="button" onClick={() => setDialog("choose")} className="text-label-m text-green-active hover:underline">
            {t.change}
          </button>
        </div>
        <span className="text-caption text-v3-text-meta">{t.priceByCar}</span>
      </div>
      <hr className="border-border-default" />
      {branch && (
        // Branch: ليموني 12% + حد ليموني 1، r14، 12/14 — الاسم + دبوس أخضر، والمسافة بالأخضر الغامق
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-neon-green bg-neon-green/12 px-3.5 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-label-l">
              <Icon name="map-pin" size={16} className="shrink-0 text-nature-green" />
              {branch.name}
            </span>
            <span className="text-label-m text-green-active">{branch.meta}</span>
          </div>
          <Link href={bookingHref(routes.bookingBranch, { ...query, car: car || undefined })} className="shrink-0 text-label-m text-green-active hover:underline">
            {t.change}
          </Link>
        </div>
      )}
      <span className="text-label-m text-v3-text-meta">{t.packageIncludes}</span>
      {items.map((i) => (
        <div key={i.name} className="flex items-center justify-between gap-2.5 rounded-[20px] border-2 border-neon-green bg-neon-green/6 px-3 py-2.5">
          <span className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-[6px] bg-neon-green">
              <Icon name="check" size={14} />
            </span>
            <span className="text-body-s">{i.name}</span>
          </span>
          <span className={`text-label-m ${i.free ? "text-green-active" : ""}`}>{i.price}</span>
        </div>
      ))}
      <hr className="border-border-default" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-label-l">{totalTitle}</span>
          <span className="text-caption text-v3-text-meta">{totalSub}</span>
        </div>
        <span className="shrink-0 text-h4">{total}</span>
      </div>
      <span className="text-caption text-v3-text-meta">{t.bookedTogether}</span>
      <Link
        href={bookingHref(routes.bookingBranch, { ...query, car: car || undefined })}
        className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green text-label-l transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
      >
        {t.continue}
        <Icon name="chevron-left" size={18} flip />
      </Link>
      <VoucherNote text={t.voucherNote} />

      <ChooseCarModal
        key={car}
        locale={locale}
        open={dialog === "choose"}
        cars={cars}
        value={car}
        onClose={() => setDialog(null)}
        onAdd={() => setDialog("add")}
        onConfirm={(id) => (setCar(id), setDialog(null))}
      />
      <AddCarModal
        locale={locale}
        open={dialog === "add"}
        catalog={catalog}
        onClose={() => setDialog(null)}
        onAdd={(c) => {
          const id = customCarId(c);
          const title = `${c.make} ${c.model} ${c.year}`;
          setCars((l) => [...l.filter((x) => x.id !== id), { id, title, meta: t.sizes[c.size], label: `${title} · ${t.sizes[c.size]}` }]);
          setCar(id);
          setDialog(null);
        }}
      />
    </aside>
  );
}
