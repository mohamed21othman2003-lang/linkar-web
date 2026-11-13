// عند فتح نافذة أو درج: Radix بيركّز أول عنصر (زر الإغلاق) فيظهر عليه إطار التركيز، والتصميم من غيره.
// نركّز النافذة نفسها بدل كده — إلا لو حقل فيه autoFocus أخد التركيز بالفعل.
export function keepFocusQuiet(e: Event) {
  e.preventDefault();
  const el = e.currentTarget as HTMLElement | null;
  if (el && !el.contains(document.activeElement)) el.focus();
}
