import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { PaymentMethodId } from "@/lib/data/booking/types";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/server/session";
import { getCheckoutConfig, getPaymentMethods, missingBooking, resolveBooking } from "@/lib/server/booking";
import { Container } from "@/components/ui/Container";
import { Stepper } from "@/components/booking/Stepper";
import { PaymentForm, type MethodView } from "@/components/booking/PaymentForm";
import { bookingHref, parseBookingQuery } from "@/components/booking/query";
import { summaryModel } from "@/components/booking/summary-model";
import { backHref } from "@/components/booking/back-href";

export async function generateMetadata(): Promise<Metadata> {
  const t = getBookingDict(await getLocale());
  return { title: `${t.steps[3]} · ${t.checkoutTitle}` };
}

const METHOD_IDS: PaymentMethodId[] = ["apple", "mada", "stc", "tabby", "tamara", "card", "cash"];

// W2-35 الدفع · W2-35m (مدى ← P-09) · W2-35b (?failed=<method>) · W2-35s (&ref=SM123-300)
// تجربة الفشل: ?fail=1 (أول محاولة دفع تفشل) أو رمز التحقق 000000 في P-09 / P-09b. P-25b: &demo=marketer-self
export default async function BookingPaymentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const q = parseBookingQuery(sp);
  const b = await resolveBooking(q, user);
  if (!b) return missingBooking(parseBookingQuery(sp));
  // الدفع بعد التحقق من الجوال؛ ضيف رابط المسوّق بيكمّل كضيف (W2-35s / W2-36s)
  if (!user && !b.query.ref) redirect(bookingHref(routes.bookingDetails, b.query));

  const t = getBookingDict(locale);
  const [methods, config] = await Promise.all([getPaymentMethods(), getCheckoutConfig()]);
  const failed = METHOD_IDS.find((m) => m === sp.failed) ?? null;
  const failDemo = sp.fail === "1";
  const referral = !!b.marketer;
  const providerName = tx(locale, b.provider, "name");
  const summary = summaryModel(locale, b, { car: true, branchStyle: referral ? "city" : "distance" });
  const self = bookingHref(routes.bookingPayment, b.query);
  const toView = (m: { code: string; name_ar: string; name_en: string; credit: number; min_total: number }) => ({
    code: m.code,
    name: tx(locale, m, "name"),
    credit: m.credit,
    min: m.min_total,
  });
  const itemsText = b.lines.map((l) => tx(locale, l, "name")).join(locale === "ar" ? " + " : " + ");

  return (
    <>
      <Stepper
        title={t.checkoutTitle}
        subtitle={`${providerName} · ${t.servicesCount(b.lines.length)}`}
        backLabel={t.backToServices}
        backHref={backHref(b.query)}
        steps={t.steps}
        current={4}
      />
      <div className="bg-page-soft">
        <Container className="flex flex-col gap-8 pt-8 pb-14 lg:flex-row lg:items-start">
          <PaymentForm
            key={failed ?? "ok"}
            locale={locale}
            summary={summary}
            subtotal={b.subtotal}
            pointsAvailable={b.pointsAvailable}
            pointsSar={b.pointsSar}
            initialMarketer={b.marketer ? toView(b.marketer) : null}
            marketers={config.marketers.map(toView)}
            methods={methods.map<MethodView>((m) => ({
              id: m.id,
              name: tx(locale, m, "name"),
              description: tx(locale, m, "description"),
              badge: locale === "en" && m.badge_en ? m.badge_en : m.badge,
              flow: m.flow,
            }))}
            instruments={config.savedInstruments}
            stcPhone={user?.phone ?? ""}
            failedMethod={failed}
            initialMethod={METHOD_IDS.find((m) => m === sp.method) ?? null}
            failDemo={failDemo}
            selfMarketerDemo={sp.demo === "marketer-self"}
            branchName={tx(locale, b.branch, "name")}
            providerName={providerName}
            itemsLabel={t.fill(t.itemsAt, { items: itemsText, provider: tx(locale, b.provider, "name") })}
            successHref={bookingHref(routes.bookingConfirmed, { ...b.query, car: b.car?.id })}
            failHref={self}
            retryHref={self}
          />
        </Container>
      </div>
    </>
  );
}
