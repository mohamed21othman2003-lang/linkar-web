import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/brand/Logo";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";
import { socialLogin } from "@/app/actions/auth";

// ---------- أجزاء مشتركة في كل شاشات القسم 05 (W2-50 … W2-50h) ----------

// Body: خلفية #f4f6f5 · بطاقة 560 في البداية + اللوحة الغامقة في النهاية (على الموبايل البطاقة فوق)
export function AuthShell({ side, children }: { side: SidePanelCopy; children: ReactNode }) {
  return (
    <div className="bg-tile">
      <Container className="flex flex-col gap-6 pt-6 pb-16 lg:flex-row lg:items-stretch lg:gap-8 lg:pt-14 lg:pb-24">
        {/* 560 من xl زي الفيجما؛ على 1024–1279 أضيق شوية عشان اللوحة الغامقة ماتتزنقش */}
        <div className="w-full lg:w-[500px] lg:shrink-0 xl:w-[560px]">{children}</div>
        <SidePanel {...side} />
      </Container>
    </div>
  );
}

export type SidePanelCopy = {
  logoLabel: string;
  title: string;
  benefits: { icon: UiGlyph; text: string }[];
  note: string;
};

function SidePanel({ logoLabel, title, benefits, note }: SidePanelCopy) {
  return (
    <aside className="flex flex-col items-start gap-[18px] rounded-2xl bg-deep-charcoal p-6 lg:min-w-0 lg:flex-1 lg:p-10">
      <Logo tone="inverse" width={150} label={logoLabel} />
      <h2 className="text-h4 text-white md:text-h3">{title}</h2>
      <ul className="flex flex-col gap-[18px]">
        {benefits.map((b) => (
          <li key={b.icon} className="flex items-center gap-3">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-neon-green">
              <Icon name={b.icon} size={18} className="text-deep-charcoal" />
            </span>
            <span className="text-body-m text-white">{b.text}</span>
          </li>
        ))}
      </ul>
      <span aria-hidden className="h-6 w-2.5" />
      <p className="text-caption text-white/70">{note}</p>
    </aside>
  );
}

// Auth card: أبيض · حد cool-gray · r24 · p40 · gap18
export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-[18px] rounded-2xl border border-cool-gray bg-white p-6 md:p-10 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-h4 text-deep-charcoal md:text-h3">{children}</h1>;
}

export function CardSubtitle({ children }: { children: ReactNode }) {
  return <p className="w-full text-body-m text-state-gray">{children}</p>;
}

// زر الإجراء الرئيسي: 54 ارتفاع · Label L (Medium) · r12 (أو r14 في شاشات البريد)
export function submitClass(radius: "md" | "lg" = "md") {
  return buttonClass({
    size: "lg",
    className: `h-[54px]! w-full font-medium! ${radius === "lg" ? "rounded-[14px]!" : ""}`,
  });
}

// حقل: عنوان Label M + المحتوى + تلميح/خطأ Caption
export function Field({
  label,
  htmlFor,
  hint,
  hintTone = "gray",
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  hintTone?: "gray" | "green";
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <label htmlFor={htmlFor} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="w-full text-caption text-promotional-red">
          {error}
        </p>
      ) : hint ? (
        <p className={`w-full text-caption ${hintTone === "green" ? "text-green-active" : "text-state-gray"}`}>{hint}</p>
      ) : null}
    </div>
  );
}

// صندوق الحقل: r12 · حد 1 cool-gray · وقت الكتابة حد charcoal (1.5 في شاشات الجوال/الإكمال، 1 في شاشات البريد «lg» زي الفيجما)
// الانتقال: SMART_ANIMATE 200ms EASE_OUT بين حالة Default و Focus
export function inputBoxClass({ size = "md", invalid = false }: { size?: "md" | "lg"; invalid?: boolean } = {}) {
  const thick = size === "md";
  return `flex w-full items-center gap-2.5 rounded-md border bg-white px-3.5 transition-[border-color,box-shadow] duration-200 ease-figma-out ${
    size === "lg" ? "h-[60px]" : "min-h-[54px] py-3"
  } ${
    invalid
      ? `border-promotional-red ${thick ? "shadow-[inset_0_0_0_0.5px_var(--color-promotional-red)]" : ""}`
      : `border-cool-gray focus-within:border-deep-charcoal! ${
          thick ? "focus-within:shadow-[inset_0_0_0_0.5px_var(--color-deep-charcoal)]" : ""
        }`
  }`;
}
// الـinput نفسه جوه الصندوق (الصندوق هو اللي بيبيّن الفوكس)
export const inputClass =
  "min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none!";

