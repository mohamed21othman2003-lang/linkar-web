import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { logoSize } from "@/lib/data/providers";

// أيقونات Brand icon / Feature icon من الفيجما (public/figma/home/icons) — مقاسها ثابت زي الفيجما
export function FigmaIcon({ name, size, className = "" }: { name: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/figma/home/icons/${name}.svg`} alt="" width={size} height={size} loading="lazy" className={`shrink-0 ${className}`} style={{ width: size, height: size }} />;
}

// نص بنسخ مختلفة حسب المقاس: d ديسكتوب (xl+)، t تابلت (md–xl)، m موبايل — V2-01t/V2-01m فيهم نصوص أقصر
export function RText({ d, t, m }: { d: string; t?: string; m?: string }) {
  const tab = t ?? d;
  const mob = m ?? tab;
  if (tab === d && mob === d) return <>{d}</>;
  return (
    <>
      <span className="max-xl:hidden">{d}</span>
      {tab === mob ? (
        <span className="xl:hidden">{tab}</span>
      ) : (
        <>
          <span className="hidden md:max-xl:inline">{tab}</span>
          <span className="md:hidden">{mob}</span>
        </>
      )}
    </>
  );
}

// Section header: overline + عنوان H2 + وصف، ورابط «كل …» في آخر السطر
// tone: light = V2-01 (#48863e) · dark = على كحلي · guest = V2-02 (#3a6932)
// موبايل 13/20 · 22/34 · 14/23 — تابلت 14/22 · 28/42 · 16/27 — ديسكتوب Overline · H2 · Body L
// الرابط على الموبايل بينزل تحت القسم (MobileLink) فهنا بيختفي
export function SectionHead({
  overline,
  title,
  description,
  link,
  tone = "light",
  descBold = false,
  titleMedium = false,
  className = "",
  textClass = "md:max-xl:max-w-[520px] xl:max-w-[820px]",
  aside,
}: {
  overline: string;
  title: ReactNode;
  description?: ReactNode;
  link?: { label: string; href: string };
  tone?: "light" | "dark" | "guest";
  descBold?: boolean;
  titleMedium?: boolean;
  className?: string;
  textClass?: string;
  aside?: ReactNode;
}) {
  const over = tone === "dark" ? "text-neon-green" : tone === "guest" ? "text-green-active" : "text-green-dark";
  const titleColor = tone === "dark" ? "text-white" : "text-deep-charcoal";
  const desc = tone === "dark" ? "text-v3-card-stroke xl:text-cool-gray" : "text-state-gray";
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6 ${className}`}>
      <div className={`flex flex-col gap-1.5 md:gap-2 xl:gap-2.5 ${textClass}`}>
        <p className={`text-[13px]/[20px] font-medium md:text-overline ${over}`}>{overline}</p>
        <h2 className={`text-[22px]/[34px] font-bold md:text-[28px]/[42px] xl:text-h2 ${titleMedium ? "xl:font-medium" : ""} ${titleColor}`}>{title}</h2>
        {description && (
          <p className={`text-[14px]/[23px] font-light md:text-[16px]/[27px] xl:text-body-l ${descBold ? "xl:leading-[28px] xl:font-bold" : ""} ${desc}`}>
            {description}
          </p>
        )}
      </div>
      {aside}
      {link && <SectionLink {...link} tone={tone} className="max-md:hidden" />}
    </div>
  );
}

export function SectionLink({ label, href, tone = "light", className = "" }: { label: string; href: string; tone?: "light" | "dark" | "guest"; className?: string }) {
  if (tone === "guest")
    return (
      <Link href={href} className={`flex shrink-0 items-center gap-1 text-label-l text-green-active hover:underline ${className}`}>
        {label}
        <Icon name="chevron-left" size={16} flip className="text-nature-green" />
      </Link>
    );
  const dark = tone === "dark";
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1 text-[14px] leading-[22px] font-semibold hover:underline md:text-[15px] md:leading-[24px] xl:leading-[22px] xl:font-bold ${
        dark ? "text-neon-green" : "text-green-active xl:text-green-dark"
      } ${className}`}
    >
      {label}
      <Icon name="chevron-left" size={18} flip className={`size-3.5 xl:size-[18px] ${dark ? "text-neon-green" : "text-nature-green"}`} />
    </Link>
  );
}

// رابط «كل …» تحت القسم على الموبايل (V2-01m)
export function MobileLink(props: { label: string; href: string; tone?: "light" | "dark" | "guest" }) {
  return <SectionLink {...props} className="self-start md:hidden" />;
}

// مقاسات نسخ الشعارات المقصوصة (public/figma/home/logos — نفس شعارات /figma/logos من غير الهوامش البيضا)
const trimmed: Record<string, [number, number]> = {
  "3m": [993, 525], "3seven": [189, 45], armor: [172, 228], autoplus: [188, 108], autoshabo: [192, 141],
  bareeq: [123, 240], carpro: [191, 39], crystal: [191, 216], dir: [138, 250], feynlab: [190, 36],
  "golden-wash": [123, 230], johnson: [531, 162], lamaa: [186, 62], llumar: [540, 316], nanoshield: [192, 141],
  nanox: [190, 46], nukhba: [186, 72], stek: [190, 63], suntek: [191, 47], "v-kool": [321, 62], viper: [190, 52],
  wraptek: [189, 94], xpel: [500, 132], zipart: [192, 46],
  // Partner logo · LLumar بيستخدم الشعار الأفقي (618:2071) مش المربّع
  "llumar-wide": [729, 140],
};

// Partner logo — صندوق أبيض بالشعار في النص (Tile 64/52/48/40/26 مربع، أو M = 169×64)
export function LogoTile({
  slug,
  alt,
  size,
  width,
  radius = "rounded-lg",
  border = true,
  href,
  className = "",
  fit,
}: {
  slug: string;
  alt: string;
  size: number;
  width?: number;
  // مقاس أقصى للشعار جوه الصندوق [عرض، ارتفاع] بدل الحساب الافتراضي
  fit?: [number, number];
  radius?: string;
  border?: boolean;
  href?: string;
  className?: string;
}) {
  const w = width ?? size;
  const file = slug === "llumar" ? "llumar-wide" : slug;
  const src = `/figma/home/logos/${file}.png`;
  // الشعار بيحافظ على نسبته ويتصغّر عشان يدخل جوه الصندوق بهامش
  const [lw, lh] = trimmed[file] ?? logoSize[slug] ?? [120, 48];
  const box = fit ? { w: fit[0], h: fit[1] } : width ? { w: Math.min(w - 40, 128), h: size - 22 } : { w: size * 0.74, h: size * 0.62 };
  const scale = Math.min(box.w / lw, box.h / lh);
  const iw = Math.max(1, Math.round(lw * scale));
  const ih = Math.max(1, Math.round(lh * scale));
  const inner = (
    <Image src={src} alt={alt} width={iw} height={ih} className="object-contain" style={{ width: iw, height: ih }} />
  );
  const cls = `flex shrink-0 items-center justify-center overflow-hidden bg-white ${radius} ${border ? "border border-cool-gray" : ""} ${className}`;
  const style = { width: width ? undefined : size, height: size, minWidth: width ? undefined : size };
  return href ? (
    <Link href={href} aria-label={alt} className={cls} style={style}>
      {inner}
    </Link>
  ) : (
    <span className={cls} style={style}>
      {inner}
    </span>
  );
}
