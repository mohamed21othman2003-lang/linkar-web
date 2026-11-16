import type { ComponentProps } from "react";

// بديل خفيف لـnext/link في الأجزاء الثابتة: <a> عادي من السيرفر عليه data-nav، و NavInterceptor (في الـroot layout)
// بيمسك الضغطة ويعمل نفس التنقل بتاع Next (router.push) ويحمّل الصفحة مسبقاً لما الماوس/الصباع يقرّب.
// next/link نفسه client component — الرئيسية كان فيها ~106 لينك كل واحد بيتعمله hydration ومراقب ظهور للـprefetch.
export type NavLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** زي next/link: false = مايطلعش لأول الصفحة بعد التنقل */
  scroll?: boolean;
  /** زي next/link: replace بدل push في التاريخ */
  replace?: boolean;
  /** متجاهَل — التحميل المسبق بيحصل عند اقتراب الماوس/اللمس */
  prefetch?: boolean | null;
};

export default function NavLink({ href, scroll, replace, prefetch: _prefetch, ...rest }: NavLinkProps) {
  void _prefetch;
  return <a href={href} data-nav="" data-scroll={scroll === false ? "false" : undefined} data-replace={replace ? "true" : undefined} {...rest} />;
}
