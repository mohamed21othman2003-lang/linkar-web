import Image from "next/image";
import type { ReactNode } from "react";
import type { BookingStatus } from "@/lib/data/account/bookings";

// قطع صغيرة مشتركة بين شاشات الحساب (الجزء الأول) — بدون "use client" عشان تشتغل في السيرفر والعميل.

// Partner logo · Tile (566:1939): مربع أبيض r16 بحد cool-gray والشعار جوّه بهامش ~10%
const tileLogos = new Set(["johnson", "xpel", "lamaa", "nanoshield", "nukhba", "bareeq"]);
const tilePad: Record<string, string> = { bareeq: "15% 31%" };

export function ProviderTile({ slug, alt, size, className = "" }: { slug: string; alt: string; size: number; className?: string }) {
  const src = tileLogos.has(slug) ? `/figma/account/logos/${slug}.png` : `/figma/logos/${slug}.png`;
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-[16px] border border-cool-gray bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size * 2}px`} className="object-contain" style={{ padding: tilePad[slug] ?? "9.7%" }} />
    </span>
  );
}

// شارة الحالة في جدول حجوزاتي (W2-38): خلفية فاتحة + نقطة 6px
const statusStyles: Record<BookingStatus, { pill: string; dot: string }> = {
  waiting: { pill: "bg-neon-green/20 text-deep-charcoal", dot: "bg-nature-green" },
  in_service: { pill: "bg-nature-green/16 text-green-active", dot: "bg-nature-green" },
  completed: { pill: "bg-cool-gray/50 text-deep-charcoal", dot: "bg-state-gray" },
  cancelled: { pill: "bg-promotional-red/10 text-promotional-red", dot: "bg-promotional-red" },
};

export function StatusDotPill({ status, label }: { status: BookingStatus; label: string }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption whitespace-nowrap ${s.pill}`}>
      <span className={`size-1.5 shrink-0 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

// أيقونة من مجموعة Brand/Feature icon (أخضر) — ملفات SVG في public/figma/account/icons
export function BrandIcon({ name, size, className = "" }: { name: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/figma/account/icons/${name}.svg`} alt="" width={size} height={size} className={`shrink-0 ${className}`} />;
}

// كارت أبيض بحد cool-gray (كروت متابعة الحجز والإعدادات)
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[24px] border border-cool-gray bg-white ${className}`}>{children}</section>;
}

// عنوان الصفحة داخل الحساب: H3 + وصف Body M (وعلى الطرف التاني زر/أزرار)
export function AccountTitle({ title, subtitle, aside }: { title: string; subtitle?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-h3 text-deep-charcoal">{title}</h1>
        {subtitle && <p className="text-body-m text-state-gray">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

// كود القسيمة: الأرقام Bold والحروف عادية (LK-9F3K-7QPD)
export function VoucherCode({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span dir="ltr" className={className}>
      {code.split(/(\d+)/).map((part, i) => (/\d/.test(part) ? <b key={i} className="font-bold">{part}</b> : <span key={i} className="font-normal">{part}</span>))}
    </span>
  );
}
