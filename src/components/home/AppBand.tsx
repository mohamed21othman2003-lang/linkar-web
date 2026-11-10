import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { HomeContent } from "@/lib/server/home";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { FigmaIcon, RText } from "./bits";
import { FloatPhone, PopChip } from "./motion";

type S = (x: { text_ar: string; text_en: string }) => string;

// «امسح للتحميل» + QR + شارات المتاجر — ديسكتوب: صندوق QR أبيض بالنص · تابلت: QR 80 جنب الشارتين · موبايل: الشارتين جنب بعض
function Download({ s, content }: { s: S; content: HomeContent }) {
  const a = content.appBand;
  return (
    <>
      {/* Download (37:27970): الشارتين فوق بعض وجنبهم صندوق QR الأبيض بمسافة 20 (L-1025) — الصندوق ارتفاعه 104 (L-1367) */}
      <div className="flex w-full items-center gap-5 max-xl:hidden">
        {/* الشارتين 48+8+48 = 104 = ارتفاع صندوق الـQR بالظبط (ملاحظة اجتماع 9 نوفمبر: «الطول مش واحد») */}
        <StoreBadges height={48} className="flex-col gap-2!" />
        <div className="flex h-[104px] items-center gap-3 rounded-lg bg-white px-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/home/qr-code.svg" alt="" width={72} height={72} loading="lazy" className="size-[72px]" />
          <span className="text-[14px] leading-[22px] font-medium whitespace-nowrap text-deep-charcoal">{s(a.scan)}</span>
        </div>
      </div>
      <div className="hidden items-center gap-2.5 md:max-xl:flex">
        <StoreBadges height={37} className="flex-col-reverse gap-1.5!" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src="/figma/home/app-qr.svg" alt={s(a.scan)} width={80} height={80} className="size-20" />
      </div>
      <StoreBadges height={42} className="flex-row-reverse justify-center self-center md:hidden" />
    </>
  );
}

// Phone (202:7683 / 202:7780) — 258.3×533.8: هيكل الجوال (الجسم والإطار والنوتش والأزرار واللمعة والظل) HTML بمقاسات الفيجما،
// والشاشة بس صورة متصدّرة — كده الجوال بيتحرك كعنصر حقيقي من غير مربع خلفية حواليه
function AppPhone({ screen }: { screen: string }) {
  const button = "absolute w-[2.58px] rounded-[1.72px] bg-deep-charcoal";
  return (
    <div className="relative h-[533.82px] w-[258.3px] opacity-95">
      <div
        className="absolute inset-0 rounded-[46.49px] bg-[linear-gradient(112deg,#4a4e47_0%,#152935_45%,#3a3d38_100%)] shadow-[0_12px_24px_-8.61px_#00000059]"
      />
      <div className="absolute inset-[5.17px] rounded-[41.33px] bg-[#0b151b]" />
      <div className="absolute inset-[10.33px] overflow-hidden rounded-[36.16px] bg-white">
        <Image src={screen} alt="" width={238} height={513} sizes="238px" className="size-full" />
      </div>
      <div className="absolute left-[92.13px] top-[18.94px] h-[22.39px] w-[74.05px] rounded-[11.19px] bg-[#0b151b]" />
      <span className={`${button} -left-[1.72px] top-[103.32px] h-[25.83px]`} />
      <span className={`${button} -left-[1.72px] top-[146.37px] h-[44.77px]`} />
      <span className={`${button} -left-[1.72px] top-[201.47px] h-[44.77px]`} />
      <span className={`${button} left-[257.44px] top-[163.59px] h-[70.6px]`} />
      <div className="pointer-events-none absolute inset-[10.33px] rounded-[36.16px] bg-[linear-gradient(135deg,#ffffff29_0%,#ffffff05_35%,#ffffff00_100%)]" />
    </div>
  );
}

