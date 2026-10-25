import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { getSession } from "@/lib/server/session";
import { getPoints } from "@/lib/server/account-extra";
import { earnRules, periodOptions, pointsPage as p, shareInvite } from "@/lib/data/account/points-data";
import { formatDate, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AxEmpty, AxNote, AxSectionHead, AxTitle } from "@/components/account/account-extra-ui";
import { PointsReferral } from "@/components/account/points-referral";
import { PointsHistory } from "@/components/account/points-history";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-65 · النقاط (749:8301) — الرصيد، ادعُ صديقاً (P-08c)، كيف تكسب النقاط، القاعدة، السجل بفلتر الفترة (P-18)
// W2-65-0 · حالة فارغة (1071:268) للعميل الجديد
export default async function PointsPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const t = getAccountExtra(locale);
  const data = await getPoints(user);
  const signed = (n: number) => `${n < 0 ? "−" : "+"} ${formatNumber(Math.abs(n))}`;

  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={tx(locale, p, "title")} description={tx(locale, p, "description")} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[483fr_477fr]">
        <section className="flex flex-col gap-2 rounded-2xl bg-deep-charcoal p-7 text-white">
          <h2 className="text-label-m text-neon-green">{tx(locale, p, "balance_label")}</h2>
          <p className="flex items-baseline gap-2 rtl:flex-row-reverse rtl:justify-end">
            <span className="text-[44px] leading-[66px] font-bold md:text-display-l md:leading-[78px]">{formatNumber(data.balance)}</span>
            <span className="text-label-l">{t.pointsUnit}</span>
          </p>
          <p className="text-body-m text-white/85">{tx(locale, p, "worth").replace("{sar}", formatNumber(data.worthSar))}</p>
          <span className="h-px shrink-0 bg-cool-gray/20" />
          {data.summary && (
            <>
              <p className="flex items-center gap-1.5 text-caption text-white/75">
                <Icon name="clock" size={14} className="shrink-0 text-neon-green" />
                {tx(locale, data.summary, "expiry")}
              </p>
              <p className="flex items-center gap-1.5 text-caption text-white/75">
                <Icon name="info" size={14} className="shrink-0 text-neon-green" />
                {tx(locale, data.summary, "pending")}
              </p>
            </>
          )}
        </section>
        <PointsReferral
          c={{
            title: tx(locale, p, "referral_title"),
            text: tx(locale, p, "referral_text"),
            note: tx(locale, p, "referral_note"),
            code: data.referralCode,
            copy: t.copy,
            share: t.share,
            close: t.close,
            shareTitle: tx(locale, shareInvite, "title"),
            shareText: tx(locale, shareInvite, "text"),
            shareLink: shareInvite.link,
            shareMessage: tx(locale, shareInvite, "message"),
            shareOptions: shareInvite.options.map((o) => ({ key: o.key, label: tx(locale, o, "label") })),
            toastCopied: tx(locale, shareInvite, "toast_copied"),
          }}
        />
      </div>

      <AxSectionHead title={tx(locale, p, "earn_title")} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {earnRules.map((r) => (
          <li key={r.points} className="flex flex-col gap-1 rounded-[20px] border border-cool-gray bg-white p-5">
            <span className="text-h4 text-green-active">{t.points(formatNumber(r.points))}</span>
            <span className="text-label-l text-deep-charcoal">{tx(locale, r, "title")}</span>
            <span className="text-caption text-state-gray">{tx(locale, r, "text")}</span>
          </li>
        ))}
      </ul>
      <AxNote>{tx(locale, p, "rule")}</AxNote>

      {data.history.length === 0 ? (
        <AxEmpty icon="gift" title={tx(locale, p, "empty_title")} text={tx(locale, p, "empty_text")} cta={{ label: tx(locale, p, "empty_cta"), href: routes.services }} />
      ) : (
        <PointsHistory
          title={tx(locale, p, "history_title")}
          filterLabel={tx(locale, p, "history_title")}
          headers={t.table}
          initial="6m"
          options={periodOptions.map((o) => ({ key: o.key, label: tx(locale, o, "label"), months: o.months }))}
          rows={data.history.map((r) => ({
            id: r.id,
            date: r.date,
            dateLabel: formatDate(locale, r.date, { day: "numeric", month: "long", year: "numeric" }),
            operation: tx(locale, r, "operation"),
            points: r.points,
            pointsLabel: signed(r.points),
            balanceLabel: formatNumber(r.balance),
          }))}
        />
      )}
    </div>
  );
}
