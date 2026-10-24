import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getOverview } from "@/lib/server/account";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { ProviderTile } from "@/components/account/account-ui";
import type { OverviewOffer } from "@/lib/data/account/overview";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = getAccountDict(await getLocale());
  return { title: t.account };
}

// W2-60 · حسابي · الرئيسية (748:7673) — والعميل الجديد W2-60-0 (1072:21)
export default async function AccountHomePage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const t = getAccountDict(locale);
  const o = t.overview;
  const data = await getOverview();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3 text-deep-charcoal">{o.greeting(tx(locale, user, "first_name"))}</h1>
          <p className="text-body-m text-state-gray">{o.subtitle}</p>
        </div>
        <Link
          href={routes.search()}
          className="flex items-center gap-1.5 rounded-md bg-neon-green px-[18px] py-2.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
        >
          <Icon name="plus" size={16} />
          {t.newBooking}
        </Link>
      </div>

      {user.is_new ? (
        <>
          {/* ابدأ مع لينكار في 3 خطوات */}
          <section className="flex flex-col gap-4 rounded-[20px] bg-deep-charcoal px-5 py-7 md:px-8">
            <h2 className="text-h4 text-white">{o.onboardingTitle}</h2>
            <p className="max-w-[640px] text-body-m text-white">{o.onboardingSub}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {data.onboarding.map((s, i) => (
                <div key={s.icon} className="flex flex-col items-start gap-2.5 rounded-[16px] border border-white/14 bg-white/6 p-[18px]">
                  <div className="flex items-center gap-2.5">
                    <span className="flex rounded-md bg-white/10 p-2.5 text-neon-green">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <span className="rounded-full bg-neon-green px-2.5 py-1 text-label-m text-deep-charcoal">{formatNumber(i + 1)}</span>
                  </div>
                  <h3 className="text-label-l text-white">{tx(locale, s, "title")}</h3>
                  <p className="text-caption text-white/75">{tx(locale, s, "body")}</p>
                  <Link href={s.href} className="mt-auto rounded-md bg-neon-green px-3.5 py-[9px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
                    {tx(locale, s, "cta")}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* لا توجد حجوزات بعد */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-cool-gray bg-white px-5 py-6 md:px-7">
            <div className="flex items-center gap-3.5">
              <span className="flex shrink-0 rounded-full bg-neon-green/18 p-3 text-deep-charcoal">
                <Icon name="calendar" size={22} />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-label-l text-deep-charcoal">{o.emptyBookingsTitle}</h2>
                <p className="text-body-s text-state-gray">{o.emptyBookingsSub}</p>
              </div>
            </div>
            <Link href={routes.offers} className="rounded-md border border-cool-gray bg-white px-4 py-2.5 text-label-m text-deep-charcoal hover:border-border-strong">
              {t.browseOffers}
            </Link>
          </section>

          <OffersBlock locale={locale} title={o.newOffersTitle} sub={o.newOffersSub} allLabel={t.allOffers} offers={data.offers} />
        </>
      ) : (
        <>
          {/* حجزك القادم */}
          <section className="flex flex-col gap-6 rounded-[24px] bg-deep-charcoal p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex items-start gap-5">
              <ProviderTile slug={data.next.provider_slug} alt={data.next.provider_name} size={72} className="max-md:hidden" />
              <div className="flex min-w-0 flex-col items-start gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-label-m text-neon-green">{o.nextBooking}</span>
                  <span className="rounded-full bg-neon-green px-3 py-1 text-caption text-deep-charcoal">{t.status.waiting}</span>
                </div>
                <h2 className="text-h4 text-white">{tx(locale, data.next, "title")}</h2>
                <p className="text-body-s text-white/80">{tx(locale, data.next, "meta")}</p>
                <p className="flex items-center gap-2 text-label-l text-white">
                  <Icon name="calendar" size={18} className="shrink-0 text-neon-green" />
                  {tx(locale, data.next, "when")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 md:items-end">
              <Link
                href={routes.voucher(data.next.booking_id)}
                className="flex items-center justify-center gap-1.5 rounded-md bg-neon-green px-[18px] py-2.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
              >
                <Icon name="package" size={16} />
                {o.viewVoucher}
              </Link>
              <Link
                href={routes.booking(data.next.booking_id)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/40 px-[18px] py-2.5 text-label-m text-white hover:bg-white/10"
              >
                {o.bookingDetails}
                <Icon name="chevron-left" size={16} flip />
              </Link>
            </div>
          </section>

          {/* يُنفَّذ الآن */}
          <section className="flex flex-col gap-4 rounded-[20px] border border-cool-gray bg-white p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <Link href={routes.booking(data.inProgress.booking_id)} className="flex items-center gap-4">
              <ProviderTile slug={data.inProgress.provider_slug} alt={data.inProgress.provider_name} size={56} />
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="flex items-center gap-2.5">
                  <span className="text-label-m text-green-active">{o.inProgress}</span>
                  <span className="rounded-full bg-nature-green/14 px-3 py-1 text-caption text-green-active">{t.status.in_service}</span>
                </span>
                <span className="text-h5 text-deep-charcoal">{tx(locale, data.inProgress, "title")}</span>
                <span className="text-body-s text-state-gray">{tx(locale, data.inProgress, "meta")}</span>
              </span>
            </Link>
            <Link
              href={routes.booking(data.inProgress.booking_id)}
              className="flex items-center justify-center gap-1.5 rounded-md border border-cool-gray bg-white px-[18px] py-2.5 text-label-m text-deep-charcoal hover:border-border-strong"
            >
              {o.trackBooking}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </section>

          {/* سياراتي · المفضلة · الهدايا · النقاط */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {data.stats.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="flex flex-col items-start gap-1.5 rounded-[20px] border border-v3-card-stroke bg-white p-5 hover:border-deep-charcoal"
              >
                <span className="flex items-center gap-2 text-label-m text-v3-text-meta">
                  {o.stats[s.key]}
                  <Icon name={s.icon} size={18} className="text-nature-green" />
                </span>
                <span className="text-h3 text-deep-charcoal">{s.key === "points" ? formatNumber(user.points) : tx(locale, s, "value")}</span>
                <span className="text-caption text-v3-text-meta">{tx(locale, s, "note")}</span>
              </Link>
            ))}
          </div>

          {/* كيف كانت تجربتك مع …؟ */}
          <section className="flex flex-col gap-4 rounded-[20px] border border-neon-green/60 bg-tint-lime p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <Link href={routes.bookingReview(data.rate.booking_id)} className="flex items-center gap-3.5">
              <ProviderTile slug={data.rate.provider_slug} alt={tx(locale, data.rate, "provider")} size={48} />
              <span className="flex flex-col gap-1">
                <span className="text-h5 text-deep-charcoal">{o.rateTitle(tx(locale, data.rate, "provider"))}</span>
                <span className="text-body-s text-state-gray">{tx(locale, data.rate, "meta")}</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={routes.bookingReview(data.rate.booking_id)}
                className="rounded-md bg-deep-charcoal px-[18px] py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
              >
                {o.rateCta}
              </Link>
              <span className="flex items-center gap-1 text-state-gray" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" size={22} />
                ))}
              </span>
            </div>
          </section>

          <OffersBlock locale={locale} title={o.offersTitle} sub={o.offersSub} allLabel={t.allOffers} offers={data.offers} />
        </>
      )}
    </div>
  );
}

