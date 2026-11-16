// بيشغّل cb مرة واحدة لما العنصر يقرّب من الشاشة — لقياسات (scrollWidth / offsetWidth …) بتجبر المتصفح يحسب layout القسم كله.
// الأقسام اللي تحت أول شاشة عليها content-visibility؛ القياس بدري كان بيلغي التأجيل ده ويطوّل أول تحميل على الموبايل.
export function whenNear(el: Element, cb: () => void, rootMargin = "400px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cb();
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}
