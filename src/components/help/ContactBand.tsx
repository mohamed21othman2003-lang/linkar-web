import Link from "next/link";

// «Contact band» — لم تجد إجابتك؟ (W2-97 · W2-97b · W2-98): غامق r24، النص من بداية السطر والأزرار في آخره
export function ContactBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-deep-charcoal px-6 py-7 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-h4 text-white">{title}</h2>
        <p className="text-body-m text-white/80">{body}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2.5">
        <Link
          href={primary.href}
          className="inline-flex h-[50px] items-center justify-center rounded-md bg-neon-green px-[22px] text-label-l text-deep-charcoal transition-colors hover:bg-bg-brand-hover"
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className="inline-flex h-[52px] items-center justify-center rounded-md border border-border-default bg-white px-[22px] text-label-l text-deep-charcoal transition-colors hover:bg-tile"
        >
          {secondary.label}
        </Link>
      </div>
    </section>
  );
}
