import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";

// مكوّنات لوحات التفاصيل (القسم 3.5 «KV» · Figma CON5-23D 3114:24902 و CON5-23LD 3114:28289)

/** بطاقة الرأس الكحلي في الدرج: r18 · حشو 18 · أيقونة 48 خضراء r14 + الاسم 18 Bold أبيض + سطر 13 Light أبيض 70% + شارة على الشمال */
// ملاحظة: في CON5-23D إطار النص 22 بس فالاسم مش ظاهر في Figma (سطر البريد بس) — من غير title يطلع زي التصميم بالظبط.
export function DrawerHero({ icon = "user", title, subtitle, aside }: { icon?: UiGlyph; title?: ReactNode; subtitle?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-ink p-[18px]">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-lime text-ink">
        <Icon name={icon} size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        {title ? <p className="truncate text-18 font-bold text-white">{title}</p> : null}
        {subtitle ? <p className="truncate text-13 font-light text-white/70">{subtitle}</p> : null}
      </div>
      {aside}
    </div>
  );
}

/** بلوك بإطار r14 · حشو 14 · مسافة 8 · عنوان 12 Medium رمادي */
export function Tile({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-2 rounded-14 border border-border p-3.5 ${className ?? ""}`}>
      <h3 className="text-12 font-medium text-muted">{title}</h3>
      {children}
    </section>
  );
}

/** مفتاح (13 Light رمادي) على اليمين وقيمة (13 Medium كحلي) على الشمال */
export function KV({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-13">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

/** قبل ← بعد (CON5-23LD): «قبل» رمادي فاتح و«بعد» أخضر فاتح · r12 · حشو 12 */
export function BeforeAfter({ before, after }: { before: ReactNode; after: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-1 flex-col gap-0.5 rounded-12 bg-surface-1 p-3">
        <span className="text-12 font-medium text-muted">قبل</span>
        <span className="text-13 font-medium text-ink">{before}</span>
      </div>
      <Icon name="chevron-left" size={18} className="shrink-0 text-ink" />
      <div className="flex flex-1 flex-col gap-0.5 rounded-12 bg-success-tint p-3">
        <span className="text-12 font-medium text-muted">بعد</span>
        <span className="text-13 font-medium text-ink">{after}</span>
      </div>
    </div>
  );
}
