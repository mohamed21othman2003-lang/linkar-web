import { ICON_SPRITE_VERSION, type UiGlyph, type ServiceIcon } from "./generated";

// Icon colors come from text color (currentColor); Figma tones map to:
// Green=text-nature-green, Neon=text-neon-green, Charcoal=text-deep-charcoal, White=text-white,
// Gray=text-state-gray, Red=text-promotional-red, Orange=text-v3-rating-star
// الرسومات نفسها في sprite خارجي (public/icons) بيتحمّل مرة واحدة ويتكاش — مش جوه كل صفحة وجوه الـJS.

export type { UiGlyph, ServiceIcon };

const UI_SPRITE = `/icons/ui.svg?v=${ICON_SPRITE_VERSION}`;
const SERVICE_SPRITE = `/icons/service.svg?v=${ICON_SPRITE_VERSION}`;

export interface IconProps {
  name: UiGlyph;
  size?: number;
  className?: string;
  /** Mirror in LTR, for directional glyphs (e.g. chevrons) drawn for RTL. */
  flip?: boolean;
}

export function Icon({ name, size = 24, className, flip }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={`${flip ? "dir-flip " : ""}${className ?? ""}`}>
      <use href={`${UI_SPRITE}#${name}`} />
    </svg>
  );
}

export interface ServiceGlyphProps {
  name: ServiceIcon;
  size?: number;
  className?: string;
}

export function ServiceGlyph({ name, size = 48, className }: ServiceGlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <use href={`${SERVICE_SPRITE}#${name}`} />
    </svg>
  );
}
