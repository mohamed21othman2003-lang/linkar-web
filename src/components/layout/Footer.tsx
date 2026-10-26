import Link from "next/link";
import Image from "next/image";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSite } from "@/lib/server/content";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/brand/Logo";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Container } from "@/components/ui/Container";

// v2 · Footer (85:30640) — غامق (Brand Dark)، 4 أعمدة روابط + عمود الهوية، وتحت: وسائل الدفع والحقوق
// تابلت (Footer · تابلت 85:34859): الهوية بعرض كامل والأعمدة الأربعة تحتها · موبايل (85:34172): الأعمدة أكورديون
export async function Footer() {
  const [locale, site] = await Promise.all([getLocale(), getSite()]);
  const f = site.footer;
  const link = "text-body-s text-text-secondary hover:text-white";
  return (
    <footer className="theme-dark bg-bg-canvas pt-9 pb-7 text-text-primary md:pt-[72px] md:pb-8">
      <Container className="flex flex-col gap-[18px] max-md:px-5 md:gap-12">
        <div className="flex flex-col gap-[18px] md:gap-9 xl:flex-row xl:gap-12">
          <div className="contents md:flex md:flex-col md:items-start md:gap-[18px] xl:w-[380px] xl:shrink-0">
            <div className="max-md:[&_img]:w-[150px]!">
              <Logo tone="inverse" width={240} label={tx(locale, site, "brand_name")} />
            </div>
            <p className="text-[13px]/[24px] text-text-secondary md:text-body-s">{tx(locale, f, "about")}</p>
            <StoreBadges className="max-md:order-2" />
            <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 text-body-s text-text-secondary hover:text-white max-md:order-3">
              <Icon name="mail" size={16} />
              <span dir="ltr">{site.email}</span>
            </a>
            <div className="flex gap-2.5 max-md:order-4">
              {f.social.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-[20px] border border-white/18 bg-white/8 hover:bg-white/15"
                >
                  <Image src={`/figma/social/${s.platform}.svg`} alt="" width={18} height={18} unoptimized />
                </a>
              ))}
            </div>
          </div>
          <div className="hidden flex-1 grid-cols-4 gap-4 md:grid xl:gap-12">
            {f.columns.map((col) => (
              <div key={col.title_ar} className="flex flex-col gap-3.5">
                <p className="text-label-l">{tx(locale, col, "title")}</p>
                {col.links.map((l) => (
                  <Link key={l.label_ar} href={l.href} className={link}>
                    {tx(locale, l, "label")}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          {/* موبايل: أكورديون (Row 52 + سهم) */}
          <div className="flex flex-col max-md:order-1 md:hidden">
            {f.columns.map((col) => (
              <details key={col.title_ar} className="group border-b border-white/10">
                <summary className="flex h-[52px] cursor-pointer list-none items-center justify-between text-[15px] leading-[24px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {tx(locale, col, "title")}
                  <Icon name="chevron-down" size={16} className="transition-transform duration-200 ease-figma-out group-open:rotate-180" />
                </summary>
                <div className="flex flex-col gap-3 pb-4">
                  {col.links.map((l) => (
                    <Link key={l.label_ar} href={l.href} className={link}>
                      {tx(locale, l, "label")}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="h-px bg-deep-charcoal max-md:hidden" />
        <div className="flex flex-col-reverse gap-[18px] md:gap-3.5 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="flex flex-col gap-0.5 text-caption">
            <p className="text-text-secondary">{tx(locale, f, "copyright")}</p>
            <p className="text-white/65">{tx(locale, f, "registry")}</p>
          </div>
          <ul className="flex flex-wrap gap-2 max-xl:self-start rtl:justify-end" dir="ltr">
            {f.payments.map((p) => (
              <li key={p} className="flex h-[26px] items-center rounded-xs border border-white/12 px-2 text-label-m text-text-secondary">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
