import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "قريباً" };

// صفحة «قريباً» لعناصر القائمة الجانبية اللي مش في المرحلة الأولى (القسم 1.5 و18.2) — مش مرسومة، لازم تتعرض على المصمم
const NAMES: Record<string, string> = {
  home: "الرئيسية",
  analytics: "التحليلات",
  reports: "التقارير",
  requests: "الطلبات",
  bookings: "الحجوزات",
  customers: "العملاء",
  invoices: "الفواتير والقسائم",
  partners: "الشركاء",
  messages: "الرسائل",
  reference: "البيانات المرجعية",
  settings: "الإعدادات",
};

export default async function ComingSoon({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const name = (s && NAMES[s]) || "هذه الصفحة";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-16 border border-border bg-white py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-lime-tint text-success">
        <Icon name="clock" size={26} />
      </span>
      <h1 className="text-24 font-bold">{name} · قريباً</h1>
      <p className="max-w-md text-13 text-muted">نجهّز هذا القسم في مرحلة قادمة. تقدر تدير مقدّمي الخدمة والمستخدمين والصلاحيات الآن.</p>
      <ButtonLink href="/providers" variant="secondary">
        مقدّمو الخدمة
      </ButtonLink>
    </div>
  );
}
