import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSession } from "@/lib/server/session";
import { accountNav, accountNavCopy } from "@/lib/data/account/nav";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";

// Account shell (748:7675): خلفية #f7f8f7، القائمة الجانبية 272 في بداية الصفحة والمحتوى 976
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const t = getCommon(locale);
  return (
    <div className="bg-page-soft">
      <Container className="flex flex-col gap-8 pt-8 pb-14 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-28 lg:w-[272px] lg:shrink-0">
          <AccountNav
            v={{
              name: tx(locale, user, "name"),
              initial: tx(locale, user, "initial"),
              points: t.points(formatNumber(user.points)),
              items: accountNav.map((i) => ({ key: i.key, label: tx(locale, i, "label"), href: i.href })),
              signOut: tx(locale, accountNavCopy, "sign_out"),
            }}
          />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </Container>
    </div>
  );
}
