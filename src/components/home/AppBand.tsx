import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { HomeContent } from "@/lib/server/home";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/routes";
import { FigmaIcon } from "./bits";
import { FloatPhone, PopChip } from "./motion";

type S = (x: { text_ar: string; text_en: string }) => string;

// «امسح للتحميل» + QR + شارات المتاجر
function Download({ s, content, platforms }: { s: S; content: HomeContent; platforms: boolean }) {
  const a = content.appBand;
  return (
    <div className="flex flex-wrap items-start gap-4 sm:gap-5">
      <StoreBadges height={48} className="flex-col gap-2.5!" />
      <div className={`flex items-center gap-3 rounded-lg bg-white p-2.5 ${platforms ? "h-[92px]" : "h-[104px]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/home/qr-code.svg" alt="" width={72} height={72} className="size-[72px]" />
        <div className="flex w-[88px] flex-col gap-0.5">
          <span className="text-label-m text-deep-charcoal">{s(a.scan)}</span>
          {platforms && <span className="text-caption text-state-gray">{s(a.platforms)}</span>}
        </div>
      </div>
    </div>
  );
}

// V2-01 · Band · App (557:210) — «لينكار في جيبك / احجز، ادفع، وتابع» على كحلي + جوالين وشيبس
export function AppBand({ locale, content, id }: { locale: Locale; content: HomeContent; id: string }) {
  const a = content.appBand;
  const s: S = (x) => tx(locale, x, "text");
  const chip = "flex h-14 items-center gap-2.5 rounded-full ps-3.5 pe-4 text-label-m whitespace-nowrap shadow-[0_12px_24px_#0b0d0a33]";
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden bg-deep-charcoal py-16 lg:py-24">
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex flex-col items-start gap-6 lg:w-[540px]">
          <p className="text-overline text-neon-green">{s(a.overline)}</p>
          <h2 className={`text-[36px]/[54px] font-bold text-white ${locale === "ar" ? "md:text-display-l" : "md:text-[44px]/[64px]"}`}>
            {s(a.title_1)}
            <br />
            <span className="text-neon-green">{s(a.title_2)}</span>
          </h2>
          <p className="text-body-l text-cool-gray">{s(a.description)}</p>
          <ul className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2">
            {a.features.map((f) => (
              <li key={f.title.text_ar} className="flex min-h-[104px] items-center gap-3 rounded-lg border border-white/24 bg-white/12 p-3.5">
                <FigmaIcon name={f.icon} size={40} />
                <div className="flex flex-col gap-1">
                  <p className="text-label-l text-white">{s(f.title)}</p>
                  <p className="text-caption text-cool-gray">{s(f.body)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Download s={s} content={content} platforms={false} />
        </div>

        {/* Phones stage (700×720) — الجوالين صور مصدّرة من الفيجما، والشيبس HTML */}
        <div className="relative mx-auto h-[360px] w-[350px] shrink-0 sm:h-[576px] sm:w-[560px] lg:mx-0 lg:h-[720px] lg:w-[700px]">
          <div className="absolute start-0 top-0 h-[720px] w-[700px] scale-50 ltr:origin-top-left rtl:origin-top-right sm:scale-80 lg:scale-100">
          <FloatPhone kind="home" className="absolute -end-[7px] top-[89px] w-[368px]">
            <Image src="/figma/home/app-phone-home.png" alt="" width={368} height={570} sizes="368px" className="h-auto w-[368px]" />
          </FloatPhone>
          <FloatPhone kind="voucher" className="absolute end-[329px] top-[114px] w-[368px]">
            <Image src="/figma/home/app-phone-voucher.png" alt="" width={368} height={570} sizes="368px" className="h-auto w-[368px]" />
          </FloatPhone>
          {/* الشيبس بتودّي لشاشاتها: W2-36 تأكيد الحجز · W2-66 باقات الوكالات · W2-37b متابعة الحجز */}
          <PopChip kind="accepted" className="absolute end-[400px] top-5">
            <Link href={routes.bookingConfirmed} className={`${chip} bg-neon-green text-solid-black`}>
              <FigmaIcon name="brand-shield-neon" size={32} className="rounded-full" />
              {s(a.chips.accepted)}
            </Link>
          </PopChip>
          <PopChip kind="gift" className="absolute -end-[30px] top-[420px]">
            <Link href={routes.dealerPackages} className={`${chip} bg-linear-to-r from-neon-green to-nature-green text-solid-black`}>
              <FigmaIcon name="feature-gift-neon" size={32} className="rounded-full" />
              {s(a.chips.gift)}
            </Link>
          </PopChip>
          <PopChip kind="tracking" className="absolute end-[380px] top-[640px]">
            <Link href={routes.booking("BK-21431")} className={`${chip} bg-white text-deep-charcoal`}>
              <FigmaIcon name="brand-car-neon" size={32} className="rounded-full" />
              {s(a.chips.tracking)}
            </Link>
          </PopChip>
          </div>
        </div>
      </Container>
    </section>
  );
}

// V2-02 · App (619:2123) — ليموني: النص + الجوالين من تحت
export function AppBandGuest({ locale, content, id }: { locale: Locale; content: HomeContent; id: string }) {
  const a = content.appBand;
  const s: S = (x) => tx(locale, x, "text");
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden bg-neon-green pt-12 lg:pt-[72px]">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="flex flex-col items-start gap-4 lg:w-[520px] lg:pb-[72px]">
          <p className="text-overline text-deep-charcoal">{s(a.overline)}</p>
          <h2 className="text-[26px]/[40px] font-bold text-deep-charcoal md:text-h2">{s(a.title_1)}</h2>
          <p className="text-body-l text-deep-charcoal">{s(a.guest_description)}</p>
          <ul className="flex flex-col gap-4">
            {a.guest_points.map((p) => (
              <li key={p.text.text_ar} className="flex items-center gap-2.5 text-label-l text-deep-charcoal">
                <FigmaIcon name={p.icon} size={32} />
                {s(p.text)}
              </li>
            ))}
          </ul>
          <Download s={s} content={content} platforms />
        </div>
        {/* Phones (619:2124): جوالين بيطفوا (دورة 2 ثانية من الفيجما) */}
        <div role="img" aria-label={s(a.phones_alt)} className="relative mx-auto h-[267px] w-[270px] shrink-0 sm:h-[534px] sm:w-[541px] lg:mx-0">
          <div className="absolute start-0 top-0 h-[534px] w-[541px] scale-50 ltr:origin-top-left rtl:origin-top-right sm:scale-100">
            <FloatPhone kind="guest-voucher" className="absolute -end-[17.5px] -top-0.5 w-[293px]">
              <Image src="/figma/home/app-guest-voucher.png" alt="" width={293} height={537} sizes="293px" className="h-auto w-[293px]" />
            </FloatPhone>
            <FloatPhone kind="guest-home" className="absolute end-[264.5px] -top-0.5 w-[293px]">
              <Image src="/figma/home/app-guest-home.png" alt="" width={293} height={537} sizes="293px" className="h-auto w-[293px]" />
            </FloatPhone>
          </div>
        </div>
      </Container>
    </section>
  );
}
