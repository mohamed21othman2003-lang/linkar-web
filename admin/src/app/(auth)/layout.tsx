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
        {/* زر English ظاهر في التصميم بس مش مربوط — اللوحة عربية بس في المرحلة الأولى (CON5-L1) */}
        <div className="mt-10 flex w-full max-w-[400px] items-center justify-between">
          <p className="text-13 font-light text-muted">
            © <span className="num">2026</span> لينكار · لوحة تحكم لينكار
          </p>
          <span aria-disabled className="inline-flex h-[34px] items-center rounded-16 border border-border px-3.5 text-13 font-medium text-ink">
            English
          </span>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        {/* شعار لينكار الزخرفي (Figma 3114:28803 · v2logo__Mark بشفافية 6%) */}
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 720 900" preserveAspectRatio="xMinYMin slice">
          <defs>
            <linearGradient id="lm0" x1="-6.1" y1="279" x2="443.9" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ABF907" />
              <stop offset="1" stopColor="#3BB34B" />
            </linearGradient>
            <linearGradient id="lm1" x1="-6.1" y1="279" x2="443.9" y2="558" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ABF907" />
              <stop offset="1" stopColor="#3BB34B" />
            </linearGradient>
          </defs>
          <g opacity="0.06" transform="translate(0 360)">
            <path d="M140.6 1.09375L-4.9299 136.454L149.69 280.364L449.84 1.09375H140.6Z" fill="url(#lm0)" />
            <path d="M-4.9299 424.285L141.68 560.635H450.92L149.69 280.375L-4.9299 424.285Z" fill="url(#lm1)" />
            <path d="M149.69 280.379L-4.9299 136.469L-159.55 280.379L-4.9299 424.289L149.69 280.379Z" fill="#ABF907" />
          </g>
        </svg>
        <div className="relative ms-auto flex w-[620px] max-w-full flex-col items-start pt-[150px] pe-[100px]">
          <span className="inline-flex h-8 items-center gap-2 rounded-14 bg-white/8 px-3 text-13 font-medium text-lime">
            <span className="size-1.5 rounded-full bg-lime" />
            لوحة تحكم لينكار
          </span>
          <h1 className="mt-[18px] text-[32px] leading-[48px] font-bold text-white">نظّم شبكة مقدّمي الخدمة من مكان واحد</h1>
          <p className="mt-[18px] text-14 font-light text-white/72">أدِر الطلبات والحجوزات والأسعار ومستحقات المزوّدين، وتابع الجودة والفروع والقنوات.</p>
          <ul className="mt-7 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-14 font-medium text-white/90">
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
