import type { ReactNode } from "react";
import { isPhone } from "@/lib/server/device";

// أجزاء بتظهر من 1280px وأكبر بس (xl) — شاشة التليفون عمرها ما بتوصل للعرض ده حتى بالعرض الأفقي،
// فالسيرفر مابيبعتهاش للتليفون خالص (كانت ~25% من عناصر الرئيسية على الموبايل وهي display:none).
// الكلاسات (hidden xl:block …) فاضلة زي ما هي، فالشكل على كل الشاشات مابيتغيرش.
export async function WideOnly({ children }: { children: ReactNode }) {
  return (await isPhone()) ? null : <>{children}</>;
}
