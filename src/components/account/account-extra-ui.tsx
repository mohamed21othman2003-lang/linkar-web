import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// قطع مشتركة بين صفحات الحساب (الجزء 2) — كلها من نفس أنماط الفيجما في فريمات W2-64…W2-70

// «Title»: عنوان الصفحة 26/40 + وصف 16/28 (وفي باقات الوكالات v2: 32/48)، وزر اختياري في آخر السطر
export function AxTitle({ title, description, action, large = false }: { title: string; description: string; action?: ReactNode; large?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className={`flex min-w-0 flex-col ${large ? "gap-1.5" : "gap-1"}`}>
        <h1 className={large ? "text-h3 md:text-h2 text-deep-charcoal" : "text-h3 text-deep-charcoal"}>{title}</h1>
        <p className="text-body-m text-state-gray">{description}</p>
      </div>
      {action}
    </div>
  );
}

// «Head · …»: عنوان قسم 22/34 + سطر 14/24 اختياري، وعنصر في آخر السطر (فلتر مثلاً)
export function AxSectionHead({ title, subtitle, aside, id }: { title: string; subtitle?: string; aside?: ReactNode; id?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 id={id} className="text-h4 text-deep-charcoal">
          {title}
        </h2>
        {subtitle && <p className="text-body-s text-state-gray">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

// «Empty state» (W2-xx-0): كارت أبيض، دائرة ليموني 72 بأيقونة 32، عنوان، نص، وزر ليموني 52
// الزر رابط (cta.href) أو زر بيفتح نافذة (cta.onClick — W2-67-0 / W2-68-0)
export function AxEmpty({ icon, title, text, cta }: { icon: UiGlyph; title: string; text: string; cta: { label: string; href: string } | { label: string; onClick: () => void } }) {
  const cls = "inline-flex h-control-lg items-center justify-center rounded-[14px] bg-neon-green px-[22px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover";
  return (
    <section className="flex flex-col items-center gap-3.5 rounded-[20px] border border-cool-gray bg-white px-6 py-12 text-center md:px-10">
      <span className="flex size-[72px] items-center justify-center rounded-full bg-neon-green/18">
        <Icon name={icon} size={32} className="text-deep-charcoal" />
      </span>
      <h2 className="text-h4 text-deep-charcoal">{title}</h2>
      <p className="max-w-[520px] text-body-m text-state-gray">{text}</p>
      {"href" in cta ? (
        <Link href={cta.href} className={cls}>
          {cta.label}
        </Link>
      ) : (
        <button type="button" onClick={cta.onClick} className={cls}>
          {cta.label}
        </button>
      )}
    </section>
  );
}

// «Use rule» / «Size note» / «Security»: صندوق رمادي r20 بأيقونة 16 في أول السطر
export function AxNote({ icon = "info", children, className = "" }: { icon?: UiGlyph; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-[20px] bg-tile px-[18px] py-3.5 ${className}`}>
      <Icon name={icon} size={16} className="mt-1 shrink-0 text-deep-charcoal" />
      <p className="text-body-s text-deep-charcoal">{children}</p>
    </div>
  );
}

// تبويبات كبسولة (W2-64 · تبويبات / W2-69 · تبويبات / W2-69b): روابط، النشط كحلي بنص ليموني
export function AxTabs({ items, label }: { items: { key: string; label: string; href: string; active: boolean }[]; label: string }) {
  return (
    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <nav aria-label={label} className="inline-flex gap-1 rounded-full bg-cool-gray/35 p-1">
        {items.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={t.active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-label-m whitespace-nowrap transition-colors max-md:py-[9px] ${
              t.active ? "bg-deep-charcoal text-neon-green" : "text-deep-charcoal hover:bg-white/70"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// «Partner logo · Size=Tile»: شعار المقدّم في مربع أبيض r16 بحد رمادي
export function PartnerTile({ src, alt, size = 48 }: { src: string; alt: string; size?: 40 | 44 | 48 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cool-gray bg-white p-1"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} width={size * 2} height={size * 2} sizes={`${size * 2}px`} className="size-full object-contain" />
    </span>
  );
}

// شارة حالة كبسولة 30px (مفتوحة/مغلقة/الافتراضية/+50 نقطة)
export function AxPill({ tone, children }: { tone: "lime" | "success" | "muted" | "dark"; children: ReactNode }) {
  const tones = {
    lime: "bg-neon-green text-deep-charcoal",
    success: "bg-nature-green/14 text-green-active",
    muted: "bg-cool-gray/60 text-deep-charcoal",
    dark: "bg-deep-charcoal text-neon-green",
  } as const;
  return <span className={`inline-flex h-[30px] shrink-0 items-center rounded-full px-3 text-caption whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}
