// «تنزيل / تحميل PDF» من غير مكتبات: بننسخ الجزء المطلوب (القسيمة، الفاتورة…) في عنصر لوحده،
// وستايل طباعة بيخفي باقي الصفحة، ثم window.print() — والعميل يختار «حفظ بصيغة PDF».
// بيرجّع false لو الطباعة مش متاحة (عشان الرسالة ماتظهرش من غير ما حاجة تحصل).
const ROOT_ID = "linkar-print-root";

const PRINT_CSS = `
@media screen { #${ROOT_ID} { display: none !important; } }
@media print {
  @page { margin: 12mm; }
  html, body { background: #fff !important; overflow: visible !important; }
  body > *:not(#${ROOT_ID}) { display: none !important; }
  #${ROOT_ID} { display: block !important; max-width: 560px; margin: 0 auto; }
  #${ROOT_ID}, #${ROOT_ID} * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; animation: none !important; }
  #${ROOT_ID} [data-print-hide] { display: none !important; }
}`;

export function printElement(el: HTMLElement | null | undefined, fileName?: string): boolean {
  if (!el || typeof window === "undefined" || typeof window.print !== "function") return false;
  document.getElementById(ROOT_ID)?.remove();
  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.dir = document.documentElement.dir;
  root.appendChild(el.cloneNode(true));
  const style = document.createElement("style");
  style.textContent = PRINT_CSS;
  document.body.append(style, root);
  // عنوان الصفحة = اسم الملف المقترح عند «حفظ بصيغة PDF»
  const prevTitle = document.title;
  if (fileName) document.title = fileName;
  const cleanup = () => {
    window.removeEventListener("afterprint", cleanup);
    root.remove();
    style.remove();
    document.title = prevTitle;
  };
  window.addEventListener("afterprint", cleanup);
  // فريم واحد عشان رسالة «اختر حفظ PDF» تلحق تظهر قبل نافذة الطباعة (بتوقف الصفحة في متصفحات الديسكتوب)
  window.setTimeout(() => {
    try {
      window.print();
    } catch {
      cleanup();
    }
  }, 60);
  return true;
}

// فاتورة بسيطة للطباعة (من غير مستند جاهز في الصفحة): الشعار + العنوان + صفوف قيمة
export function printReceipt({ title, subtitle, rows, fileName }: { title: string; subtitle?: string; rows: [string, string][]; fileName?: string }): boolean {
  if (typeof document === "undefined") return false;
  const doc = document.createElement("div");
  doc.style.cssText = "font-family: inherit; color: #0b0d0a; padding: 8px 0;";
  const logo = document.createElement("img");
  logo.src = "/brand/logo-primary.svg";
  logo.alt = "LINKAR";
  logo.style.cssText = "height: 20px; margin-bottom: 20px;";
  const h = document.createElement("h1");
  h.textContent = title;
  h.style.cssText = "font-size: 20px; font-weight: 700; margin: 0 0 4px;";
  doc.append(logo, h);
  if (subtitle) {
    const p = document.createElement("p");
    p.textContent = subtitle;
    p.style.cssText = "font-size: 13px; color: #5d6661; margin: 0 0 16px;";
    doc.append(p);
  }
  const dl = document.createElement("dl");
  dl.style.cssText = "margin: 0; border-top: 1px solid #d9dedb;";
  for (const [k, v] of rows) {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #d9dedb; font-size: 14px;";
    const dt = document.createElement("dt");
    dt.textContent = k;
    dt.style.color = "#5d6661";
    const dd = document.createElement("dd");
    dd.textContent = v;
    dd.style.cssText = "margin: 0; font-weight: 600; text-align: end;";
    row.append(dt, dd);
    dl.append(row);
  }
  doc.append(dl);
  return printElement(doc, fileName);
}
