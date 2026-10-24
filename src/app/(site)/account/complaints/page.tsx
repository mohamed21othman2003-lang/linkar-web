import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { getSession } from "@/lib/server/session";
import { getComplaints, getProviderLogo } from "@/lib/server/account-extra";
import { complaintForm, complaintsPage as p, type Complaint, type ComplaintTab } from "@/lib/data/account/complaints-data";
import { formatDate, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AxEmpty, AxPill, AxTabs, AxTitle, PartnerTile } from "@/components/account/account-extra-ui";
import { ComplaintsThread } from "@/components/account/complaints-thread";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

const TABS: ComplaintTab[] = ["all", "open", "closed", "suggestions"];
const inTab = (c: Complaint, tab: ComplaintTab) =>
  tab === "all" || (tab === "suggestions" ? c.kind === "suggestion" : c.kind === "complaint" && c.state === tab);
const pillTone = { open: "lime", closed: "success", received: "muted" } as const;

// W2-69 · الشكاوى والمقترحات (752:9099) + «W2-69 · تبويبات» (1132:34722): الكل / مفتوحة / مغلقة / مقترحات
// W2-69-0 · حالة فارغة (1071:911) للعميل الجديد
export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const t = getAccountExtra(locale);
  const list = await getComplaints(user);
  const tab: ComplaintTab = TABS.includes(sp.tab as ComplaintTab) ? (sp.tab as ComplaintTab) : "all";
  const logos = Object.fromEntries(
    await Promise.all(list.filter((c) => c.provider).map(async (c) => [c.provider!, await getProviderLogo(c.provider!)] as const)),
  );

  return (
    <div className="flex flex-col gap-6">
      <AxTitle
        title={tx(locale, p, "title")}
        description={tx(locale, p, "description")}
        action={
          <Link
            href={routes.complaintNew}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-md bg-neon-green px-[18px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
          >
            <Icon name="plus" size={16} />
            {tx(locale, p, "new_cta")}
          </Link>
        }
      />

      {list.length === 0 ? (
        <AxEmpty icon="message" title={tx(locale, p, "empty_title")} text={tx(locale, p, "empty_text")} cta={{ label: tx(locale, p, "empty_cta"), href: routes.suggestionNew }} />
      ) : (
        <>
          <AxTabs
            label={tx(locale, p, "title")}
            items={TABS.map((k) => ({
              key: k,
              label: `${tx(locale, p, `tab_${k}`)} (${formatNumber(list.filter((c) => inTab(c, k)).length)})`,
              href: routes.complaints(k === "all" ? undefined : k),
              active: k === tab,
            }))}
          />
          {/* «W2-69 · تبويبات»: CHANGE_TO DISSOLVE 200ms EASE_OUT */}
          <div key={tab} className="flex animate-dissolve flex-col gap-6">
          {list
            .filter((c) => inTab(c, tab))
            .map((c) => {
              const logo = c.provider ? logos[c.provider] : null;
              const expanded = !!c.thread;
              const itemTab: ComplaintTab = c.kind === "suggestion" ? "suggestions" : (c.state as ComplaintTab);
              const clickable = !expanded && tab === "all";
              return (
                <article
                  key={c.id}
                  className={`relative flex flex-col rounded-[20px] bg-white ${clickable ? "transition-colors duration-200 ease-figma-out hover:border-border-strong" : ""} ${expanded ? "gap-[18px] border-[1.5px] border-deep-charcoal p-4 md:p-6" : "gap-2 border border-cool-gray p-5"}`}
                >
                  {clickable && <Link href={routes.complaints(itemTab)} aria-label={tx(locale, c, "title")} className="absolute inset-0 rounded-[20px]" />}
                  <div className="flex items-start gap-3.5">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="flex flex-wrap items-center gap-2.5">
                        <span className="text-label-m text-state-gray">{c.kind === "suggestion" ? tx(locale, p, "suggestion_label") : c.id}</span>
                        <AxPill tone={pillTone[c.state]}>{tx(locale, c, "status")}</AxPill>
                      </p>
                      <h2 className={expanded ? "text-h4 text-deep-charcoal" : "text-h5 text-deep-charcoal"}>{tx(locale, c, "title")}</h2>
                      <p className="text-body-s text-state-gray">{tx(locale, c, "meta")}</p>
                    </div>
                    {logo ? (
                      <PartnerTile src={logo.src} alt={tx(locale, logo, "name")} size={expanded ? 48 : 44} />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-cool-gray/40">
                        <Icon name="message" size={20} className="text-deep-charcoal" />
                      </span>
                    )}
                  </div>
                  {c.summary && <p className="text-body-s text-deep-charcoal">{tx(locale, c.summary, "text")}</p>}
                  {c.thread && c.decision && (
                    <>
                      <span className="h-px bg-cool-gray" />
                      <ComplaintsThread
                        messages={c.thread.map((m, i) => ({
                          key: `${c.id}-${i}`,
                          from: m.from,
                          author: tx(locale, m, "author"),
                          time: tx(locale, m, "time"),
                          text: tx(locale, m, "text"),
                          photos: m.photos,
                        }))}
                        you={{ author: t.you, now: formatDate(locale, new Date().toISOString()) }}
                        c={{
                          decisionTitle: tx(locale, p, "decision_title"),
                          accept: tx(locale, c.decision, "accept"),
                          other: tx(locale, p, "decision_other"),
                          placeholder: tx(locale, p, "reply_placeholder"),
                          send: t.send,
                          attach: t.addPhoto,
                          toastPhoto: tx(locale, complaintForm, "toast_photo_added"),
                          toastAccepted: tx(locale, p, "toast_accepted"),
                          toastReply: tx(locale, p, "toast_reply"),
                        }}
                      />
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
