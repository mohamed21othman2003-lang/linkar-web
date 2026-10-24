import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { getSession } from "@/lib/server/session";
import { getPaymentMethods } from "@/lib/server/account-extra";
import { cardDraft, paymentPage as p } from "@/lib/data/account/payment-data";
import { formatDate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { AxNote } from "@/components/account/account-extra-ui";
import { PaymentManager } from "@/components/account/payment-manager";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-68 · طرق الدفع (751:8569) + W2-68b إضافة بطاقة (751:8983) كنافذة + P-05 / P-05b / P-10k / P-10l
export default async function PaymentMethodsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const t = getAccountExtra(locale);
  const data = await getPaymentMethods(user);

  return (
    <div className="flex flex-col gap-6">
      <PaymentManager
        demo={sp.demo === "w2-68b"}
        title={
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h3 text-deep-charcoal">{tx(locale, p, "title")}</h1>
            <p className="text-body-m text-state-gray">{tx(locale, p, "description")}</p>
          </div>
        }
        security={<AxNote icon="lock">{tx(locale, p, "security")}</AxNote>}
        cards={data.cards.map((c) => ({ id: c.id, brand: c.brand, last4: c.last4, expiry: c.expiry, holder: c.holder, isDefault: c.is_default }))}
        methods={data.other.map((m) => ({ id: m.id, name: tx(locale, m, "name"), text: tx(locale, m, "text"), linked: m.linked }))}
        invoices={data.invoices.map((i) => ({
          id: i.id,
          title: tx(locale, i, "title"),
          date: `${tx(locale, p, "invoice_label")} · ${formatDate(locale, i.date, { day: "numeric", month: "long", year: "numeric" })}`,
          amount: formatPrice(locale, i.amount),
        }))}
        c={{
          addCard: tx(locale, p, "add_card"),
          cardsTitle: tx(locale, p, "cards_title"),
          otherTitle: tx(locale, p, "other_title"),
          otherSubtitle: tx(locale, p, "other_subtitle"),
          invoicesTitle: tx(locale, p, "invoices_title"),
          invoicesSubtitle: tx(locale, p, "invoices_subtitle"),
          del: t.delete,
          cancel: t.cancel,
          close: t.close,
          makeDefault: t.makeDefault,
          default: t.default,
          unlink: t.unlink,
          downloadPdf: t.downloadPdf,
          deleteTitle: tx(locale, p, "delete_title"),
          deleteText: tx(locale, p, "delete_text"),
          deleteDefaultText: tx(locale, p, "delete_default_text"),
          deleteConfirm: tx(locale, p, "delete_confirm"),
          toastDefault: tx(locale, p, "toast_default"),
          toastUnlinked: tx(locale, p, "toast_unlinked"),
          toastDownload: tx(locale, p, "toast_download"),
          modalTitle: tx(locale, p, "modal_title"),
          modalSubtitle: tx(locale, p, "modal_subtitle"),
          fields: {
            number: tx(locale, p, "field_number"),
            expiry: tx(locale, p, "field_expiry"),
            cvv: tx(locale, p, "field_cvv"),
            name: tx(locale, p, "field_name"),
          },
          makeDefaultCard: tx(locale, p, "make_default"),
          modalNote: tx(locale, p, "modal_note"),
          save: tx(locale, p, "save"),
          draft: cardDraft,
        }}
      />
    </div>
  );
}
