import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref, packageHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { formatNumber, formatPrice } from "@/lib/format";
import { getCommon } from "@/i18n/dict/common";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile, SectionHead } from "../bits";

// V2-02 · Offers (619:1884) — كروت عروض بيضا: الخصم، أيقونات الخدمات، العنوان، المقدّم، المميزات، السعر و«احجز العرض»
export function OffersGuestBand({ locale, content, providers }: { locale: Locale; content: HomeContent; providers: Provider[] }) {
  const o = content.offersGuest;
  const t = getCommon(locale);
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="bg-cool-gray/35 py-16 lg:py-24">
      <Container className="flex flex-col gap-9">
        <SectionHead
          tone="guest"
          textClass="max-w-[680px]"
          overline={s(o.head.overline)}
          title={s(o.head.title)}
          link={{ label: s(o.head.link), href: homeHref(o.head.link.href_key) }}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {o.cards.map((c) => {
            const p = providers.find((x) => x.slug === c.provider);
            if (!p) return null;
            const multi = c.services.length > 1;
            const href = c.package_slug ? packageHref(c.package_slug) : c.is_package ? packageHref() : routes.provider(p.slug);
            return (
              <article key={c.provider} className="flex flex-col gap-4 rounded-2xl bg-white p-6 lg:min-h-[411px] min-[1440px]:h-[411px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex [&>*+*]:-ms-2.5">
                    {c.services.map((svc) => (
                      <span
                        key={svc}
                        className={`flex items-center justify-center rounded-md bg-neon-green shadow-[0_4px_10px_#0000001f] ${multi ? "size-12" : "size-[60px]"}`}
                      >
                        <ServiceGlyph name={svc} size={multi ? 28 : 35} className="text-deep-charcoal" />
                      </span>
                    ))}
                  </span>
                  <span className="flex h-[38px] items-center gap-1.5 rounded-full bg-deep-charcoal px-3.5 whitespace-nowrap">
                    <Icon name="tag" size={16} className="text-neon-green" />
                    {c.is_package && <span className="text-label-m text-white">{s(o.package_label)}</span>}
                    <span className="text-label-l text-neon-green">{t.discount(c.discount)}</span>
                  </span>
                </div>
                <h3 className="text-h4 text-deep-charcoal">
                  <Link href={href} className="hover:underline">
                    {s(c.title)}
                  </Link>
                </h3>
                <Link href={routes.provider(p.slug)} className="flex items-center gap-2.5 self-start text-label-m text-deep-charcoal hover:underline">
                  <LogoTile slug={p.slug} alt="" size={40} />
                  {tx(locale, p, "name")}
                </Link>
                <ul className="flex flex-wrap gap-2 lg:-mb-4">
                  {c.includes.map((inc) => (
                    <li key={inc.text.text_ar} className="flex items-center gap-1.5 rounded-full bg-cool-gray/35 px-3 py-[5px] text-caption text-deep-charcoal">
                      <FigmaIcon name={inc.icon} size={18} />
                      {s(inc.text)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-4">
                  <span className="h-px bg-cool-gray" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-baseline gap-2">
                      <span className="text-h3 text-deep-charcoal">{formatPrice(locale, c.price)}</span>
                      <s className="text-caption text-state-gray">{formatNumber(c.old_price)}</s>
                    </p>
                    <p className="flex items-center gap-1 text-caption text-green-active">
                      <Icon name="clock" size={16} className="text-nature-green" />
                      {s(c.ends)}
                    </p>
                  </div>
                  {/* Button (619:1947) → W2-33 · الفرع */}
                  <Link
                    href={routes.bookingBranch}
                    className="flex h-control-lg items-center justify-center rounded-[14px] bg-neon-green text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
                  >
                    {s(o.book)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
