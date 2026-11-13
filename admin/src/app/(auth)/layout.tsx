import Image from "next/image";

// CON5-L1 / L2: صفحة كاملة من غير هيكل اللوحة — لوحة الدخول (يمين، أبيض) + لوحة تعريفية (شمال، كحلي)
const POINTS = [
  "راجع طلبات الانضمام والشهادات واعتمدها",
  "تابع شكاوى العملاء مع المراكز حتى الحل",
  "أدر الوكالات والمسوّقين وكشوفهم الشهرية",
  "حلّل الطلب وهامش لينكار حسب نوع الخدمة",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      <main className="flex flex-col px-6 pt-[118px] pb-10 lg:ps-[160px] lg:pe-6">
        <div className="flex w-full max-w-[400px] flex-1 flex-col">
          <Image src="/logo-primary.svg" alt="Linkar" width={128} height={20} priority className="mb-10 h-5 w-auto self-start" />
          {children}
        </div>
        <p className="mt-10 text-12 text-muted">
          © <span className="num">2026</span> لينكار · لوحة تحكم لينكار
        </p>
      </main>

      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        {/* شيفرون لينكار الزخرفي — TODO(Figma): تصدير الشكل الأصلي من الإطار 3114-28801 */}
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 720 900" preserveAspectRatio="xMinYMin slice">
          <defs>
            <linearGradient id="chev" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#1E3F33" />
              <stop offset="1" stopColor="#1A3433" />
            </linearGradient>
          </defs>
          <polygon points="140,361 420,361 150,640 430,900 150,900 0,752 0,497" fill="url(#chev)" opacity="0.9" />
        </svg>
        <div className="relative ms-auto flex w-[620px] max-w-full flex-col items-start pt-[150px] pe-[100px]">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white/8 px-3 text-13 text-lime">
            <span className="size-1.5 rounded-full bg-lime" />
            لوحة تحكم لينكار
          </span>
          <h1 className="mt-5 text-[34px] leading-[50px] font-bold text-white">نظّم شبكة مقدّمي الخدمة من مكان واحد</h1>
          <p className="mt-5 text-13 text-white/70">أدر الطلبات والحجوزات والأسعار ومستحقات المزوّدين، وتابع الجودة والفروع والقنوات.</p>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-14 text-white">
                <span className="flex size-[22px] items-center justify-center rounded-full bg-lime">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 6.2 4.9 8.5 9.5 3.7" stroke="#152935" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
