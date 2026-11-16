import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

// شريط ثابت تحت على الموبايل/التابلت: الإجمالي + «متابعة» — كارت الحجز (sidebar الديسكتوب) بينزل تحت كل الخدمات،
// فالعميل كان لازم يتمرر لآخر الصفحة عشان يلاقيه (تقرير الموبايل #17). بيظهر بس لما فيه خدمة مختارة.
export function MobileTotalBar({ label, total, href, cta }: { label: string; total: string; href: string; cta: string }) {
  return (
    <>
      {/* مساحة في آخر الصفحة بطول الشريط عشان مايغطيش آخر محتوى */}
      <div className="h-24 lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cool-gray bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_#1429361a] lg:hidden">
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-caption text-state-gray">{label}</span>
            <span className="text-h5 whitespace-nowrap text-deep-charcoal">{total}</span>
          </div>
          <Link
            href={href}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-6 text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {cta}
            <Icon name="chevron-left" size={18} flip />
          </Link>
        </div>
      </div>
    </>
  );
}
