import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// ملاحظة داخل الصفحات والنوافذ والأدراج (Figma CON5-23 / 23M / 23LD): r12 · حشو 12 · مسافة 8 · أيقونة 16 · نص 13 Light
// info = أزرق (#E7F0F8) · warning = تنبيه (#FBF3E4 بنص #B7791F) · neutral = رمادي فاتح بنص كحلي · danger = أحمر فاتح (#F8E9E9 بنص #A13434)
const TONE = {
  info: { box: "bg-info-tint text-info", icon: "info" as const, iconClass: "text-ink" },
  warning: { box: "bg-pending-tint text-pending", icon: "alert" as const, iconClass: "text-ink" },
  neutral: { box: "bg-surface-1 text-ink", icon: "info" as const, iconClass: "text-ink" },
  danger: { box: "bg-[#f8e9e9] text-danger", icon: "alert" as const, iconClass: "text-ink" },
};

export function Note({ tone = "info", children, className }: { tone?: keyof typeof TONE; children: ReactNode; className?: string }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 font-light ${t.box} ${className ?? ""}`}>
      <Icon name={t.icon} size={16} className={`mt-[3px] shrink-0 ${t.iconClass}`} />
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  );
}
