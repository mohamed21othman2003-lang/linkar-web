import type { Metadata } from "next";
import Swatch from "./Swatch";
import {
  BRAND_COLORS, V3_COLORS, SEMANTIC_COLORS, TYPE_SCALE, TYPE_SAMPLE, RADII, SHADOWS, SIZES,
} from "./tokens";

// صفحة داخلية لمراجعة الـdesign tokens مع صاحب المشروع — مش جزء من الموقع
export const metadata: Metadata = {
  title: "Design tokens · Linkar",
  robots: { index: false, follow: false },
};

function Section({ title, source, children }: { title: string; source: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-border-default py-12">
      <div>
        <h2 className="text-h3">{title}</h2>
        <p className="text-caption text-text-secondary" dir="ltr">{source}</p>
      </div>
      {children}
    </section>
  );
}

// أزرار مسحوبة من شاشات الرئيسية — [النص, الكلاسات, المصدر في الفيجما]
// القيم الخام (مش tokens) معلّمة بـ⚠ عشان تتحسم في المرحلة 1
const BUTTONS_V201: [string, string, string][] = [
  ["ابدأ الآن", "h-control-lg rounded-md px-6 bg-bg-brand text-deep-charcoal text-label-l font-bold", "V2-01 · 557:104 · 52h · r12 · Bold 16"],
  ["اعرض باقاتك", "h-control-lg rounded-md px-6 bg-bg-inverse text-neon-green text-label-l font-bold", "V2-01 · 557:339 · 52h · r12 · Bold 16"],
  ["عرض القسيمة", "h-control-lg w-80 rounded-md px-6 bg-bg-brand text-deep-charcoal text-label-l font-bold", "V2-01 · CTA 46:807 · 320×52 · r12"],
  ["احجز", "h-[30px] rounded-full px-5 bg-neon-green text-deep-charcoal text-label-m font-bold", "V2-01 · كارت · 30h ⚠ (ارتفاع خام)"],
  ["التفاصيل", "h-[30px] rounded-full px-8 bg-v3-box-light text-deep-charcoal text-label-m font-bold", "V2-01 · كارت · 30h ⚠ (ارتفاع خام)"],
];

const BUTTONS_V202: [string, string, string][] = [
  ["ابحث", "h-control-xl rounded-[14px] px-6.5 bg-neon-green text-deep-charcoal text-label-l", "V2-02 · 617:1996 · 60h · r14 ⚠"],
  ["اعرض مقدّمي التظليل", "h-[54px] rounded-[14px] px-5.5 bg-neon-green text-deep-charcoal text-label-l", "V2-02 · 626:2371 · 54h ⚠ · r14 ⚠"],
  ["انضم كمقدّم خدمة", "h-control-lg rounded-[14px] px-6 bg-neon-green text-deep-charcoal text-label-l", "V2-02 · 619:2406 · 52h · r14 ⚠"],
];

const BUTTONS_HEADER: [string, string, string][] = [
  ["تسجيل الدخول", "h-control-md rounded-full px-4 border border-neon-green/55 bg-[#0b1712]/35 text-white text-label-m", "Hero header · 1314:597 · 44h · fill #0b1712@35% ⚠"],
  ["En", "size-[43px] rounded-full border border-neon-green/55 bg-[#0b1712]/35 text-white text-label-m", "Hero header · 1314:448 · 43×43 ⚠"],
  ["ابحث", "h-10 w-58.5 rounded-full px-4 bg-neon-green text-deep-charcoal text-label-m", "Hero search · 1314:528 · 40h"],
];

function ButtonRow({ items }: { items: [string, string, string][] }) {
  return (
    <div className="flex flex-wrap items-start gap-8">
      {items.map(([label, cls, src]) => (
        <div key={src} className="flex flex-col items-start gap-2">
          <button type="button" className={`inline-flex items-center justify-center gap-2 ${cls}`}>{label}</button>
          <span className="text-micro text-text-secondary" dir="ltr">{src}</span>
        </div>
      ))}
    </div>
  );
}