// V2-01 · Band · App (202:7679 · تابلت/موبايل من V2-01t/V2-01m) — «لينكار في جيبك / احجز، ادفع، وتابع» (#bffa4f) على كحلي سادة
// + جوالين مايلين ±13° وشيبس. الجوال هيكل HTML وشاشته صورة مصدّرة من الفيجما (202:7686 / 202:7783 · الإنجليزي من V2-EN 202:10543 / 202:10640)
// تحت xl مسرح الجوالين بنص المقاس (350×360) — تابلت: جنب النص · موبايل: بين العنوان والمميزات
export function AppBand({ locale, content, id }: { locale: Locale; content: HomeContent; id: string }) {
  const a = content.appBand;
  const s: S = (x) => tx(locale, x, "text");
  const chip = "flex h-14 items-center gap-2.5 rounded-full ps-4 pe-3.5 text-label-m whitespace-nowrap shadow-[0_24px_24px_#0b0d0a33]";
  return (
    <section id={id} className="relative scroll-mt-20 overflow-hidden bg-deep-charcoal py-9 md:py-16 xl:py-24">
      <Container className="grid grid-cols-1 gap-[18px] max-md:px-5 md:grid-cols-[1fr_350px] md:items-center md:gap-6 xl:flex xl:items-center xl:justify-between xl:gap-10">
        <div className="contents md:flex md:flex-col md:items-start md:gap-4 xl:w-[540px] xl:gap-6">
          <div className="flex flex-col items-start gap-1.5 md:gap-4 xl:gap-6">
            <p className="text-[13px]/[20px] font-medium text-neon-green md:text-overline">{s(a.overline)}</p>
            {/* الإنجليزي كمان 52 (V2-EN) */}
            <h2 className="text-[26px]/[38px] font-bold text-neon-title md:text-[34px]/[50px] xl:text-display-l">
              {s(a.title_1)}
              <br />
              {s(a.title_2)}
            </h2>
            <p className="text-[14px]/[23px] font-light text-v3-card-stroke md:text-[15px]/[26px] xl:text-body-l xl:text-cool-gray">
              <RText d={s(a.description)} t={s(a.description_t)} m={s(a.description_m)} />
            </p>
          </div>
          <ul className="grid w-full grid-cols-2 gap-2 max-md:order-1 md:gap-y-4 xl:gap-3.5">
            {a.features.map((f, i) => (
              // تحت xl كل صف معكوس (V2-01t/V2-01m: «ادفع خلال ثوانٍ» قبل «تأكيد فوري للحجز»)
              <li
                key={f.title.text_ar}
                style={{ "--o": i ^ 1 } as CSSProperties}
                className="max-xl:order-(--o) flex h-[52px] items-center gap-2 rounded-[14px] border border-white/12 bg-white/7 px-3 py-2.5 xl:h-auto xl:min-h-[98px] xl:gap-3 xl:rounded-lg xl:border-white/24 xl:bg-white/12 xl:p-3.5"
              >
                <FigmaIcon name={f.icon} size={40} className="max-xl:hidden" />
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-neon-green text-deep-charcoal xl:hidden">
                  <Icon name={f.glyph} size={16} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-[13px]/[20px] font-medium text-white xl:text-label-l">{s(f.title)}</p>
                  <p className="text-caption text-cool-gray max-xl:hidden">{s(f.body)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex w-full flex-col max-md:order-2">
            <Download s={s} content={content} />
          </div>
        </div>

        {/* Phones stage (700×720) — الجوالين صور مصدّرة من الفيجما، والشيبس HTML؛ تحت xl بنص المقاس */}
        <div className="relative mx-auto h-[360px] w-[350px] shrink-0 max-[389px]:[zoom:0.9] xl:mx-0 xl:h-[720px] xl:w-[700px]">
          <div className="absolute start-0 top-0 h-[720px] w-[700px] scale-50 ltr:origin-top-left rtl:origin-top-right xl:scale-100">
          {/* Phone · Home (مايل -13°) على الطرف · Phone · Voucher (+13°) — الإطار 354×551 والجوال 246×508 */}
          <FloatPhone kind="home" className="absolute end-0 top-[94.66px] flex h-[550.7px] w-[354px] items-center justify-center">
            <div role="img" aria-label={s(a.phones_alt)} className="-rotate-13 [zoom:0.9524]">
              <AppPhone screen={`/figma/home/app/phone-home${locale === "en" ? "-en" : ""}.png`} />
            </div>
          </FloatPhone>
          <FloatPhone kind="voucher" className="absolute end-[335.6px] top-[120px] flex h-[550.7px] w-[354px] items-center justify-center">
            <div className="rotate-13 [zoom:0.9524]">
              <AppPhone screen={`/figma/home/app/phone-voucher${locale === "en" ? "-en" : ""}.png`} />
            </div>
          </FloatPhone>
          {/* الشيبس بتودّي لشاشاتها: W2-36 تأكيد الحجز · W2-66 باقات الوكالات · W2-37 متابعة الحجز (القسيمة) */}
          {/* في الإنجليزي النص أطول — نثبّته من بداية المسرح بدل ما يمتد برّه على العنوان */}
          <PopChip kind="accepted" className="absolute end-[400px] top-5 ltr:start-0 ltr:end-auto">
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
            <Link href={routes.booking("BK-21452")} className={`${chip} bg-white text-deep-charcoal`}>
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
