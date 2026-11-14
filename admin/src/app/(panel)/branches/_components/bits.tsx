import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { TIER_LABEL, type Tier } from "@/lib/api/providers";
import type { Branch, BranchStatus, ServiceState } from "@/lib/api/branches";

// قطع مشتركة لشاشات الفروع (CON5-08 / 08P / 08M / 08N)

// شارات الحالة والفئة (CON5-08 3114:55392): r999 · حشو 3·10 · 12 Medium — الحالة 26 (سطر 20) والفئة 24 (سطر 18)
const STATUS: Record<BranchStatus, { label: string; cls: string }> = {
  approved: { label: "معتمد", cls: "bg-success-tint text-success" },
  new: { label: "معتمد جديد", cls: "bg-info-tint text-info" },
  "pending-visit": { label: "بانتظار الزيارة الميدانية", cls: "bg-[#fdf3e1] text-warning" },
  request: { label: "بانتظار الزيارة الميدانية", cls: "bg-[#fdf3e1] text-warning" },
  rejected: { label: "مرفوض", cls: "bg-[#fbeaea] text-danger" },
};
export const statusLabel = (s: BranchStatus) => STATUS[s].label;

export function StatusPill({ status, small }: { status: BranchStatus; small?: boolean }) {
  const s = STATUS[status];
  return <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 text-12 font-medium whitespace-nowrap ${small ? "h-6 leading-[18px]" : "h-[26px]"} ${s.cls}`}>{s.label}</span>;
}

// ذهبي #FBF3DC/#7A5A0A (في الملف #FBF1D6/#7A5A00) · بلاتيني #EBECF7/#3B3F6B · فضي #EEF1F3/#46525C
const TIER_CLS: Record<Tier, string> = { gold: "bg-[#fbf3dc] text-[#7a5a0a]", platinum: "bg-[#ebecf7] text-[#3b3f6b]", silver: "bg-[#eef1f3] text-[#46525c]" };
export function TierPill({ tier, profile }: { tier: Tier; profile?: boolean }) {
  return (
    <span className={`inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${profile && tier === "gold" ? "bg-warning-tint text-[#7a5a00]" : TIER_CLS[tier]}`}>
      {TIER_LABEL[tier]}
    </span>
  );
}

const SERVICE_STATE: Record<ServiceState, { label: string; cls: string }> = {
  approved: { label: "معتمدة", cls: "bg-success-tint text-success" },
  paused: { label: "موقوفة مؤقتاً", cls: "bg-[#fdf3e1] text-warning" },
  pending: { label: "بانتظار الزيارة", cls: "bg-[#fdf3e1] text-warning" },
  rejected: { label: "غير مقبولة", cls: "bg-[#fbeaea] text-danger" },
};
export function ServiceStatePill({ state }: { state: ServiceState }) {
  const s = SERVICE_STATE[state];
  return <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

/** رابط «المعايير ↗» / «معايير الاعتماد · … ↗» (#E7F0F8 بنص #2B5C8A) → البيانات المرجعية (CON5-20) */
export function CriteriaLink({ children, href = "/coming-soon?s=reference", className }: { children: ReactNode; href?: string; className?: string }) {
  return (
    <a href={href} className={`inline-flex w-fit shrink-0 items-center rounded-full bg-info-tint px-2.5 py-[5px] text-12 leading-[18px] font-medium text-info hover:underline sm:whitespace-nowrap ${className ?? ""}`}>
      {children}
    </a>
  );
}

/** اسم الفرع + الكود («(محجوز)» قبل اعتماد الزيارة) */
export const codeLabel = (b: Pick<Branch, "code" | "reserved">) => `${b.code}${b.reserved ? " (محجوز)" : ""}`;
/** «فرع الزهراء · جونسون · LK-JN-ZH-001» — السطر تحت عنوان نوافذ الفرع */
export const modalSub = (b: Branch) => `${b.name} · ${b.provider.label} · ${codeLabel(b)}`;

/** صندوق اختيار 18 r5 (CON5-08 · تحديد للرسالة الجماعية): محدد = كحلي بعلامة ✓ · جزئي = شرطة بيضا */
export function SelectBox({ checked, partial, onChange, label }: { checked: boolean; partial?: boolean; onChange: () => void; label: string }) {
  const on = checked || partial;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={partial ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${on ? "border-ink bg-ink text-lime" : "border-border-strong bg-white"}`}
    >
      {partial && !checked ? <span className="h-0.5 w-2 rounded-full bg-white" /> : checked ? <Icon name="check" size={14} /> : null}
    </button>
  );
}

/** خريطة مكان الفرع — TODO(map provider): لسه ما اتحددش مزوّد الخرائط (القسم 18.1) */
export function MapBox({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`flex items-center justify-center rounded-12 bg-[#e7efe9] text-ink ${className ?? "h-[110px]"}`}>
      {children ?? <Icon name="map-pin" size={26} />}
    </div>
  );
}

/** ملاحظة داخل نوافذ الفروع (CON5-08M): r12 · حشو 12 · مسافة 8 · أيقونة info 16 كحلي على الشمال (زي Figma) · نص 13 Light سطر 21
 * info = #E7F0F8 بنص كحلي · warning = #FDF3E1 بنص #9A5B00 · danger = #FBEAEA بنص #A13434 */
const NOTE = { info: "bg-info-tint text-ink", warning: "bg-[#fdf3e1] text-warning", danger: "bg-[#fbeaea] text-danger" };
export function MNote({ tone = "info", children, className }: { tone?: keyof typeof NOTE; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[21px] font-light ${NOTE[tone]} ${className ?? ""}`}>
      <p className="min-w-0 flex-1">{children}</p>
      <Icon name="info" size={16} className="mt-[2.5px] shrink-0 text-ink" />
    </div>
  );
}
