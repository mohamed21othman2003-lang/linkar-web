import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import { getGift, getGiftCodes } from "@/lib/server/gift";
import { shareDomain } from "@/lib/data/gift/shared-vouchers";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { GiftBody, GiftExpired } from "@/components/gift/GiftExpired";
import { Chip, KvRow } from "@/components/gift/ui";
import { GiftVoucherActions } from "@/components/gift/VoucherActions";
import { actionsCopy, contactInfo } from "@/components/gift/actionsProps";

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return (await getGiftCodes()).map((code) => ({ code }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getGiftDict(await getLocale());
  return { title: t.meta.voucher, robots: { index: false } };
}

// W2-80c · رابط باقة الوكالة · القسيمة والفرع (757:12166 — «Column · v2»)
// ملاحظة: «v2 · Gift provider picker» موجود في الفريم بس مخفي (الباقة محدّد فرعها من الوكالة).
export default async function GiftBookPage({ params }: Props) {
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

  const rows = [
    { label: t.rows.car, value: tx(locale, gift, "car") },
    { label: t.rows.branch, value: tx(locale, gift, "branch") },
    { label: t.rows.address, value: tx(locale, gift, "address") },
    { label: t.rows.dealer, value: `${tx(locale, gift, "dealer")} · ‏${gift.po_number}` },
    { label: t.rows.purchaseDate, value: tx(locale, gift, "purchase_date") },
    { label: t.rows.validity, value: t.until(tx(locale, gift, "valid_until")) },
  ];
  const sharePath = routes.sharedVoucher(gift.voucher_code);

  return (
    <GiftBody>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-5">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neon-green text-deep-charcoal">
            <Icon name="check" size={24} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h3 text-deep-charcoal md:text-h2">{t.voucherTitle}</h1>
            <p className="text-body-m text-text-secondary md:text-body-l">{t.voucherBody}</p>
          </div>
        </div>

        <article className="flex flex-col-reverse items-stretch gap-7 rounded-2xl border border-border-default bg-white p-5 sm:flex-row sm:items-start md:p-7">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <Chip tone="info">{t.awaitingVisit}</Chip>
              <Chip tone="gray">{t.paidByDealer}</Chip>
            </div>
            <h2 className="text-h4 text-deep-charcoal md:text-h3">{tx(locale, gift, "package")}</h2>
            {rows.map((r) => (
              <KvRow key={r.label} label={r.label} value={r.value} divided />
            ))}
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="flex size-[168px] items-center justify-center rounded-lg border border-border-default bg-tile text-deep-charcoal">
              <Icon name="qr" size={112} />
            </span>
            <p dir="ltr" className="text-h5 text-deep-charcoal">
              {gift.voucher_code}
            </p>
            <p dir="ltr" className="text-caption text-text-secondary">
              {gift.booking_no}
            </p>
          </div>
        </article>

        <GiftVoucherActions
          contact={contactInfo(locale, gift.contact, gift.booking_no)}
          sharePath={sharePath}
          shareDisplay={`${shareDomain}${sharePath}`}
          accountHref={routes.dealerPackages}
          copy={actionsCopy(locale)}
        />

        <p className="flex items-start gap-2.5 rounded-[14px] bg-tile p-4 text-body-s text-text-secondary">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-state-gray" />
          {t.voucherNote}
        </p>
      </div>
    </GiftBody>
  );
}
