import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import { getDealerPackages } from "@/lib/server/account-extra";
import { giftEmptySteps, giftSteps, giftsPage as p, type GiftStep } from "@/lib/data/account/gifts-data";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AxSectionHead, AxTitle } from "@/components/account/account-extra-ui";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

function Steps({ locale, steps }: { locale: Locale; steps: GiftStep[] }) {
  return (
    <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <li key={s.icon} className="flex flex-col gap-2 rounded-[18px] border border-cool-gray bg-white p-5">
          <span className="flex size-10 items-center justify-center rounded-md bg-icon-tile">
            <Icon name={s.icon} size={20} className="text-deep-charcoal" />
          </span>
          <span className="text-label-l text-deep-charcoal">{tx(locale, s, "title")}</span>
          <span className="text-body-s text-state-gray">{tx(locale, s, "text")}</span>
        </li>
      ))}
    </ol>
  );
}

// W2-66 · باقات الوكالات (750:8219 · نسخة v2) — في القائمة الجانبية «الهدايا»
// W2-66-0 · حالة فارغة (1071:469 · نسخة v2) للعميل الجديد
export default async function DealerPackagesPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const packages = await getDealerPackages(user);

  if (packages.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <AxTitle large title={tx(locale, p, "title")} description={tx(locale, p, "empty_description")} />
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-cool-gray bg-white p-6 text-center md:p-10">
          <span className="flex size-16 items-center justify-center rounded-full bg-icon-tile">
            <Icon name="package" size={28} className="text-deep-charcoal" />
          </span>
          <h2 className="text-h4 text-deep-charcoal">{tx(locale, p, "empty_title")}</h2>
          <p className="max-w-[560px] text-body-m text-state-gray">{tx(locale, p, "empty_text")}</p>
          <Link
            href={routes.services}
            className="inline-flex h-control-lg items-center gap-1.5 rounded-md border border-cool-gray bg-white px-[22px] text-label-l text-deep-charcoal hover:bg-tile"
          >
            {tx(locale, p, "empty_cta")}
            <Icon name="grid" size={16} />
          </Link>
        </section>
        <AxSectionHead title={tx(locale, p, "empty_steps_title")} />
        <Steps locale={locale} steps={giftEmptySteps} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AxTitle large title={tx(locale, p, "title")} description={tx(locale, p, "description")} />

      {packages.map((g) => (
        <article key={g.booking} className="flex flex-col gap-7 rounded-2xl bg-deep-charcoal p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex size-[68px] shrink-0 items-center justify-center rounded-[20px] bg-neon-green">
              <Icon name="package" size={32} className="text-deep-charcoal" />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <ul className="flex flex-wrap gap-2">
                {g.chips.map((c) => (
                  <li
                    key={c.label_ar}
                    className={`rounded-full px-2.5 py-1 text-label-m ${c.highlight ? "bg-neon-green text-deep-charcoal" : "bg-white/12 text-white"}`}
                  >
                    {tx(locale, c, "label")}
                  </li>
                ))}
              </ul>
              <h2 className="text-h4 text-white md:text-h3">{tx(locale, g, "title")}</h2>
              <p className="text-body-s text-white/85">{tx(locale, g, "car")}</p>
              <p className="flex items-center gap-2 text-label-m text-neon-green">
                <Icon name="calendar" size={16} className="shrink-0" />
                {tx(locale, g, "valid")}
              </p>
              <p className="flex items-center gap-2 text-body-s text-white/90">
                <Icon name="map-pin" size={16} className="shrink-0 text-white" />
                {tx(locale, g, "branch")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col">
            <Link
              href={routes.giftBook(g.booking)}
              className="inline-flex h-[50px] items-center justify-center gap-1.5 rounded-md bg-neon-green px-[22px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
            >
              {tx(locale, p, "view_voucher")}
              <Icon name="qr" size={16} />
            </Link>
            <Link
              href={routes.provider(g.provider)}
              className="inline-flex h-control-lg items-center justify-center gap-1.5 rounded-md border border-white/35 px-[22px] text-label-l text-white hover:bg-white/10"
            >
              {tx(locale, p, "contact_branch")}
              <Icon name="phone" size={16} />
            </Link>
          </div>
        </article>
      ))}

      <AxSectionHead title={tx(locale, p, "steps_title")} />
      <Steps locale={locale} steps={giftSteps} />
      <div className="flex items-start gap-2.5 rounded-[14px] bg-tile p-4">
        <Icon name="info" size={18} className="mt-[3px] shrink-0 text-state-gray" />
        <p className="text-body-s text-state-gray">{tx(locale, p, "rule")}</p>
      </div>
    </div>
  );
}
