"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { CarSize } from "@/lib/data/booking/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { RadioDot, Toggle } from "./Radio";
import { Summary, VoucherNote } from "./Summary";
import { AddCarModal, ChooseCarModal, type CarCatalog } from "./popups";
import { bookingHref, customCarId, type BookingQuery } from "./query";

export type CarView = { id: string; title: string; meta: string; size: CarSize };

// W2-34b · بياناتك بعد تسجيل الدخول: سيارتك (+ P-24 أضف سيارة) · بيانات التواصل · ملاحظة لمقدّم الخدمة
export function DetailsForm({
  locale,
  query,
  cars: initialCars,
  selectedCar,
  firstName,
  name,
  phone,
  email,
  isNewUser,
  catalog,
  summary,
}: {
  locale: Locale;
  query: BookingQuery;
  cars: CarView[];
  selectedCar: string | null;
  firstName: string;
  name: string;
  phone: string;
  email: string;
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

        <section className="flex flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">{t.yourCar}</h2>
            <p className="text-body-s text-v3-text-meta">{t.carSub}</p>
          </div>
          <div role="radiogroup" className="flex flex-col gap-4">
            {cars.map((c) => {
              const on = c.id === car;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  // النموذج الأولي: الضغط على السيارة يفتح P-15 «اختر سيارتك» (OVERLAY · DISSOLVE 200ms)
                  onClick={() => (setCar(c.id), setChoosing(true))}
                  className={`flex min-h-20 items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-start transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/8" : "border border-border-default bg-white"}`}
                >
                  <span className="flex items-center gap-3">
                    <RadioDot on={on} />
                    {on ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/figma/booking/tile-car.svg" alt="" width={40} height={40} />
                    ) : (
                      <span className="flex size-10 items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/figma/booking/car-outline.svg" alt="" width={25} height={16} />
                      </span>
                    )}
                    <span className="flex flex-col gap-0.5">
                      <span className="text-label-l">{c.title}</span>
                      <span className="text-caption text-v3-text-meta">{c.meta}</span>
                    </span>
                  </span>
                  {on && <span className="text-caption text-green-active max-sm:hidden">{t.priceMatches}</span>}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-12 items-center justify-center gap-1.5 rounded-[14px] border border-border-default text-label-m hover:border-border-strong"
          >
            <Icon name="plus" size={16} />
            {t.addCar}
          </button>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">{t.contact}</h2>
            <p className="text-body-s text-v3-text-meta">{t.contactSub}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-m">{t.name}</span>
              <input defaultValue={name} className="h-[50px] rounded-md border border-border-default px-3.5 text-[16px] font-light outline-none focus:border-deep-charcoal" />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-label-m">{t.phone}</span>
              <span className="flex h-[50px] items-center justify-between gap-2 rounded-md border border-border-default bg-cool-gray/30 px-3.5">
                <span dir="ltr" className="text-[16px] font-light">
                  {phone}
                </span>
                <Icon name="check" size={16} className="text-nature-green" />
              </span>
              <span className="text-caption text-green-active">{t.verified}</span>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-label-m">{t.email}</span>
            <input
              type="email"
              defaultValue={email}
              placeholder={t.emailPh}
              dir="auto"
              className="h-[50px] rounded-md border border-border-default px-3.5 text-[16px] font-light outline-none placeholder:text-v3-text-meta focus:border-deep-charcoal"
            />
          </label>
        </section>

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
