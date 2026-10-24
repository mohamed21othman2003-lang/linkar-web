import { Icon, type UiGlyph } from "@/components/icons/Icon";
import type { PillTone } from "@/lib/data/search/types";

const tones: Record<PillTone, { box: string; icon: string }> = {
  green: { box: "bg-nature-green/14 text-green-active", icon: "text-nature-green" },
  dark: { box: "bg-deep-charcoal text-neon-green", icon: "text-neon-green" },
  gray: { box: "bg-tile text-deep-charcoal", icon: "text-state-gray" },
};

// شارة صغيرة في كروت النتائج: «يقدّم الخدمتين» · «عرض 15% على النانو» · «ضمان 3 سنوات»
export function Pill({ tone, icon, children }: { tone: PillTone; icon: UiGlyph; children: React.ReactNode }) {
  const t = tones[tone];
  return (
    <span className={`inline-flex h-[30px] shrink-0 items-center gap-[5px] rounded-full px-2.5 text-caption whitespace-nowrap ${t.box}`}>
      <Icon name={icon} size={12} className={t.icon} />
      {children}
    </span>
  );
}

// تصنيف/زر «الكل» في الفلاتر (Chip · P-12)
export function ChoiceChip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-label-m whitespace-nowrap transition-colors duration-150 ease-figma-out ${
        active ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
      } ${className}`}
    >
      {children}
    </button>
  );
}
