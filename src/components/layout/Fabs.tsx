import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSite } from "@/lib/server/content";
import { getHelpPopupsCopy } from "@/lib/server/help";
import { HelpPopupButton } from "@/components/help/HelpPopupButton";

// FAB · مساعد لينكار / واتساب (956:310541 / 956:310546) — 60×60، 32px من بداية الصفحة.
// بيظهروا في الرئيسية (V2-01/V2-02) وتواصل معنا (W2-96) بس، وبيفتحوا P-21 (الشات) و P-22 (واتساب).
export async function Fabs() {
  const [locale, site, popups] = await Promise.all([getLocale(), getSite(), getHelpPopupsCopy()]);
  const assistant = tx(locale, site.fab, "assistant");
  const whatsapp = tx(locale, site.fab, "whatsapp");
  return (
    <div className="fixed start-4 bottom-24 z-30 flex flex-col gap-4 md:start-8">
      <HelpPopupButton popup="assistant" copy={popups} aria-label={assistant} title={assistant} className="relative block size-[60px]">
        {/* الأيقونة شاملة الظل والنقطة الليموني — أكبر من الزر (108×108) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/fab-assistant.svg" alt="" width={108} height={108} className="pointer-events-none absolute -top-[14px] -left-6 max-w-none" />
      </HelpPopupButton>
      <HelpPopupButton
        popup="whatsapp"
        copy={popups}
        aria-label={whatsapp}
        title={whatsapp}
        className="flex size-[60px] items-center justify-center rounded-full bg-whatsapp shadow-fab"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/whatsapp.svg" alt="" width={28} height={28} />
      </HelpPopupButton>
    </div>
  );
}
