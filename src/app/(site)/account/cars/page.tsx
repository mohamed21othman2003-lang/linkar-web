import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { getSession } from "@/lib/server/session";
import { getCars } from "@/lib/server/account-extra";
import { carColors, carDraft, carLockNote, carMakes, carSizes, carsPage as p, carYears } from "@/lib/data/account/cars-data";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AxNote } from "@/components/account/account-extra-ui";
import { CarsManager } from "@/components/account/cars-manager";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-67 · سياراتي (750:8595) + W2-67b إضافة سيارة (751:9787) كنافذة + P-04 / P-04b / P-10k
// W2-67-0 · حالة فارغة (85:44968) للعميل الجديد
export default async function CarsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const t = getAccountExtra(locale);
  const cars = await getCars(user);

  return (
    <div className="flex flex-col gap-6">
      <CarsManager
        demo={sp.demo === "w2-67b"}
        title={
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h3 text-deep-charcoal">{tx(locale, p, "title")}</h1>
            <p className="text-body-m text-state-gray">{tx(locale, p, "description")}</p>
          </div>
        }
        initial={cars.map((c) => ({
          id: c.id,
          name: tx(locale, c, "name"),
          make: c.make,
          model: c.model,
          year: c.year,
          color: c.color,
          size: c.size,
          plateLetters: tx(locale, c, "plate_letters"),
          plateNumbers: c.plate_numbers,
          lastBooking: tx(locale, c, "last_booking"),
          isDefault: c.is_default,
          upcomingBooking: c.upcoming_booking,
        }))}
        c={{
          addCar: tx(locale, p, "add_car"),
          emptyTitle: tx(locale, p, "empty_title"),
          emptyText: tx(locale, p, "empty_text"),
          lastBooking: tx(locale, p, "last_booking"),
          lockNote: tx(locale, carLockNote, "label"),
          specs: t.carSpecs,
          edit: t.edit,
          del: t.delete,
          cancel: t.cancel,
          close: t.close,
          makeDefault: t.makeDefault,
          default: t.default,
          toastDefault: tx(locale, p, "toast_default"),
          deleteTitle: tx(locale, p, "delete_title"),
          deleteText: tx(locale, p, "delete_text"),
          deleteConfirm: tx(locale, p, "delete_confirm"),
          lockedTitle: tx(locale, p, "locked_title"),
          lockedText: tx(locale, p, "locked_text"),
          lockedCta: tx(locale, p, "locked_cta"),
          modalTitle: tx(locale, p, "modal_title"),
          modalEditTitle: tx(locale, p, "modal_edit_title"),
          modalSubtitle: tx(locale, p, "modal_subtitle"),
          fields: {
            make: tx(locale, p, "field_make"),
            model: tx(locale, p, "field_model"),
            year: tx(locale, p, "field_year"),
            color: tx(locale, p, "field_color"),
            plateNumbers: tx(locale, p, "field_plate_numbers"),
            plateLetters: tx(locale, p, "field_plate_letters"),
          },
          sizeDetected: tx(locale, p, "size_detected"),
          sizeChange: tx(locale, p, "size_change"),
          selectPlaceholder: t.selectPlaceholder,
          makeDefaultCar: tx(locale, p, "make_default"),
          save: tx(locale, p, "save"),
        }}
        o={{
          makes: carMakes.map((m) => ({ key: m.key, label: tx(locale, m, "label"), models: m.models.map((x) => ({ key: x.key, label: tx(locale, x, "label"), size: x.size })) })),
          colors: carColors.map((x) => ({ key: x.key, label: tx(locale, x, "label") })),
          years: carYears,
          sizes: carSizes.map((x) => ({ key: x.key, label: tx(locale, x, "label") })),
          draft: {
            make: carDraft.make,
            model: carDraft.model,
            year: carDraft.year,
            color: carDraft.color,
            plateNumbers: carDraft.plate_numbers,
            plateLetters: tx(locale, carDraft, "plate_letters"),
          },
        }}
      >
        <section className="flex flex-col gap-4 rounded-[20px] border border-dashed border-nature-green/70 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-nature-green/14">
              <Icon name="gift" size={22} className="text-nature-green" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-label-l text-deep-charcoal">{tx(locale, p, "gift_title")}</h2>
              <p className="text-body-s text-state-gray">{tx(locale, p, "gift_text")}</p>
            </div>
          </div>
          <Link
            href={routes.dealerPackages}
            className="inline-flex h-control-md shrink-0 items-center justify-center gap-1.5 self-start rounded-md border border-cool-gray bg-white px-[18px] text-label-m text-deep-charcoal hover:bg-tile sm:self-auto"
          >
            {tx(locale, p, "gift_cta")}
            <Icon name="chevron-left" size={16} flip />
          </Link>
        </section>
        <AxNote>{tx(locale, p, "size_note")}</AxNote>
      </CarsManager>
    </div>
  );
}
