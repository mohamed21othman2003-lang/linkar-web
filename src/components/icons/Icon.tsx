import { UI_ICONS, SERVICE_ICONS, type UiGlyph, type ServiceIcon } from "./generated";

// Icon colors come from text color (currentColor); Figma tones map to:
// Green=text-nature-green, Neon=text-neon-green, Charcoal=text-deep-charcoal, White=text-white,
// Gray=text-state-gray, Red=text-promotional-red, Orange=text-v3-rating-star

export type { UiGlyph, ServiceIcon };

export interface IconProps {
  name: UiGlyph;
  size?: number;
  className?: string;
  /** Mirror in LTR, for directional glyphs (e.g. chevrons) drawn for RTL. */
  flip?: boolean;
}

export function Icon({ name, size = 24, className, flip }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`${flip ? "dir-flip " : ""}${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: UI_ICONS[name] }}
    />
  );
}

export interface ServiceGlyphProps {
  name: ServiceIcon;
  size?: number;
  className?: string;
}

export function ServiceGlyph({ name, size = 48, className }: ServiceGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      dangerouslySetInnerHTML={{ __html: SERVICE_ICONS[name] }}
    />
  );
}
