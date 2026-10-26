import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// أجزاء «Band» المشتركة في صفحات تصميم العميل المعدّل: W2-93 برامج الشركات · W2-95 من نحن · W2-100 المدونة

// رأس القسم: overline (14 Medium) + عنوان (32 Bold) + وصف (18 Light) — عرض 820 في الفيجما
export function BandHead({
  overline,
  title,
  body,
  tone = "light",
  className = "",
  titleClass = "",
}: {
  overline: string;
  title: ReactNode;
  body?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  titleClass?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={`flex max-w-[820px] flex-col gap-2.5 ${className}`}>
      <p className={`text-overline ${dark ? "text-neon-green" : "text-green-dark"}`}>{overline}</p>
      <h2 className={`text-[26px]/[40px] font-bold md:text-h2 ${dark ? "text-white" : "text-deep-charcoal"} ${titleClass}`}>{title}</h2>
      {body && <p className={`text-body-m md:text-body-l ${dark ? "text-v3-card-stroke" : "text-state-gray"}`}>{body}</p>}
    </div>
  );
}

// Grid pattern — خطوط #152935/5 كل 48px بتختفي لتحت (Fade mask) — 760 ارتفاع من أول القسم
export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 hidden h-[760px] [mask-image:linear-gradient(to_bottom,#000,transparent)] lg:block ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(21 41 53 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(21 41 53 / 0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

// مربع أيقونة (44 r12 أو 48 r14 …) — tone: neon = ليموني بأيقونة كحلي · dark = كحلي بأيقونة ليموني
export function GlyphTile({ icon, tone = "neon", size = 44, glyph = 22, radius = 12 }: { icon: UiGlyph; tone?: "neon" | "dark"; size?: number; glyph?: number; radius?: number }) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: radius }}
      className={`flex shrink-0 items-center justify-center ${tone === "neon" ? "bg-neon-green text-deep-charcoal" : "bg-deep-charcoal text-neon-green"}`}
    >
      <Icon name={icon} size={glyph} />
    </span>
  );
}

// زر حبّة (r999، 56 ارتفاع) — «اطلب عرضاً لشركتك ‹» و«تواصل مع فريق الأعمال»
export const pillClass = {
  primary: "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-neon-green ps-[26px] pe-[22px] text-label-l font-bold text-deep-charcoal transition-colors hover:bg-bg-brand-hover",
  outline: "inline-flex h-14 items-center justify-center rounded-full border border-deep-charcoal bg-white px-6 text-label-l text-deep-charcoal transition-colors hover:bg-tile",
};
