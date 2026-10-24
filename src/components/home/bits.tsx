import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { logoSize } from "@/lib/data/providers";

// أيقونات Brand icon / Feature icon من الفيجما (public/figma/home/icons) — مقاسها ثابت زي الفيجما
export function FigmaIcon({ name, size, className = "" }: { name: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/figma/home/icons/${name}.svg`} alt="" width={size} height={size} className={`shrink-0 ${className}`} style={{ width: size, height: size }} />;
}

// Section header: overline + عنوان H2 + وصف، ورابط «كل …» في آخر السطر
// tone: light = V2-01 (#48863e) · dark = على كحلي · guest = V2-02 (#3a6932)
export function SectionHead({
  overline,
  title,
  description,
  link,
  tone = "light",
  descBold = false,
  titleMedium = false,
  className = "",
  textClass = "max-w-[820px]",
  aside,
}: {
  overline: string;
  title: ReactNode;
  description?: string;
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
  const desc = tone === "dark" ? "text-cool-gray" : "text-state-gray";
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6 ${className}`}>
      <div className={`flex flex-col gap-2.5 ${textClass}`}>
        <p className={`text-overline ${over}`}>{overline}</p>
        <h2 className={`text-[26px]/[40px] md:text-h2 ${titleMedium ? "font-medium md:font-medium" : ""} ${titleColor}`}>{title}</h2>
        {description && <p className={`text-body-l ${descBold ? "leading-[28px] font-bold" : ""} ${desc}`}>{description}</p>}
      </div>
      {aside}
      {link && <SectionLink {...link} tone={tone} />}
    </div>
  );
}

export function SectionLink({ label, href, tone = "light" }: { label: string; href: string; tone?: "light" | "dark" | "guest" }) {
  if (tone === "guest")
    return (
      <Link href={href} className="flex shrink-0 items-center gap-1 text-label-l text-green-active hover:underline">
        {label}
        <Icon name="chevron-left" size={16} flip className="text-nature-green" />
      </Link>
    );
  const dark = tone === "dark";
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1 text-[15px] leading-[22px] font-bold hover:underline ${dark ? "text-neon-green" : "text-green-dark"}`}
    >
      {label}
      <Icon name="chevron-left" size={18} flip className={dark ? "text-neon-green" : "text-nature-green"} />
    </Link>
  );
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
}: {
  slug: string;
  alt: string;
  size: number;
  width?: number;
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
  const box = width ? { w: Math.min(w - 40, 128), h: size - 22 } : { w: size * 0.74, h: size * 0.62 };
  const scale = Math.min(box.w / lw, box.h / lh);
  const iw = Math.max(1, Math.round(lw * scale));
  const ih = Math.max(1, Math.round(lh * scale));
  const inner = (
    <Image src={src} alt={alt} width={iw} height={ih} sizes={`${iw * 2}px`} className="object-contain" style={{ width: iw, height: ih }} />
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
