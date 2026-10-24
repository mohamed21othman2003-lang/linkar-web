import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { getGiftDict } from "@/i18n/dict/gift";
import { getGift, getGiftCodes } from "@/lib/server/gift";
import { routes } from "@/lib/routes";
import { PackageCard } from "@/components/gift/PackageCard";
import { GiftBody, GiftExpired } from "@/components/gift/GiftExpired";
import { OtpForm } from "@/components/gift/OtpForm";

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ demo?: string }> };

export async function generateStaticParams() {
  return (await getGiftCodes()).map((code) => ({ code }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getGiftDict(await getLocale());
  return { title: t.meta.verify, robots: { index: false } };
}

// W2-80b · رابط باقة الوكالة · التحقق من الرقم (757:11766)
export default async function GiftVerifyPage({ params, searchParams }: Props) {
  const [{ code }, locale, sp] = await Promise.all([params, getLocale(), searchParams]);
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
      <div className="mx-auto flex w-full max-w-[1088px] flex-col items-stretch gap-7 lg:flex-row lg:items-start lg:justify-center">
        <OtpForm
          phone={gift.phone_masked}
          length={gift.otp_length}
          next={routes.giftBook(gift.code)}
          demo={sp.demo === "figma"}
          copy={{
            title: t.verifyTitle,
            body: t.verifyBody(gift.otp_length),
            phoneLabel: t.phoneLabel,
            otpLabel: t.otpLabel,
            digitLabels: Array.from({ length: gift.otp_length }, (_, i) => t.otpDigit(i + 1)),
            noCode: t.noCode,
            resend: t.resend,
            resent: t.resent,
            submit: t.verifySubmit,
            error: t.otpError(gift.otp_length),
            noAccount: t.noAccount,
          }}
        />
        <PackageCard locale={locale} gift={gift} variant="summary" />
      </div>
    </GiftBody>
  );
}
