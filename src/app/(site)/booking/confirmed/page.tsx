import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { getCommon } from "@/i18n/dict/common";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/server/session";
import { bookingTotals, getConfirmation, getPaymentMethods, missingBooking, resolveBooking } from "@/lib/server/booking";
import { getService } from "@/lib/server/content";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/icons/Icon";
import { LogoTile } from "@/components/booking/LogoTile";
import { VoucherActions } from "@/components/booking/VoucherActions";
import { ContactBranchButton } from "@/components/booking/ContactBranchButton";
import { parseBookingQuery } from "@/components/booking/query";
import { carTitle } from "@/components/booking/summary-model";
import { voucherCodeFont } from "@/components/booking/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const t = getBookingDict(await getLocale());
  return { title: t.confirmedTitle };
}

const nextIcons = ["/figma/booking/tile-mail.svg", "/figma/booking/tile-calendar.svg", "/figma/booking/tile-qr.svg", "/figma/booking/tile-car.svg"];

// W2-36 · تأكيد الحجز · W2-36s · عبر رابط المسوّق (&ref=…)
export default async function BookingConfirmedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const b = await resolveBooking(parseBookingQuery(sp), user);
  if (!b) return missingBooking(parseBookingQuery(sp));
  if (sp.nomkt === "1") b.marketer = null;
  const t = getBookingDict(locale);
  const methods = await getPaymentMethods();
  const method = methods.find((m) => m.id === sp.method) ?? methods[0];
  const methodName = tx(locale, method, "name");
  const cash = method.id === "cash"; // P-26c: القسيمة بانتظار الدفع في الفرع
  const totals = bookingTotals(b, sp.pts === "1");
  const referral = !!b.marketer?.eligible;
  const conf = await getConfirmation(referral);
  const providerName = tx(locale, b.provider, "name");
  const branchName = tx(locale, b.branch, "name");
  const sep = locale === "ar" ? "، " : ", ";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${providerName} ${branchName} ${tx(locale, b.branch, "city")}`)}`;
  const due = formatPrice(locale, totals.due);
  const validUntil = tx(locale, conf, "valid_until");
  const lineNames = b.lines.map((l) => tx(locale, l, "name"));

  if (referral && b.marketer) {
    const c = getCommon(locale);
    const main = await getService(b.lines[0].service);
    const customer = user ? tx(locale, user, "name") : tx(locale, conf, "customer");
    return (
      <>
        <PageHeader
          crumbs={[
            { label: c.home, href: routes.home },
            ...(main ? [{ label: tx(locale, main, "name"), href: routes.search({ services: [main.slug] }) }] : []),
            { label: lineNames[0], href: b.query.packages?.length ? routes.package(b.query.packages[0]) : routes.provider(b.provider.slug) },
            { label: t.crumbConfirmed },
          ]}
          title={t.confirmedTitle}
          description={t.fill(t.referralSub, { amount: due })}
          tone="dark"
        />
        <Container className="flex justify-center pt-10 pb-24">
          <div className="flex w-full max-w-[760px] flex-col gap-[18px] rounded-2xl border border-border-default bg-white p-5 md:p-10">
            <div className="flex items-center gap-3.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neon-green">
                <Icon name="check" size={28} />
              </span>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-h4">
                  <bdi>{conf.booking_id}</bdi> · {t.awaiting}
                </h2>
                <p className="text-body-s text-text-secondary">{t.fill(t.bookedOn, { date: tx(locale, conf, "booked_on") })}</p>
              </div>
            </div>
            <div className="flex flex-col-reverse items-start gap-5 rounded-lg bg-tile p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-caption text-text-secondary">{t.voucherTitle}</span>
                <span className={`${voucherCodeFont} text-[20.2px] leading-[34px] tracking-[0.04em]`}>
                  <bdi>{conf.voucher_code}</bdi>
                </span>
                <span className="text-label-l">
                  {lineNames.join(" + ")} · {t.sizes[b.size]}
                </span>
                <span className="text-body-s text-text-secondary">
                  {providerName} · {branchName}
                  {sep}
                  {tx(locale, b.branch, "city")}
                </span>
                {b.car && (
                  <span className="text-body-s text-text-secondary">
                    {carTitle(locale, b.car)} · {customer}
                  </span>
                )}
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-bg-success-subtle px-2.5 py-1 text-label-m text-green-active">
                  <Icon name="calendar" size={14} className="text-nature-green" />
                  {t.fill(t.validUntilBadge, { date: validUntil })}
                </span>
              </div>
              <span className="flex size-[172px] shrink-0 items-center justify-center rounded-md border border-cool-gray bg-white">
                <Image src="/figma/booking/voucher-qr.svg" alt={conf.voucher_code} width={148} height={148} unoptimized />
              </span>
            </div>
            <dl className="flex flex-col gap-2.5 rounded-lg border border-border-default p-5">
              {[
                [t.servicePrice, formatPrice(locale, b.subtotal), ""],
                [t.fill(t.marketerCredit, { code: b.marketer.code }), `−${formatPrice(locale, b.marketer.credit)}`, "text-green-active"],
                ...(totals.points ? [[t.pointsDiscount, `−${formatPrice(locale, totals.points)}`, "text-green-active"]] : []),
                [t.fill(t.paidVia, { method: methodName }), due, ""],
              ].map(([k, v, cls], i, arr) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className={`text-body-s ${i === arr.length - 1 ? "text-deep-charcoal" : "text-text-secondary"}`}>{k}</dt>
                  <dd className={`text-label-l ${cls}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="flex items-start gap-2 text-body-s text-text-secondary">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-deep-charcoal" />
              {t.fill(t.referralNote, { branch: branchName })}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {user ? (
                <Link href={routes.bookings()} className="flex h-[50px] items-center gap-1.5 rounded-md bg-neon-green px-[22px] text-label-l transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed">
                  <Icon name="user" size={16} />
                  {t.myBookings}
                </Link>
              ) : (
                <Link href={routes.login} className="flex h-[50px] items-center gap-1.5 rounded-md bg-neon-green px-[22px] text-label-l transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed">
                  <Icon name="user" size={16} />
                  {t.createAccount}
                </Link>
              )}
              <ContactBranchButton
                locale={locale}
                branch={{ id: b.branch.id, providerSlug: b.provider.slug, branchLine: `${providerName} · ${branchName}`, address: [tx(locale, b.branch, "street"), tx(locale, b.branch, "district"), tx(locale, b.branch, "city")].filter(Boolean).join(sep), mapsUrl }}
                className="flex h-[52px] items-center gap-1.5 rounded-md border border-border-default bg-white px-[22px] text-label-l hover:border-border-strong">
                <Icon name="phone" size={16} />
                {t.contactBranch}
              </ContactBranchButton>
            </div>
          </div>
        </Container>
      </>
    );
  }

  const nextSteps = t.next.map((s, i) => ({
    title: s.title,
    body: t.fill(s.body, {
      date: validUntil,
      branch: branchName,
      address: [tx(locale, b.branch, "street"), tx(locale, b.branch, "district")].filter(Boolean).join(sep),
    }),
    icon: nextIcons[i],
  }));
  const rows: [string, string][] = [
    [t.validity, t.fill(t.validUntil, { date: validUntil })],
    [t.services, lineNames.join(" + ")],
    ...(b.car ? [[t.car, [carTitle(locale, b.car), tx(locale, b.car, "plate")].filter(Boolean).join(" · ")] as [string, string]] : []),
    [t.paid, cash ? t.fill(t.payAtBranch, { amount: due }) : `${due} · ${methodName}`],
    [t.bookingNo, conf.booking_id],
  ];

  return (
    <>
      <section className="flex flex-col items-center gap-3 bg-white px-4 pt-12 pb-8 text-center">
        <span className="flex size-20 items-center justify-center rounded-2xl bg-neon-green">
          <Icon name="check" size={44} className="text-solid-black" />
        </span>
        <h1 className="text-h3 md:text-h2">{t.confirmedTitle}</h1>
        <p className="max-w-[760px] text-body-l text-text-secondary">{t.fill(cash ? t.confirmedSubCash : t.confirmedSub, { amount: due, method: methodName, id: conf.booking_id })}</p>
      </section>
      <div className="bg-page-soft">
        <Container className="flex flex-col items-center gap-6 pt-8 pb-20 lg:flex-row lg:items-start lg:justify-center">
          <article className="w-full max-w-[460px] shrink-0 overflow-hidden rounded-[28px] border border-border-default bg-white shadow-elevation-2">
            <div className="flex items-center justify-between bg-deep-charcoal px-[22px] py-[18px]">
              <div className="flex flex-col gap-1">
                <Image src="/brand/logo-inverse.svg" alt="LINKAR" width={150} height={20} unoptimized />
                <span className="text-caption text-white/70">{t.voucherCard}</span>
              </div>
              <span className="rounded-full bg-neon-green px-2.5 py-1 text-caption">{cash ? t.statusCash : t.statusPaid}</span>
            </div>
            <div className="flex flex-col items-center gap-2.5 px-6 pt-6 pb-4">
              <Image src="/figma/booking/voucher-qr.svg" alt={conf.voucher_code} width={180} height={180} unoptimized />
              <span className={`${voucherCodeFont} text-[20.2px] leading-[34px] tracking-[0.04em]`} dir="ltr">
                {conf.voucher_code}
              </span>
              <span className="text-caption text-text-secondary">{t.showCode}</span>
            </div>
            <div className="relative mx-[22px] h-0">
              <span className="absolute inset-x-0 -top-px border-t-[1.5px] border-dashed border-border-default" />
            </div>
            <div className="flex flex-col gap-2.5 px-[22px] pt-4 pb-[18px]">
              <div className="flex items-center gap-2.5">
                <LogoTile slug={b.provider.slug} src={b.provider.logo} alt={providerName} size={40} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-label-l">{providerName}</span>
                  <span className="text-caption text-text-secondary">
                    {branchName} · {tx(locale, b.branch, "street")}
                  </span>
                </div>
              </div>
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 text-[14px] leading-6">
                  <span className="shrink-0 font-light text-text-secondary">{k}</span>
                  <span className="text-end font-medium">{v}</span>
                </div>
              ))}
            </div>
            <VoucherActions locale={locale} mapsUrl={mapsUrl} shareLink={`${conf.share_host}${routes.sharedVoucher(conf.voucher_code)}`} />
          </article>

          <section className="flex w-full max-w-[636px] flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 md:p-6">
            <h2 className="text-h4">{t.whatNext}</h2>
            {nextSteps.map((s) => (
              <div key={s.title} className="flex items-start gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt="" width={40} height={40} className="shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-label-l">{s.title}</span>
                  <span className="text-body-s text-text-secondary">{s.body}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-lg bg-deep-charcoal px-4 py-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/booking/tile-points.svg" alt="" width={40} height={40} />
              <div className="flex flex-col gap-0.5">
                <span className="text-label-l text-neon-green">{t.fill(t.earnPoints, { n: formatNumber(Math.round(totals.due)) })}</span>
                <span className="text-caption text-white/70">{t.earnPointsSub}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href={routes.booking(conf.booking_id)} className="flex h-14 items-center justify-center gap-1.5 rounded-[14px] bg-neon-green text-label-l transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed">
                {t.track}
                <Icon name="chevron-left" size={16} flip />
              </Link>
              <Link href={routes.home} className="flex h-14 items-center justify-center rounded-[14px] border border-border-default bg-white text-label-l hover:border-border-strong">
                {t.backHome}
              </Link>
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
