import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { GuestHomeContent } from "@/lib/server/home";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Container } from "@/components/ui/Container";
import { FigmaIcon } from "../bits";
import { FloatPhone } from "../motion";

type S = (x: { text_ar: string; text_en: string }) => string;

// «امسح للتحميل» + QR + شارات المتاجر
function Download({ s, a, platforms }: { s: S; a: GuestHomeContent["appGuest"]; platforms: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-4 sm:gap-5">
      <StoreBadges height={48} className="flex-col gap-2.5!" />
      <div className={`flex items-center gap-3 rounded-lg bg-white p-2.5 ${platforms ? "h-[92px]" : "h-[104px]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/home/qr-code.svg" alt="" width={72} height={72} loading="lazy" className="size-[72px]" />
        <div className="flex w-[88px] flex-col gap-0.5">
          <span className="text-label-m text-deep-charcoal">{s(a.scan)}</span>
          {platforms && <span className="text-caption text-state-gray">{s(a.platforms)}</span>}
        </div>
      </div>
    </div>
  );
}

// Phone · Home / Phone · Voucher في V2-02 (964:311734 / 858:319414) — 258.3×533.8. هيكل الجوال (الجسم والإطار
// والنوتش والأزرار واللمعة والظل) HTML بمقاسات الفيجما، والشاشة بس صورة متصدّرة. كده الجوال بيتحرك كعنصر حقيقي
// من غير مربع خلفية حواليه (التصدير الكامل بيطلع بخلفية السكشن الليموني).
export function GuestPhone({ screen }: { screen: string }) {
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

// V2-02 · App (37:28940) — ليموني: النص + الجوالين من تحت
export function AppGuestBand({ locale, content, id }: { locale: Locale; content: GuestHomeContent; id: string }) {
  const a = content.appGuest;
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
          <Download s={s} a={a} platforms />
        </div>
        {/* Phones (619:2124): جوالين بيطفوا — Voucher على الطرف (x=0) وHome جنبه (x=282.3) */}
        <div role="img" aria-label={s(a.phones_alt)} className="relative mx-auto h-[267px] w-[270px] shrink-0 sm:h-[534px] sm:w-[541px] lg:mx-0">
          <div className="absolute start-0 top-0 h-[534px] w-[541px] scale-50 ltr:origin-top-left rtl:origin-top-right sm:scale-100">
            <FloatPhone kind="guest-voucher" className="absolute end-0 top-0">
              <GuestPhone screen="/figma/home/guest/app-screen-voucher.png" />
            </FloatPhone>
            <FloatPhone kind="guest-home" className="absolute end-[282.3px] top-0">
              <GuestPhone screen="/figma/home/guest/app-screen-home.png" />
            </FloatPhone>
          </div>
        </div>
      </Container>
    </section>
  );
}
