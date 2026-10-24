// أشكال بيانات صفحات «08 · لينكار للأعمال»
import type { Localized } from "@/i18n/config";
import type { UiGlyph } from "@/components/icons/Icon";

export type Txt = Localized<"text">;
export type Card = Localized<"title"> & Localized<"body"> & { icon?: UiGlyph };
export type Faq = Localized<"q"> & Localized<"a">;
export type Option = Localized<"label"> & { value: string };

// رأس الصفحة (Page head · v2): مسار + عنوان + وصف
export type PageHead = Localized<"crumb"> & Localized<"title"> & Localized<"description">;
