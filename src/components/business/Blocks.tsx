import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";

// «Page head · v2» في صفحات الأعمال: نفس PageHeader + صف أزرار تحت الوصف (W2-90، W2-91، W2-94)
export function BusinessHead({
  crumbs,
  title,
  description,
  children,
  ctaGap = false,
}: {
  crumbs: Crumb[];
  title: string;
  description: string;
  children?: ReactNode;
  /** W2-91 و W2-94: صف الأزرار عليه pt 8 زيادة */
  ctaGap?: boolean;
}) {
  return (
    <div className="bg-pagehead pt-9 pb-6">
      <Container className="flex flex-col gap-3">
        <Breadcrumb items={crumbs} />
        <h1 className="text-h3 text-deep-charcoal md:text-h2">{title}</h1>
        <p className="max-w-[760px] text-body-m text-text-secondary md:text-body-l">{description}</p>
        {children && <div className={`flex flex-wrap ${ctaGap ? "gap-2.5 pt-2" : "gap-3"}`}>{children}</div>}
      </Container>
    </div>
  );
}

export function SectionTitle({ title, body, id }: { title: string; body?: string; id?: string }) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-col gap-1.5">
      <h2 className="text-h3 text-deep-charcoal md:text-h2">{title}</h2>
      {body && <p className="text-body-m text-text-secondary md:text-body-l">{body}</p>}
    </div>
  );
}

export function IconTile({ icon, tone = "neon", size = 40, glyph = 20 }: { icon: UiGlyph; tone?: "neon" | "gray"; size?: number; glyph?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-md text-deep-charcoal ${tone === "neon" ? "bg-neon-green" : "bg-icon-tile"}`}
    >
      <Icon name={icon} size={glyph} />
    </span>
  );
}

// زر «قدّم طلب الانضمام ‹» وأمثاله: سهم في آخر الزر
export function ArrowLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "dark"; className?: string }) {
  return (
    <Link href={href} className={actionClass(variant, className)}>
      {children}
      <Icon name="chevron-left" size={16} flip />
    </Link>
  );
}

// كارت بخطوة مرقّمة («الخطوة 1» + أيقونة ليموني) — W2-91، W2-94
export function StepCard({
  icon,
  step,
  title,
  body,
  muted = "meta",
}: {
  icon: UiGlyph;
  step: string;
  title: string;
  body: string;
  muted?: "meta" | "gray";
}) {
  const sub = muted === "meta" ? "text-v3-text-meta" : "text-text-secondary";
  return (
    <article className={`flex h-full flex-col gap-2.5 rounded-xl border bg-white p-6 ${muted === "meta" ? "border-v3-card-stroke" : "border-border-default"}`}>
      <div className="flex items-center justify-between">
        <IconTile icon={icon} />
        <span className={`text-caption ${sub}`}>{step}</span>
      </div>
      <h3 className="text-h4 text-deep-charcoal">{title}</h3>
      <p className={`text-body-s ${sub}`}>{body}</p>
    </article>
  );
}

// كارت ميزة بأيقونة رمادية — W2-91 «كل ما تحتاجه وكالتك»، W2-94 «العمولة والدفع»
export function FeatureCard({ icon, title, body, muted = "meta" }: { icon: UiGlyph; title: string; body: string; muted?: "meta" | "gray" }) {
  return (
    <article className={`flex h-full flex-col gap-2.5 rounded-xl border bg-white p-6 ${muted === "meta" ? "border-v3-card-stroke" : "border-border-default"}`}>
      <IconTile icon={icon} tone="gray" />
      <h3 className="text-label-l text-deep-charcoal">{title}</h3>
      <p className={`text-body-s ${muted === "meta" ? "text-v3-text-meta" : "text-text-secondary"}`}>{body}</p>
    </article>
  );
}

// شريط الدعوة الغامق في آخر الصفحة — W2-91، W2-94
export function DarkBand({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <section className="flex flex-col items-start gap-6 rounded-2xl bg-deep-charcoal p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-h4 text-white">{title}</h2>
        <p className="text-body-s text-white/80">{body}</p>
      </div>
      <ArrowLink href={href}>{cta}</ArrowLink>
    </section>
  );
}

// «ماذا بعد الإرسال؟» بنقاط رمادية + زر دخول المنصة الأخرى — W2-91b، W2-94b
export function AfterSubmitList({
  title,
  steps,
  haveAccount,
  portal,
  portalHref,
}: {
  title: string;
  steps: string[];
  haveAccount: string;
  portal: string;
  portalHref: string;
}) {
  return (
    <aside className="flex w-full flex-col gap-3.5 rounded-xl border border-border-default bg-white p-6 lg:w-[380px] lg:shrink-0">
      <h2 className="text-h5 text-deep-charcoal">{title}</h2>
      <ol className="flex flex-col gap-3.5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-icon-tile text-label-m text-deep-charcoal">{i + 1}</span>
            <span className="text-body-s text-deep-charcoal">{s}</span>
          </li>
        ))}
      </ol>
      <hr className="border-border-default" />
      <p className="text-body-s text-text-secondary">{haveAccount}</p>
      <Link href={portalHref} className={actionClass("outline", "self-start")}>
        {portal}
        <Icon name="user" size={16} />
      </Link>
    </aside>
  );
}
