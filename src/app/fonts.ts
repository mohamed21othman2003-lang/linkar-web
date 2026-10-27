import localFont from "next/font/local";

// خط الموقع من الـBrand Guideline: Noto Kufi Arabic (Google Fonts، رخصة OFL) — عناوين Bold · فرعي Medium · نصوص Light
// (Regular مستخدم في نصوص صغيرة قليلة في V2-01).
// نسخة مقصوصة من ملفات Google نفسها (fontTools: instancer + subset): الوزن 300–700 بس، والحروف اللي الموقع بيستخدمها
// — العربي 124KB → 40KB واللاتيني 31KB → 21KB، فأول تحميل للصفحة أخف بكتير على الموبايل.
// ملفين بـunicode-range زي تقسيمة Google: العربي للحروف العربية، واللاتيني للأرقام والإنجليزي وعلامات الترقيم.
// لو اتضافت حروف عربية خارج U+0600–06FF (فارسي/أردو) لازم نعيد القص بالمدى الجديد.

export const notoKufiArabic = localFont({
  src: "./fonts/noto-kufi-arabic-ar.woff2",
  weight: "300 700",
  variable: "--font-noto-kufi-ar",
  // من غير fallback جوه المتغيّر — عشان الحروف اللاتينية تكمل للخط اللاتيني اللي بعده مش لـArial
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+200C-200F, U+2010-2027, U+2039-203A, U+2066-2069, U+FD3E-FD3F" }],
});

export const notoKufiLatin = localFont({
  src: "./fonts/noto-kufi-arabic-latin.woff2",
  weight: "300 700",
  variable: "--font-noto-kufi-lat",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const siteFonts = `${notoKufiArabic.variable} ${notoKufiLatin.variable}`;
