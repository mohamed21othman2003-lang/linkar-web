"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// بيخلي <a data-nav> (NavLink) يتنقّل زي next/link: ضغطة عادية → router.push (من غير تحميل الصفحة من جديد)،
// وتحميل مسبق (router.prefetch) لما الماوس يعدّي أو الصباع يلمس أو التركيز يوصل للرابط.
// Ctrl/⌘/Shift/وسط الماوس/target=_blank/download/روابط برّه الموقع → سلوك المتصفح العادي.
export function NavInterceptor() {
  const router = useRouter();

  useEffect(() => {
    const anchorOf = (e: Event) => (e.target instanceof Element ? (e.target.closest("a[data-nav]") as HTMLAnchorElement | null) : null);
    const internal = (a: HTMLAnchorElement) => {
      const url = new URL(a.href, window.location.href);
      return url.origin === window.location.origin ? url : null;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = anchorOf(e);
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = internal(a);
      if (!url) return;
      // رابط لجزء في نفس الصفحة (#…) → المتصفح بيتعامل معاه
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      e.preventDefault();
      const href = url.pathname + url.search + url.hash;
      const scroll = a.dataset.scroll !== "false";
      if (a.dataset.replace === "true") router.replace(href, { scroll });
      else router.push(href, { scroll });
    };

    const done = new Set<string>();
    const onIntent = (e: Event) => {
      const a = anchorOf(e);
      if (!a) return;
      const url = internal(a);
      if (!url) return;
      const key = url.pathname + url.search;
      if (done.has(key) || key === window.location.pathname + window.location.search) return;
      done.add(key);
      router.prefetch(key);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("touchstart", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [router]);

  return null;
}
