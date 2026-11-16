import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { HOME_PATH } from "@/lib/session";

export const metadata: Metadata = { title: "الصفحة غير موجودة" };

// 404 جوه هيكل اللوحة (القائمة + الشريط العلوي) — رابط قديم أو متكتب غلط
export default function PanelNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-16 border border-border bg-white px-6 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon name="search" size={26} />
      </span>
      <p className="num text-13 font-medium text-muted">404</p>
      <h1 className="text-24 font-bold text-ink">الصفحة غير موجودة</h1>
      <p className="max-w-md text-13 text-muted">الرابط غير صحيح أو الصفحة اتنقلت لمكان تاني. ارجع للرئيسية أو اختر القسم من القائمة.</p>
      <ButtonLink href={HOME_PATH}>العودة للرئيسية</ButtonLink>
    </div>
  );
}
