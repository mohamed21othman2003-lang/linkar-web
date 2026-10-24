import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import { getSharedVoucher, getSharedVoucherCodes } from "@/lib/server/gift";
import { Icon } from "@/components/icons/Icon";
import { GiftBody } from "@/components/gift/GiftExpired";
import { KvRow } from "@/components/gift/ui";
import { SharedVoucherActions } from "@/components/gift/VoucherActions";
import { actionsCopy, contactInfo } from "@/components/gift/actionsProps";

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return (await getSharedVoucherCodes()).map((code) => ({ code }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getGiftDict(await getLocale());
  return { title: t.meta.shared, robots: { index: false } };
}

// W2-81 · رابط القسيمة المشتركة (757:13432)
export default async function SharedVoucherPage({ params }: Props) {
  const [{ code }, locale] = await Promise.all([params, getLocale()]);
  const v = await getSharedVoucher(code);
  if (!v) notFound();
  const t = getGiftDict(locale);

  return (
    <GiftBody>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <p className="flex items-center gap-2 text-body-m text-text-secondary">
          <Icon name="share" size={16} className="shrink-0" />
          {t.sharedVia(tx(locale, v.sharer, "name"))}
        </p>

        <article className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cool-gray bg-white">
                <Image src={v.contact.logo} alt="" width={134} height={42} sizes="42px" className="w-[42px]" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h1 className="text-h5 text-deep-charcoal">{tx(locale, v, "title")}</h1>
                <p className="text-body-s text-text-secondary">{t.sharedSub(v.booking_no, tx(locale, v, "valid_until"))}</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-nature-green/14 px-3 py-1 text-caption text-green-active">
              {t.paidInFull}
              <Icon name="check" size={12} className="text-nature-green" />
            </span>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:gap-0 sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:pe-2">
              <KvRow label={t.services} value={tx(locale, v, "services")} />
              <KvRow label={t.car} value={tx(locale, v, "car")} />
              <KvRow label={t.dueOnArrival} value={tx(locale, v, "due")} />
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <Image src={v.qr} alt={t.qrAlt(v.code)} width={170} height={170} unoptimized />
              <p dir="ltr" className="text-h5 text-deep-charcoal">
                {v.code}
              </p>
            </div>
          </div>

          <SharedVoucherActions contact={contactInfo(locale, v.contact, v.booking_no)} copy={actionsCopy(locale)} />
        </article>

        <p className="flex items-center gap-2.5 rounded-xl bg-tile px-[18px] py-3.5 text-body-s text-deep-charcoal">
          <Icon name="lock" size={16} className="shrink-0 text-deep-charcoal" />
          {t.sharedNote}
        </p>
      </div>
    </GiftBody>
  );
}
