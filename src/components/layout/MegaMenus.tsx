import Link from "next/link";

export type MenuItemView = { title: string; subtitle: string; href: string; icon: string; highlighted?: boolean };
export type LinkView = { label: string; href: string };

function MenuItemRow({ item, onNavigate }: { item: MenuItemView; onNavigate?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-tile ${item.highlighted ? "bg-tile" : ""}`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.highlighted ? "bg-neon-green" : "bg-tint-lime"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.icon} alt="" width={20} height={20} />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-label-l text-deep-charcoal">{item.title}</span>
        <span className="text-body-s text-state-gray">{item.subtitle}</span>
      </span>
    </Link>
  );
}

export type AboutMenuView = {
  featured: { eyebrow: string; title: string; body: string; cta: string; ctaHref: string };
  customersTitle: string;
  customers: MenuItemView[];
  aboutTitle: string;
  about: MenuItemView[];
  policiesLabel: string;
  policies: LinkView[];
};

// W2-10 · قائمة «من نحن» (1095:29543) — 1040 عرض، r24
export function AboutMegaMenu({ m, onNavigate }: { m: AboutMenuView; onNavigate?: () => void }) {
  return (
    <div className="w-[1040px] overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-[0_12px_24px_-12px_#0b0d0a33]">
      <div className="flex items-start justify-end gap-6 p-6">
        <div className="flex w-[300px] flex-col gap-1">
          <p className="text-[14px] leading-4 font-bold text-text-secondary">{m.aboutTitle}</p>
          {m.about.map((i) => (
            <MenuItemRow key={i.href} item={i} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="flex w-[300px] flex-col gap-1">
          <p className="text-body-s text-text-secondary">{m.customersTitle}</p>
          {m.customers.map((i) => (
            <MenuItemRow key={i.href} item={i} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="flex w-[320px] flex-col items-start gap-3 rounded-xl bg-deep-charcoal p-6">
          <span className="flex size-12 items-center justify-center rounded-lg bg-neon-green">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/icons/menu-download.svg" alt="" width={24} height={24} />
          </span>
          <p className="text-body-s text-neon-green">{m.featured.eyebrow}</p>
          <p className="text-h5 text-white">{m.featured.title}</p>
          <p className="text-body-s text-white/72">{m.featured.body}</p>
          <Link
            href={m.featured.ctaHref}
            onClick={onNavigate}
            className="flex h-control-md items-center rounded-md bg-neon-green px-5 text-body-m text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {m.featured.cta}
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 bg-tile px-6 py-4">
        <span className="flex items-center gap-1.5 text-label-m text-state-gray">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/icons/menu-file.svg" alt="" width={16} height={16} />
          {m.policiesLabel}
        </span>
        {m.policies.map((l) => (
          <Link key={l.href} href={l.href} onClick={onNavigate} className="text-label-m leading-[18px] font-bold text-green-active hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

type BizCard = { eyebrow: string; title: string; body: string; cta: string; ctaHref: string; login: string; loginHref: string };

export type BusinessMenuView = {
  providersCard: BizCard;
  dealersCard: BizCard;
  providersTitle: string;
  providers: MenuItemView[];
  companiesTitle: string;
  companies: MenuItemView[];
  affiliatesTitle: string;
  affiliates: LinkView[];
};

function BusinessCard({ c, dark, icon, onNavigate }: { c: BizCard; dark: boolean; icon: string; onNavigate?: () => void }) {
  return (
    <div className={`flex w-[335px] flex-col items-start gap-3 rounded-xl p-6 ${dark ? "bg-deep-charcoal" : "bg-tile"}`}>
      <span className="flex size-12 items-center justify-center rounded-lg bg-neon-green">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" width={24} height={24} />
      </span>
      <p className={`text-label-m leading-4 font-bold ${dark ? "text-neon-green" : "text-green-active"}`}>{c.eyebrow}</p>
      <p className={`text-h5 ${dark ? "text-white" : "text-deep-charcoal"}`}>{c.title}</p>
      <p className={`text-body-s ${dark ? "text-white/72" : "text-v3-text-meta"}`}>{c.body}</p>
      <Link
        href={c.ctaHref}
        onClick={onNavigate}
        className="flex h-control-sm items-center rounded-md bg-neon-green px-3.5 text-label-m leading-[18px] font-bold text-deep-charcoal hover:bg-bg-brand-hover"
      >
        {c.cta}
      </Link>
      <Link
        href={c.loginHref}
        onClick={onNavigate}
        className={`flex items-center gap-1 text-label-m leading-[18px] font-bold ${dark ? "text-neon-green" : "text-green-active"}`}
      >
        {c.login}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dark ? "/figma/icons/menu-arrow-neon.svg" : "/figma/icons/menu-arrow-green.svg"} alt="" width={16} height={16} className="dir-flip" />
      </Link>
    </div>
  );
}

// W2-11 · قائمة «لينكار للأعمال» (1095:29629) — 1036 عرض
export function BusinessMegaMenu({ m, onNavigate }: { m: BusinessMenuView; onNavigate?: () => void }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-4 shadow-[0_12px_12px_#0b0d0a33]">
      <div className="flex w-[300px] flex-col gap-1 pt-2">
        <p className="text-body-s text-state-gray">{m.providersTitle}</p>
        {m.providers.map((i) => (
          <MenuItemRow key={i.href} item={i} onNavigate={onNavigate} />
        ))}
        <span className="h-3" />
        <p className="text-body-s text-state-gray">{m.companiesTitle}</p>
        {m.companies.map((i) => (
          <MenuItemRow key={i.href} item={i} onNavigate={onNavigate} />
        ))}
        <div className="flex flex-col items-start gap-2 border-t border-cool-gray pt-3">
          <p className="text-caption text-state-gray">{m.affiliatesTitle}</p>
          {m.affiliates.map((l) => (
            <Link key={l.label} href={l.href} onClick={onNavigate} className="text-label-l text-deep-charcoal hover:underline">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <BusinessCard c={m.providersCard} dark icon="/figma/icons/menu-building.svg" onNavigate={onNavigate} />
      <BusinessCard c={m.dealersCard} dark={false} icon="/figma/icons/menu-car.svg" onNavigate={onNavigate} />
    </div>
  );
}
