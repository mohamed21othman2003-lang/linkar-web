import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import { getProviderLogo, getReviews } from "@/lib/server/account-extra";
import { reviewsPage as p } from "@/lib/data/account/reviews-data";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AxEmpty, AxNote, AxPill, AxSectionHead, AxTitle, PartnerTile } from "@/components/account/account-extra-ui";
import { ReviewsStars, ReviewsStarsStatic } from "@/components/account/reviews-stars";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-70 · تقييماتي (753:9444) + W2-70-0 حالة فارغة (1071:786)
export default async function ReviewsPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const { pending, published } = await getReviews(user);
  const logo = async (slug: string) => {
    const l = await getProviderLogo(slug);
    return l ? { src: l.src, alt: tx(locale, l, "name") } : null;
  };
  const pendingView = await Promise.all(pending.map(async (r) => ({ r, logo: await logo(r.provider) })));
  const publishedView = await Promise.all(published.map(async (r) => ({ r, logo: await logo(r.provider) })));
  const starLabel = tx(locale, p, "rate_star");

  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={tx(locale, p, "title")} description={tx(locale, p, "description")} />

      {pending.length + published.length === 0 ? (
        <AxEmpty icon="star" title={tx(locale, p, "empty_title")} text={tx(locale, p, "empty_text")} cta={{ label: tx(locale, p, "empty_cta"), href: routes.search() }} />
      ) : (
        <>
          {pendingView.length > 0 && (
            <>
              <AxSectionHead title={tx(locale, p, "pending_title")} />
              {pendingView.map(({ r, logo }) => (
                <article
                  key={r.booking}
                  className="flex flex-col gap-4 rounded-[20px] border border-neon-green/60 bg-tint-lime p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    {logo && <PartnerTile src={logo.src} alt={logo.alt} size={48} />}
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <h3 className="text-label-l text-deep-charcoal">{tx(locale, r, "title")}</h3>
                      <p className="text-body-s text-state-gray">{tx(locale, r, "meta")}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={routes.booking(r.booking)}
                      className="inline-flex h-[42px] items-center rounded-md bg-deep-charcoal px-[18px] text-label-m text-neon-green hover:bg-bg-inverse-subtle"
                    >
                      {tx(locale, p, "rate_now")}
                    </Link>
                    <ReviewsStars label={tx(locale, r, "title")} starLabel={starLabel} />
                  </div>
                </article>
              ))}
            </>
          )}

          {publishedView.length > 0 && (
            <>
              <AxSectionHead title={tx(locale, p, "published_title")} subtitle={tx(locale, p, "published_subtitle")} />
              {publishedView.map(({ r, logo }) => (
                <article key={r.booking} className="flex flex-col gap-3 rounded-[20px] border border-v3-card-stroke bg-white p-[22px]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {logo && <PartnerTile src={logo.src} alt={logo.alt} size={44} />}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <h3 className="text-label-l text-deep-charcoal">{tx(locale, r, "title")}</h3>
                        <p className="text-caption text-v3-text-meta">{tx(locale, r, "meta")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <AxPill tone="success">{tx(locale, p, "points_badge")}</AxPill>
                      <ReviewsStarsStatic stars={r.stars} label={starLabel.replace("{n}", String(r.stars))} />
                    </div>
                  </div>
                  <p className="text-body-m text-deep-charcoal">{tx(locale, r, "text")}</p>
                  {r.edit_note && (
                    <p className="flex items-center gap-1.5 text-caption text-v3-text-meta">
                      <Icon name="clock" size={14} className="shrink-0 text-state-gray" />
                      {tx(locale, r.edit_note, "text")}
                    </p>
                  )}
                  {r.reply && <p className="rounded-[14px] bg-tile px-4 py-3 text-body-s text-deep-charcoal">{tx(locale, r.reply, "text")}</p>}
                </article>
              ))}
            </>
          )}
        </>
      )}
      <AxNote>{tx(locale, p, "rules")}</AxNote>
    </div>
  );
}
