import Image from "next/image";
import type { ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";

// قطع صغيرة مشتركة بين W2-21 و W2-32 ونوافذهم (آمنة للسيرفر والعميل)

// Brand icon (Outline · أخضر): shield / user / calendar / car — 22/18/16px
const brandIcons = {
  shield: { src: "/figma/provider/icons/shield-outline.svg", w: 0.6228, h: 0.6348 },
  user: { src: "/figma/provider/icons/user-outline.svg", w: 0.5997, h: 0.5849 },
  calendar: { src: "/figma/provider/icons/calendar-outline.svg", w: 0.6142, h: 0.6828 },
  car: { src: "/figma/provider/icons/car-outline.svg", w: 0.6252, h: 0.4045 },
} as const;
export type BrandIconName = keyof typeof brandIcons;

export function BrandIcon({ name, size = 16 }: { name: BrandIconName; size?: number }) {
  const b = brandIcons[name];
  return (
    <span className="flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.src} alt="" style={{ width: size * b.w, height: size * b.h }} />
    </span>
  );
}

// Partner logo · Tile — مربع أبيض بحدود والشعار جوّه (r16 في 96، أصغر في المقاسات الصغيرة)
export function LogoTile({ src, alt, size, radius = 16, className = "" }: { src: string; alt: string; size: number; radius?: number; className?: string }) {
  const inner = Math.round(size * 0.8);
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-cool-gray bg-white ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Image src={src} alt={alt} width={inner} height={inner} sizes={`${inner * 2}px`} className="object-contain" style={{ width: inner, height: inner }} />
    </span>
  );
}

// v2 · Service tile · Linkar — Neon (خلفية ليموني) أو Outline (رمادي)
export function ServiceTile({ name, size, variant = "neon" }: { name: ServiceSlug; size: number; variant?: "neon" | "outline" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md ${variant === "neon" ? "bg-neon-green text-deep-charcoal" : "text-state-gray"}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <ServiceGlyph name={name} size={Math.round(size * 0.583)} />
    </span>
  );
}

// نجوم التقييم الخضراء/الليموني
export function Stars({ n = 5, size = 16, className = "text-nature-green", label }: { n?: number; size?: number; className?: string; label?: string }) {
  return (
    <span className={`flex gap-0.5 ${className}`} role="img" aria-label={label}>
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} name="star-filled" size={size} />
      ))}
    </span>
  );
}

// شيب المواصفة الرمادي: «ضمان 9 سنوات» + درع · «يوم واحد» + تقويم
export function SpecPill({ icon, children, size = 16 }: { icon: BrandIconName; children: React.ReactNode; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cool-gray/35 px-2.5 py-1 text-caption text-deep-charcoal">
      <BrandIcon name={icon} size={size} />
      {children}
    </span>
  );
}

// رابط الخطوة 2 من الحجز (اختيار الفرع) — العقد المشترك مع صفحات الحجز:
// /booking/branch?provider=<slug>&services=<s1,s2>[&packages=<p1>][&size=suv|large][&ref=<code>]
export function bookingHref({
  provider,
  services,
  packages = [],
  size,
  ref,
}: {
  provider: string;
  services: string[];
  packages?: string[];
  size?: string;
  ref?: string;
}) {
  let q = `provider=${encodeURIComponent(provider)}&services=${services.map(encodeURIComponent).join(",")}`;
  if (packages.length) q += `&packages=${packages.map(encodeURIComponent).join(",")}`;
  if (size && size !== "sedan") q += `&size=${encodeURIComponent(size)}`;
  if (ref) q += `&ref=${encodeURIComponent(ref)}`;
  return `${routes.bookingBranch}?${q}`;
}
