import { num } from "@/lib/format";
import { Icon } from "./Icon";

// Rating (القسم 3.5 · Figma components «Rating» 41:203): Compact = نجمة + القيمة + (العدد) · Stars = خمس نجوم + القيمة + (العدد) · M / S
export function Stars({ value, count, type = "compact", size = "S", className }: { value: number; count?: number; type?: "compact" | "stars"; size?: "M" | "S"; className?: string }) {
  const icon = size === "M" ? 18 : 14;
  return (
    <span className={`inline-flex items-center ${type === "stars" ? "gap-2" : "gap-1"} ${className ?? ""}`} aria-label={`التقييم ${value} من 5`}>
      {type === "stars" ? (
        <span className="flex gap-0.5 text-star" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} name={i <= Math.round(value) ? "star-filled" : "star"} size={icon} />
          ))}
        </span>
      ) : (
        <Icon name="star-filled" size={icon} className="text-star" />
      )}
      <span className={`num font-medium text-ink ${size === "M" ? "text-16" : "text-14"}`}>{num(value, 1)}</span>
      {count != null ? <span className={`num text-muted ${size === "M" ? "text-14" : "text-12"}`}>({num(count)})</span> : null}
    </span>
  );
}
