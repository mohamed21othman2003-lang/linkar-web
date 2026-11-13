import { ICON_SPRITE_VERSION, type UiGlyph } from "./icon-names";

// أيقونات "UI icon" (القسم 3.6) — نفس الـsprite بتاع موقع العملاء (public/icons/ui.svg)، اللون من currentColor.
// TODO(Figma): تصدير أيقونات اللوحة الناقصة (dashboard, chart-bars, pencil …) من صفحة linkar-control-panel لما Figma يتوصل.
export type { UiGlyph };

const SPRITE = `/icons/ui.svg?v=${ICON_SPRITE_VERSION}`;

export function Icon({ name, size = 20, className }: { name: UiGlyph; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <use href={`${SPRITE}#${name}`} />
    </svg>
  );
}
