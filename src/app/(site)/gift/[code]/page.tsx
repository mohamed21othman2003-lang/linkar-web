import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import { getGift, getGiftCodes } from "@/lib/server/gift";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { PackageCard } from "@/components/gift/PackageCard";
import { GiftBody, GiftExpired } from "@/components/gift/GiftExpired";
import { actionClass } from "@/components/gift/ui";

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return (await getGiftCodes()).map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ code }, locale] = await Promise.all([params, getLocale()]);
  const gift = await getGift(code);
  const t = getGiftDict(locale);
  if (!gift) return {};
  if (gift.status === "expired") return { title: t.meta.expired, robots: { index: false } };
  return { title: tx(locale, gift, "title"), description: tx(locale, gift, "subtitle"), robots: { index: false } };
}

// W2-80 · رابط باقة الوكالة · صفحة الباقة (757:11310) — والكود المنتهي بيعرض W2-80e
export default async function GiftPage({ params }: Props) {
  const [{ code }, locale] = await Promise.all([params, getLocale()]);
  const gift = await getGift(code);
  if (!gift) notFound();
  const t = getGiftDict(locale);

  if (gift.status === "expired") {
    return (
      <GiftBody>
        <GiftExpired locale={locale} />
      </GiftBody>
    );
  }

  return (
    <GiftBody>
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5">
        <p className="flex items-center gap-2 text-caption text-text-secondary">
          <Icon name="message" size={16} className="shrink-0" />
          {t.via(tx(locale, gift.recipient, "name"))}
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, gift, "title")}</h1>
          <p className="text-body-m text-text-secondary md:text-body-l">{tx(locale, gift, "subtitle")}</p>
        </div>

        <PackageCard locale={locale} gift={gift} variant="full" />

        <section className="flex flex-col gap-2.5 rounded-xl border border-border-default bg-white p-6">
          <h2 className="text-h5 text-deep-charcoal">{t.includesTitle}</h2>
          <ul className="flex flex-col gap-2.5">
            {gift.includes.map((i) => (
              <li key={i.label_ar} className="flex items-center gap-2 text-body-m text-deep-charcoal">
                <Icon name="check" size={16} className="shrink-0 text-nature-green" />
                {tx(locale, i, "label")}
              </li>
            ))}
          </ul>
        </section>

        <ol className="grid gap-4 md:grid-cols-3">
          {gift.steps.map((s) => (
            <li key={s.icon} className="flex flex-col gap-2 rounded-[18px] border border-border-default bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-md bg-icon-tile text-deep-charcoal">
                <Icon name={s.icon} size={20} />
              </span>
              <h3 className="text-label-l text-deep-charcoal">{tx(locale, s, "title")}</h3>
              <p className="text-body-s text-text-secondary">{tx(locale, s, "body")}</p>
            </li>
          ))}
        </ol>

        <div>
          <Link href={routes.giftVerify(gift.code)} className={actionClass("primary", "max-sm:w-full max-sm:whitespace-normal")}>
            {t.verifyCta}
            <Icon name="lock" size={16} className="shrink-0" />
          </Link>
        </div>
        <p className="text-caption text-text-secondary">{t.verifyNote}</p>
      </div>
    </GiftBody>
  );
}
