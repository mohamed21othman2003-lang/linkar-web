import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProvidersBySlugs, getServices } from "@/lib/server/content";
import { servicesPage as p, serviceCards, serviceCardsCopy } from "@/lib/data/pages/services-page";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ServicePicker, type PickerService } from "./ServicePicker";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-25 · كل الخدمات (من «كل الخدمات» في الهوم أو «الخدمات» في الهيدر)
export default async function ServicesPage() {
  const locale = await getLocale();
  const t = getCommon(locale);
  const services = await getServices();
  const items: PickerService[] = await Promise.all(
    // ترتيب الفيجما: الغسيل أول خدمة من بداية السطر
    services
      .filter((s) => serviceCards[s.slug])
      .map(async (s) => ({
        service: s,
        card: serviceCards[s.slug],
        providers: await getProvidersBySlugs(serviceCards[s.slug].top_providers),
      })),
  );
  return (
    <>
      <PageHeader
        crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "crumb") }]}
        title={tx(locale, p, "title")}
        description={tx(locale, p, "description")}
        tone="dark"
      />
      <Container className="pt-8 pb-24">
        <ServicePicker
          locale={locale}
          items={items}
          defaultSelected={[...p.default_selected]}
          definiteNames={locale === "en" ? p.definite_en : p.definite_ar}
          copy={{
            selectedOne: tx(locale, p, "selected_one"),
            selectedTwo: tx(locale, p, "selected_two"),
            selectedMany: tx(locale, p, "selected_many"),
            together: tx(locale, p, "together"),
            ctaOne: tx(locale, p, "cta_one"),
            ctaTwo: tx(locale, p, "cta_two"),
            ctaMany: tx(locale, p, "cta_many"),
            hint: tx(locale, p, "hint"),
            topLabel: tx(locale, serviceCardsCopy, "top_label"),
          }}
        />
      </Container>
    </>
  );
}
