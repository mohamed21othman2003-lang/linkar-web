import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/server/session";
import { missingBooking, resolveBooking } from "@/lib/server/booking";
import { Container } from "@/components/ui/Container";
import { Stepper } from "@/components/booking/Stepper";
import { BranchPicker, type BranchView } from "@/components/booking/BranchPicker";
import { bookingHref, parseBookingQuery } from "@/components/booking/query";
import { summaryModel } from "@/components/booking/summary-model";
import { backHref } from "@/components/booking/back-href";

export async function generateMetadata(): Promise<Metadata> {
  const t = getBookingDict(await getLocale());
  return { title: `${t.chooseBranch} · ${t.checkoutTitle}` };
}

// W2-33 · الفرع · الأقرب لموقعك (تلقائي) — نسخة العميل: شاشة واحدة (من غير «من القائمة» / «من الخريطة»)
export default async function BookingBranchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const b = await resolveBooking(parseBookingQuery(sp), user);
  if (!b) return missingBooking(parseBookingQuery(sp));
  const t = getBookingDict(locale);
  const city = tx(locale, b.branch, "city");

  const branches: BranchView[] = b.branches.map((br) => ({
    id: br.id,
    name: tx(locale, br, "name"),
    street: tx(locale, br, "street"),
    district: tx(locale, br, "district"),
    city: tx(locale, br, "city"),
    hours: tx(locale, br, "hours"),
    distance: `${formatNumber(br.distance_km)} ${t.km}`,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tx(locale, b.provider, "name")} ${tx(locale, br, "name")} ${tx(locale, br, "city")}`)}`,
  }));
  const hrefs = Object.fromEntries(b.branches.map((br) => [br.id, bookingHref(routes.bookingDetails, { ...b.query, branch: br.id })]));
  const summary = summaryModel(locale, b);
  const providerName = tx(locale, b.provider, "name");
  const size = t.sizes[b.size];

  return (
    <>
      <Stepper
        title={t.checkoutTitle}
        subtitle={`${providerName} · ${t.servicesCount(b.lines.length)}`}
        backLabel={t.backToServices}
        backHref={backHref(b.query)}
        steps={t.steps}
        current={2}
      />
      <div className="bg-page-soft">
        <Container className="flex flex-col gap-8 pt-8 pb-14 lg:flex-row lg:items-start">
          <BranchPicker
            locale={locale}
            branches={branches}
            intro={
              b.branches.length === 1
                ? t.fill(t.branchSubOne, { provider: tx(locale, b.provider, "short_name"), city })
                : t.fill(t.branchSub, { provider: tx(locale, b.provider, "short_name"), n: b.branches.length, city })
            }
            summary={{
              ...summary,
              totalLabel: t.total,
              totalNote: t.fill(t.totalNote, { size }),
              total: formatPrice(locale, b.subtotal),
            }}
            hrefs={hrefs}
          />
        </Container>
      </div>
    </>
  );
}