// تبويبات «رقم الجوال / البريد الإلكتروني»
export function MethodTabs({ active, phone, email }: { active: "phone" | "email"; phone: { label: string; href: string }; email: { label: string; href: string } }) {
  const tab = (key: "phone" | "email", t: { label: string; href: string }) =>
    key === active ? (
      <span
        key={key}
        aria-current="page"
        className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-white px-3 text-label-m text-deep-charcoal shadow-[0_2px_6px_0_rgb(20_41_54/0.1)]"
      >
        {t.label}
      </span>
    ) : (
      <Link key={key} href={t.href} className="flex h-[42px] flex-1 items-center justify-center rounded-[10px] px-3 text-body-s text-state-gray hover:text-deep-charcoal">
        {t.label}
      </Link>
    );
  return (
    // الفيجما: 48 في شاشة الجوال (ارتفاع ثابت) و 50 في شاشة البريد (Hug حول تبويب 42)
    <nav className={`flex w-full items-center gap-1 overflow-hidden rounded-md bg-tile p-1 ${active === "phone" ? "h-12" : "h-[50px]"}`}>
      {tab("phone", phone)}
      {tab("email", email)}
    </nav>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="h-px flex-1 bg-cool-gray" />
      <span className="text-caption text-state-gray">{label}</span>
      <span className="h-px flex-1 bg-cool-gray" />
    </div>
  );
}

// «المتابعة مع Google / Apple» — تجريبي
export function SocialButtons({ next, google, apple }: { next: string; google: string; apple: string }) {
  const action = socialLogin.bind(null, next);
  return (
    <form action={action} className="flex w-full flex-col gap-2.5">
      <button
        type="submit"
        className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] border border-cool-gray bg-white px-4 text-label-l text-deep-charcoal transition-colors hover:border-border-strong"
      >
        <Image src="/figma/auth/google.svg" alt="" width={20} height={20} unoptimized className="size-5" />
        {google}
      </button>
      <button
        type="submit"
        className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#000] px-4 text-label-l text-white transition-opacity hover:opacity-90"
      >
        <Image src="/figma/auth/apple.svg" alt="" width={20} height={20} unoptimized className="size-5" />
        {apple}
      </button>
    </form>
  );
}

// رابط أخضر صغير (Label M · green-active) — مع سهم اختياري
// padded: أزرار «Btn ·» في الفيجما (ارتفاع 26) — روابط «Link ·» من غير حشو (22)
// after: مساحة لمس أكبر (≥40px) على الموبايل/التابلت من غير ما الشكل أو المسافات تتغير
export function TextLink({
  href,
  children,
  tone = "green",
  padded = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "green" | "dark";
  padded?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-label-m max-lg:relative max-lg:after:absolute max-lg:after:inset-x-0 max-lg:after:-inset-y-2.5 max-lg:after:content-[''] hover:underline ${padded ? "py-0.5" : ""} ${tone === "green" ? "text-green-active" : "text-deep-charcoal"} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Divider() {
  return <span aria-hidden className="h-px w-full bg-cool-gray" />;
}

// «مقدّم خدمة أو وكالة سيارات؟» + رابطي البوابات
export function BusinessBox({ title, links }: { title: string; links: { key: string; label: string; href: string }[] }) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5 rounded-[14px] bg-tile p-4">
      <p className="text-label-m text-deep-charcoal">{title}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {links.map((l) => (
          <TextLink key={l.key} href={l.href} padded>
            {l.label}
            <Icon name="chevron-left" size={16} flip className="text-nature-green" />
          </TextLink>
        ))}
      </div>
    </div>
  );
}

// «بالمتابعة أنت توافق على الشروط والأحكام وسياسة الخصوصية.»
export function Consent({ parts, termsHref, privacyHref }: { parts: Record<"before" | "terms" | "and" | "privacy" | "after", string>; termsHref: string; privacyHref: string }) {
  return (
    <p className="w-full text-caption text-state-gray">
      {parts.before}
      <Link href={termsHref} className="hover:text-deep-charcoal hover:underline">
        {parts.terms}
      </Link>
      {parts.and}
      <Link href={privacyHref} className="hover:text-deep-charcoal hover:underline">
        {parts.privacy}
      </Link>
      {parts.after}
    </p>
  );
}
