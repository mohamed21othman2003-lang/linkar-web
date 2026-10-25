import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import type { ActiveGift } from "@/lib/data/gift/gifts";
import { Icon } from "@/components/icons/Icon";
import { Chip } from "./ui";

// كارت الباقة الغامق:
// full    = «Package card» في W2-80 (أيقونة الباقة + 3 شارات + رقم الحجز)
// summary = «Package · ملخص» في W2-80b (عرض 520، شارتين، الصلاحية آخر سطر)
export function PackageCard({ locale, gift, variant }: { locale: Locale; gift: ActiveGift; variant: "full" | "summary" }) {
  const t = getGiftDict(locale);
  const dealer = tx(locale, gift, "dealer");
  const full = variant === "full";

  const valid = (
    <p className="flex items-center gap-2 text-label-m text-neon-green">
      <Icon name="calendar" size={16} className="shrink-0" />
      {t.validUntil(tx(locale, gift, "valid_until"))}
    </p>
  );
  const branch = (
    <p className="flex items-center gap-2 text-body-s text-white/90">
      <Icon name="map-pin" size={16} className="shrink-0 text-white" />
      {tx(locale, gift, "branch")}
    </p>
  );

  return (
    <div className={`flex items-start gap-5 rounded-2xl bg-deep-charcoal p-5 md:p-7 ${full ? "" : "lg:w-[520px] lg:min-w-0 xl:shrink-0"}`}>
      {full && (
        <span className="hidden size-[68px] shrink-0 items-center justify-center rounded-xl bg-neon-green text-deep-charcoal sm:flex">
          <Icon name="package" size={32} />
        </span>
      )}
      <div className={`flex min-w-0 flex-1 flex-col ${full ? "gap-2" : "gap-2.5"}`}>
        <div className="flex flex-wrap gap-2">
          {full && <Chip tone="neon">{t.awaitingVisit}</Chip>}
          {full ? (
            <>
              <Chip tone="glass">{t.fromDealer(dealer)}</Chip>
              <Chip tone="glass">{t.paidByDealer}</Chip>
            </>
          ) : (
            <>
              <Chip tone="glass">{t.paidByDealer}</Chip>
              <Chip tone="glass">{t.fromDealer(dealer)}</Chip>
            </>
          )}
        </div>
        <h2 className="text-h4 text-white md:text-h3">{tx(locale, gift, "package")}</h2>
        <p className="text-body-s text-white/85">
          {full ? t.forYourCar(tx(locale, gift, "car"), gift.booking_no) : t.forYourCarShort(tx(locale, gift, "car"))}
        </p>
        {full ? (
          <>
            {valid}
            {branch}
          </>
        ) : (
          <>
            {branch}
            {valid}
          </>
        )}
      </div>
    </div>
  );
}
