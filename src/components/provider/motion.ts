import { animate } from "motion";

// منحنيات الفيجما (نفس tokens ‎--ease-figma-* في globals.css)
export const FIGMA_EASE_OUT: [number, number, number, number] = [0, 0, 0.58, 1];
export const FIGMA_EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// SCROLL_TO · SCROLL_ANIMATE <duration> — تمرير الصفحة لعنصر بنفس مدة ومنحنى البروتوتايب
// offset = ارتفاع الهيدر الثابت (80) + مسافة صغيرة
export function scrollToEl(el: Element | null, duration: number, ease = FIGMA_EASE_OUT, offset = 96) {
  if (!el) return;
  const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  // html فيه scroll-behavior: smooth — لازم "instant" عشان كل فريم يتطبّق فوراً
  if (reduced()) return window.scrollTo({ top: target, behavior: "instant" });
  animate(window.scrollY, target, { duration, ease, onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }) });
}

// تمرير أفقي لعنصر جوّه حاوية (الكاروسيل: CHANGE_TO · SMART_ANIMATE 300ms)
export function scrollContainerTo(box: HTMLElement, left: number, duration: number) {
  if (reduced()) return box.scrollTo({ left, behavior: "instant" });
  // الـscroll-snap بيقفز للنقطة الأقرب مع كل فريم — بنوقفه لحد ما الحركة تخلص
  const snap = box.style.scrollSnapType;
  box.style.scrollSnapType = "none";
  animate(box.scrollLeft, left, {
    duration,
    ease: FIGMA_EASE_OUT,
    onUpdate: (v) => box.scrollTo({ left: v, behavior: "instant" }),
    onComplete: () => (box.style.scrollSnapType = snap),
  });
}
