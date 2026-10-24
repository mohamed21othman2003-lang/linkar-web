import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "./ui";

// W2-80e · رابط باقة الوكالة · منتهية الصلاحية (State · v2)
export function GiftExpired({ locale }: { locale: Locale }) {
  const t = getGiftDict(locale);
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-3.5 rounded-2xl border border-border-default bg-white px-5 py-8 text-center md:p-10">
      <span className="flex size-16 items-center justify-center rounded-full bg-warning-tile text-deep-charcoal">
        <Icon name="alert" size={28} />
      </span>
      <h1 className="text-h4 text-deep-charcoal md:text-h3">{t.expiredTitle}</h1>
      <p className="max-w-[540px] text-body-m text-text-secondary">{t.expiredBody}</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link href={routes.services} className={actionClass("primary")}>
          {t.browseServices}
          <Icon name="grid" size={16} />
        </Link>
        <Link href={routes.home} className={actionClass("outline")}>
          {t.homePage}
          <Icon name="home" size={16} />
        </Link>
      </div>
    </div>
  );
}

// خلفية صفحات الروابط (Body: #f4f6f5، 56 فوق و96 تحت)
export function GiftBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-tile px-4 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24 xl:px-20 ${className}`}>{children}</div>;
}
