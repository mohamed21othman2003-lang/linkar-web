import type { ServiceSlug } from "@/lib/data/types";

// Service icon (5:1111) — رموز الخدمات بأسلوب Lucide في نسخة العميل (صفحة 0:1): Neon / Dark / White / Outline على بلاطة 48.
// المسارات من تصدير SVG للفيجما بالحرف، في sprite خارجي public/icons/guest-service.svg (بيتكاش، مش جوه الصفحة):
// «<slug>-bold» = Neon/Dark (خط 2.33) · «<slug>-grad» = White (متدرّج ليموني→أخضر) · «<slug>-thin» = Outline (خط 1.46).
const SPRITE = "/icons/guest-service.svg?v=1";

const TILE = "M38.5509 0H9.46286C4.23771 0 0 4.23771 0 9.46286V38.5509C0 43.776 4.23771 48.0137 9.46286 48.0137H38.5509C43.776 48.0137 48.0137 43.776 48.0137 38.5509V9.46286C48.0137 4.23771 43.776 0 38.5509 0Z";

// Neon = بلاطة ليموني ورمز كحلي · Dark = بلاطة كحلي ورمز ليموني · White = بلاطة بيضا بظل ورمز متدرّج ليموني→أخضر · Outline = رمز أخضر بس
export function GuestServiceIcon({
  slug,
  variant,
  size,
  className = "",
}: {
  slug: ServiceSlug;
  variant: "neon" | "dark" | "white" | "outline";
  size: number;
  className?: string;
}) {
  const symbol = variant === "outline" ? "thin" : variant === "white" ? "grad" : "bold";
  const tile = variant === "neon" ? "#abf907" : variant === "dark" ? "#152935" : variant === "white" ? "#ffffff" : null;
  const ink = variant === "neon" ? "#231f20" : variant === "dark" ? "#abf907" : "#3bb34b";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={`shrink-0 ${variant === "white" ? "drop-shadow-[0_2px_3px_rgba(20,41,54,0.16)]" : ""} ${className}`}
    >
      {tile && <path d={TILE} fill={tile} />}
      <use href={`${SPRITE}#${slug}-${symbol}`} fill={ink} />
    </svg>
  );
}