export default function TokensPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-20 py-12">
      <header className="flex flex-col gap-2 pb-12">
        <p className="text-overline text-text-brand">Linkar · Phase 0</p>
        <h1 className="text-display-l">Design tokens</h1>
        <p className="text-body-l text-text-secondary">
          كل القيم مسحوبة من ملف الفيجما (linkar-site-final + components + assets). القيم اللي جنب كل لون بتتقري من الـCSS الفعلي.
        </p>
      </header>

      <Section title="الشعار" source="assets › Brand kit › Brand logo (543:43)">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border-default bg-bg-canvas p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-primary.svg" alt="Linkar" width={232} height={31} />
          </div>
          <div className="flex h-40 items-center justify-center rounded-2xl bg-deep-charcoal p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-inverse.svg" alt="Linkar" width={232} height={31} />
          </div>
          <div className="flex h-40 items-center justify-center rounded-2xl bg-solid-black p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.svg" alt="Linkar" width={68} height={63} />
          </div>
        </div>
      </Section>

      <Section title="ألوان الهوية" source="Variables › Linkar v2 · Brand">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {BRAND_COLORS.map((t) => <Swatch key={t} token={t} />)}
        </div>
      </Section>

      <Section title="ألوان v3 المعتمدة (20 أكتوبر)" source="Variables › Linkar v2 · Brand › v3/*">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {V3_COLORS.map((t) => <Swatch key={t} token={t} />)}
        </div>
      </Section>

      <Section title="الألوان الدلالية: Brand Light | Brand Dark" source="Variables › Color › modes: Brand Light / Brand Dark (.theme-dark)">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-8 rounded-2xl border border-border-default bg-bg-canvas p-6">
            {Object.entries(SEMANTIC_COLORS).map(([group, tokens]) => (
              <div key={group} className="grid grid-cols-2 gap-x-6 gap-y-4">
                {tokens.map((t) => <Swatch key={t} token={t} />)}
              </div>
            ))}
          </div>
          <div className="theme-dark flex flex-col gap-8 rounded-2xl bg-bg-canvas p-6 text-text-primary">
            {Object.entries(SEMANTIC_COLORS).map(([group, tokens]) => (
              <div key={group} className="grid grid-cols-2 gap-x-6 gap-y-4">
                {tokens.map((t) => <Swatch key={t} token={t} />)}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="الخطوط: Noto Kufi Arabic" source="Text styles › v2/Web/*">
        <div className="flex flex-col divide-y divide-border-subtle">
          {TYPE_SCALE.map(([cls, name, size, weight]) => (
            <div key={cls} className="grid grid-cols-[240px_1fr] items-baseline gap-6 py-4">
              <div dir="ltr" className="text-start">
                <div className="text-label-m">{name}</div>
                <div className="text-caption text-text-secondary">{size} · {weight} · .{cls}</div>
              </div>
              <div className={cls}>{TYPE_SAMPLE}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="الأزرار" source="linkar-site-final › V2-01 · Home (557:2) / V2-02 · Home · Icons (600:2964)">
        <h3 className="text-h5">V2-01 · تحريرية بالصور</h3>
        <ButtonRow items={BUTTONS_V201} />
        <h3 className="text-h5">V2-02 · مقدمة للزائر</h3>
        <ButtonRow items={BUTTONS_V202} />
        <h3 className="text-h5">الهيدر والبحث (على الهيرو الغامق)</h3>
        <div className="relative overflow-hidden rounded-2xl bg-deep-charcoal p-8">
          <ButtonRow items={BUTTONS_HEADER} />
        </div>
      </Section>

      <Section title="الزوايا والظلال والمقاسات" source="Variables › Radius / Size · Effect styles › Elevation, Focus">
        <div className="grid grid-cols-8 gap-6">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div className="size-20 bg-bg-muted border border-border-strong" style={{ borderRadius: `var(--radius-${r})` }} />
              <span className="text-caption" dir="ltr">rounded-{r}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-6 pt-4">
          {SHADOWS.map((s) => (
            <div key={s} className="flex h-28 items-center justify-center rounded-lg bg-bg-surface" style={{ boxShadow: `var(--shadow-${s})` }}>
              <span className="text-caption" dir="ltr">shadow-{s}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-6 pt-4">
          {SIZES.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className="rounded-xs bg-neon-green" style={{ width: `var(--spacing-${s})`, height: `var(--spacing-${s})` }} />
              <span className="text-caption" dir="ltr">{s}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="التدرّجات" source="Paint styles › Brand/Gradient · Overlay/Image bottom · Overlay/Hero RTL">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex h-32 items-end rounded-2xl bg-gradient-brand p-4"><span className="text-label-m" dir="ltr">bg-gradient-brand</span></div>
          <div className="flex h-32 items-end rounded-2xl bg-cool-gray bg-overlay-image-bottom p-4 text-white"><span className="text-label-m" dir="ltr">bg-overlay-image-bottom</span></div>
          <div className="flex h-32 items-end rounded-2xl bg-cool-gray bg-overlay-hero p-4 text-white"><span className="text-label-m" dir="ltr">bg-overlay-hero</span></div>
        </div>
        <p className="text-body-s text-text-secondary">
          الـPaint styles بتاعة v3 (خلفيات الكروت الغامقة والإطار الليموني) محفوظة في الفيجما كصور، وهتتسحب كصور أصلية مع الكروت في المرحلة 1.
        </p>
      </Section>
    </main>
  );
}
