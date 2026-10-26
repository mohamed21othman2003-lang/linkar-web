"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { CarSize } from "@/lib/data/booking/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Toggle } from "./Radio";
import { Summary, VoucherNote } from "./Summary";
import { AddCarModal, ChooseCarModal, type CarCatalog } from "./popups";
import { bookingHref, customCarId, type BookingQuery } from "./query";

export type CarView = { id: string; title: string; meta: string; size: CarSize };

// W2-34b · بياناتك بعد تسجيل الدخول (نسخة العميل): تم التحقق · شريط «سيارتك» (تغيير ← P-15، أضف ← P-24) · ملاحظة لمقدّم الخدمة
export function DetailsForm({
  locale,
  query,
  cars: initialCars,
  selectedCar,
  firstName,
  isNewUser,
  catalog,
  summary,
}: {
  locale: Locale;
  query: BookingQuery;
  cars: CarView[];
  selectedCar: string | null;
  firstName: string;
  isNewUser: boolean;
  catalog: CarCatalog;
  summary: Omit<Parameters<typeof Summary>[0]["v"], "totalNote">;
}) {
  const t = getBookingDict(locale);
  const [cars, setCars] = useState(initialCars);
  const [car, setCar] = useState<string | null>(selectedCar ?? initialCars[0]?.id ?? null);
  const [adding, setAdding] = useState(isNewUser && initialCars.length === 0);
  const [choosing, setChoosing] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const current = cars.find((c) => c.id === car);
  const payHref = bookingHref(routes.bookingPayment, { ...query, car: car ?? undefined });

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <p className="flex items-center gap-2.5 rounded-[14px] bg-neon-green/14 px-4 py-3 text-label-m">
          <Icon name="check" size={18} className="text-nature-green" />
          {t.fill(t.verifiedBanner, { name: firstName })}
        </p>

        {/* Car summary · السيارة المختارة (من «سياراتي») + «تغيير» يفتح P-15 «اختر سيارتك» */}
        <div className="flex min-h-[51px] items-center justify-between gap-2.5 rounded-[14px] bg-neon-green/14 px-4 py-3">
          <Icon name="car" size={18} className="shrink-0 text-deep-charcoal" />
          <span className="min-w-0 text-label-m">{current ? t.fill(t.carBanner, { car: `${current.title} · ${t.sizes[current.size]}` }) : t.addYourCar}</span>
          <button
            type="button"
            onClick={() => (current ? setChoosing(true) : setAdding(true))}
            className="shrink-0 text-label-m text-green-active hover:underline"
          >
            {current ? t.change : t.addCarShort}
          </button>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <h2 className="text-h4">{t.noteTitle}</h2>
          <textarea
            rows={3}
            placeholder={t.notePh}
            className="min-h-24 resize-y rounded-md border border-border-default p-3.5 text-body-s outline-none placeholder:text-v3-text-meta focus:border-deep-charcoal"
          />
          <div className="flex items-center gap-2.5 text-body-s">
            <Toggle on={whatsapp} onChange={setWhatsapp} label={t.whatsapp} />
            {t.whatsapp}
          </div>
        </section>
      </div>

      <Summary
        v={{ ...summary, totalNote: t.fill(t.totalNote, { size: t.sizes[current?.size ?? "sedan"] }) }}
        cta={
          car ? (
            <Link href={payHref} className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green text-label-l text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed">
              {t.continueToPay}
              <Icon name="chevron-left" size={18} flip />
            </Link>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green text-label-l">
              {t.addCar}
            </button>
          )
        }
        footer={<VoucherNote text={t.voucherNote} />}
      />

      <ChooseCarModal
        key={car ?? "none"}
        locale={locale}
        open={choosing}
        cars={cars}
        value={car ?? ""}
        onClose={() => setChoosing(false)}
        onAdd={() => (setChoosing(false), setAdding(true))}
        onConfirm={(id) => (setCar(id), setChoosing(false))}
      />
      <AddCarModal
        locale={locale}
        open={adding}
        accountCreated={isNewUser}
        catalog={catalog}
        onClose={() => setAdding(false)}
        onAdd={(c) => {
          const id = customCarId(c);
          const meta = [t.sizes[c.size], c.color, c.plate].filter(Boolean).join(" · ");
          setCars((list) => [...list.filter((x) => x.id !== id), { id, title: `${c.make} ${c.model} ${c.year}`, meta, size: c.size }]);
          setCar(id);
          setAdding(false);
        }}
      />
    </>
  );
}
