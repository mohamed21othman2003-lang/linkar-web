import Link from "next/link";
import Image from "next/image";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSite } from "@/lib/server/content";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/brand/Logo";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Container } from "@/components/ui/Container";

// v2 · Footer (689:2447) — غامق (Brand Dark)، 4 أعمدة روابط + عمود الهوية، وتحت: وسائل الدفع والحقوق
export async function Footer() {
  const [locale, site] = await Promise.all([getLocale(), getSite()]);
  const f = site.footer;
  return (
    <footer className="theme-dark bg-bg-canvas pt-[72px] pb-8 text-text-primary">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex flex-col items-start gap-[18px] lg:w-[380px] lg:shrink-0">
            <Logo tone="inverse" width={240} label={tx(locale, site, "brand_name")} />
            <p className="text-body-s text-text-secondary">{tx(locale, f, "about")}</p>
            <StoreBadges />
            <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 text-body-s text-text-secondary hover:text-white">
              <Icon name="mail" size={16} />
              <span dir="ltr">{site.email}</span>
            </a>
            <div className="flex gap-2.5">
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
          <div className="grid flex-1 grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-4">
            {f.columns.map((col) => (
              <div key={col.title_ar} className="flex flex-col gap-3.5">
                <p className="text-label-l">{tx(locale, col, "title")}</p>
                {col.links.map((l) => (
                  <Link key={l.label_ar} href={l.href} className="text-body-s text-text-secondary hover:text-white">
                    {tx(locale, l, "label")}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-deep-charcoal" />
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-0.5 text-caption">
            <p className="text-text-secondary">{tx(locale, f, "copyright")}</p>
            <p className="text-white/65">{tx(locale, f, "registry")}</p>
          </div>
          <ul className="flex flex-wrap gap-2" dir="ltr">
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