// عنوان «جديد من مقدّمي خدمة تتابعهم» / «عروض قد تهمك» + 3 كروت عروض
function OffersBlock({ locale, title, sub, allLabel, offers }: { locale: Locale; title: string; sub: string; allLabel: string; offers: OverviewOffer[] }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-h4 text-deep-charcoal">{title}</h2>
          <p className="text-body-s text-v3-text-meta">{sub}</p>
        </div>
        <Link href={routes.offers} className="flex items-center gap-1.5 px-1 py-1.5 text-label-m text-green-active hover:underline">
          {allLabel}
          <Icon name="chevron-left" size={16} flip className="text-nature-green" />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {offers.map((f) => (
          <Link
            key={f.id}
            href={f.href}
            className="flex flex-col items-start gap-3 rounded-[20px] border border-v3-card-stroke bg-white p-5 hover:border-deep-charcoal"
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                {f.services.map((s) => (
                  <ServiceGlyph key={s} name={s} size={32} className="text-state-gray" />
                ))}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-deep-charcoal px-3 py-1 text-caption whitespace-nowrap text-neon-green">
                {tx(locale, f, "pill")}
                <Icon name="tag" size={12} />
              </span>
            </span>
            <span className="text-label-l text-deep-charcoal">{tx(locale, f, "title")}</span>
            <span className="flex items-center gap-1.5 text-caption text-v3-text-meta">
              {tx(locale, f, "provider")}
              <ProviderTile slug={f.provider_slug} alt="" size={24} />
            </span>
            <span className="mt-auto flex w-full items-center justify-between gap-2">
              <span className="flex items-baseline gap-1.5">
                <span className="text-h5 text-deep-charcoal">{formatPrice(locale, f.price)}</span>
                <span className="text-caption text-v3-text-meta line-through">{formatNumber(f.old_price)}</span>
              </span>
              <span className="text-caption text-v3-text-meta">{tx(locale, f, "note")}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
