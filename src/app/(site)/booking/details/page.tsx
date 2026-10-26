import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/server/session";
import { getCheckoutConfig, missingBooking, resolveBooking } from "@/lib/server/booking";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { Stepper } from "@/components/booking/Stepper";
import { Summary, VoucherNote } from "@/components/booking/Summary";
import { PhoneLogin } from "@/components/booking/PhoneLogin";
import { DetailsForm, type CarView } from "@/components/booking/DetailsForm";
import { bookingHref, parseBookingQuery } from "@/components/booking/query";
import { carTitle, summaryModel } from "@/components/booking/summary-model";
import { backHref } from "@/components/booking/back-href";
import { getAuthCommon } from "@/components/auth/copy";
import { authHref } from "@/lib/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = getBookingDict(await getLocale());
  return { title: `${t.steps[2]} · ${t.checkoutTitle}` };
}

// W2-34a (زائر: تسجيل الدخول برقم الجوال) · W2-34e (زائر: بالبريد الإلكتروني · ?login=email) · W2-34b (بعد تسجيل الدخول)
export default async function BookingDetailsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const b = await resolveBooking(parseBookingQuery(sp), user);
  if (!b) return missingBooking(parseBookingQuery(sp));
  const t = getBookingDict(locale);
  const providerName = tx(locale, b.provider, "name");
  const base = summaryModel(locale, b);
  const summaryV = { ...base, totalLabel: t.total, total: formatPrice(locale, b.subtotal) };
  const self = bookingHref(routes.bookingDetails, b.query);
  const [config, auth] = await Promise.all([getCheckoutConfig(), getAuthCommon(locale)]);
  // W2-34e: تبويب «البريد الإلكتروني» (?login=email)
  const method = sp.login === "email" ? "email" : "phone";

  return (
    <>
      <Stepper
        title={t.checkoutTitle}
        subtitle={`${providerName} · ${t.servicesCount(b.lines.length)}`}
        backLabel={t.backToServices}
        backHref={backHref(b.query)}
        steps={t.steps}
        current={3}
      />
      <div className="bg-page-soft">
        <Container className="flex flex-col gap-8 pt-8 pb-14 lg:flex-row lg:items-start">
          {user ? (
            <DetailsForm
              locale={locale}
              query={b.query}
              cars={b.cars.filter((c) => c.id !== "accord-2024").map<CarView>((c) => ({
                id: c.id,
                title: carTitle(locale, c),
                meta: [t.sizes[c.size], tx(locale, c, "color"), tx(locale, c, "plate")].filter(Boolean).join(" · "),
                size: c.size,
              }))}
              selectedCar={b.car?.id ?? null}
              firstName={tx(locale, user, "first_name")}
              isNewUser={user.is_new}
              catalog={config.carCatalog}
              summary={summaryV}
            />
          ) : (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <PhoneLogin
                  locale={locale}
                  method={method}
                  tabs={{
                    phone: { label: auth.t.tabPhone, href: self },
                    email: { label: auth.t.tabEmail, href: bookingHref(routes.bookingDetails, b.query, { login: "email" }) },
                  }}
                  emailCopy={{
                    email: auth.t.emailLabel,
                    emailPlaceholder: auth.t.emailPlaceholder,
                    password: auth.t.passwordLabel,
                    forgot: tx(locale, auth.c.emailScreen, "forgot"),
                    forgotHref: authHref(routes.forgotPassword, { next: self }),
                  }}
                  defaultPhone={config.loginDemo.phone}
                  typed={config.loginDemo.typed}
                  next={self}
                  guestNext={b.query.ref ? bookingHref(routes.bookingPayment, { ...b.query, car: b.car?.id }) : undefined}
                />
                <section className="flex flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
                  <h2 className="text-h4">{t.whyTitle}</h2>
                  {t.why.map((w) => (
                    <p key={w} className="flex items-center gap-2 text-body-s">
                      <Icon name="check" size={16} className="shrink-0 text-nature-green" />
                      {w}
                    </p>
                  ))}
                </section>
              </div>
              <Summary
                v={{ ...summaryV, totalNote: t.fill(t.totalNote, { size: t.sizes[b.size] }) }}
                cta={
                  <span aria-disabled className="flex h-14 items-center justify-center rounded-[14px] bg-cool-gray/60 text-label-l text-state-gray">
                    {method === "email" ? t.signInFirst : t.verifyFirst}
                  </span>
                }
                footer={<VoucherNote text={t.voucherNote} />}
              />
            </>
          )}
        </Container>
      </div>
    </>
  );
}
