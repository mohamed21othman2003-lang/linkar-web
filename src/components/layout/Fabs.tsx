import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSite } from "@/lib/server/content";
import { getHelpPopupsCopy } from "@/lib/server/help";
import { HelpPopupButton } from "@/components/help/HelpPopupButton";

// FAB · مساعد لينكار / واتساب (956:310541 / 956:310546) — 60×60، 32px من بداية الصفحة.
// بيظهروا في الرئيسية (V2-01) وتواصل معنا (W2-96) بس، وبيفتحوا P-21 (الشات) و P-22 (واتساب).
// تابلت/موبايل (V2-01t 85:34941 · V2-01m 85:34225): واتساب بس، في ناحية النهاية (شمال في العربي)، 60 / 50.
// side="end": الرئيسية (37:28362 / 37:29155) — الزرّين ناحية النهاية في الديسكتوب كمان.
export async function Fabs({ side = "start" }: { side?: "start" | "end" } = {}) {
  const [locale, site, popups] = await Promise.all([getLocale(), getSite(), getHelpPopupsCopy()]);
  const assistant = tx(locale, site.fab, "assistant");
  const whatsapp = tx(locale, site.fab, "whatsapp");
  return (
    <div className={`fixed end-5 bottom-[34px] z-30 flex flex-col gap-4 md:end-8 md:bottom-24 ${side === "start" ? "xl:start-8 xl:end-auto" : ""}`}>
      <div className="max-xl:hidden">
      <HelpPopupButton popup="assistant" copy={popups} aria-label={assistant} title={assistant} className="relative block size-[60px]">
        {/* الأيقونة شاملة الظل والنقطة الليموني — أكبر من الزر (108×108) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/fab-assistant.svg" alt="" width={108} height={108} loading="lazy" className="pointer-events-none absolute -top-[14px] -left-6 max-w-none" />
      </HelpPopupButton>
      </div>
      <HelpPopupButton
        popup="whatsapp"
        copy={popups}
        aria-label={whatsapp}
        title={whatsapp}
        className="flex size-[50px] items-center justify-center rounded-full bg-whatsapp shadow-fab md:size-[60px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/whatsapp.svg" alt="" width={28} height={28} loading="lazy" className="size-6 md:size-7" />
      </HelpPopupButton>
    </div>
  );
}
