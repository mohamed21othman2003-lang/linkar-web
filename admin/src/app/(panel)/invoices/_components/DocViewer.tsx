"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { keepFocusQuiet } from "@/components/ui/focus";
import { api, isApiError } from "@/lib/api";
import type { DocView } from "@/lib/api/invoices";
import { useUrlState } from "@/lib/use-url-state";

// CON5-16V · عرض المستند (فاتورة ضريبية مبسّطة INV-L-2026-10-08812 3114:47692 · 08807 47738 · 08803 47784 · 08805 48173 · 08799 48219
// · 08790 48265 · 08781 48311 · 08766 48357 · 08742 48403 · إشعار دائن CN-L-2026-10-00412 47830 · 00409 47876
// · فوترة ذاتية SB-2026-10-0062 48449 · SB-2026-09-0048 48495) — الرابط ?invoice=<رقم المستند>
// خلفية كحلي 70% (فوق أبيض: الصفحة مش باينة تحتها زي الإطار) · شريط 64 كحلي حشو 14·24: العنوان 14 Medium أبيض يمين
// و«إرسال للعميل» (فاتورة المزوّد: «إرسال للمزوّد») + «تنزيل PDF» (ثانوي 46 r12 · الأيقونة شمال) + إغلاق 36 r10 بإطار #3D5260 على الشمال
// الورقة 680 بيضا r6 حشو 40·48 مسافة 10 تحت الشريط بـ36: العنوان 22/34 Bold · الجهة 12/18 Light رمادي · سطور 32 (13) · الإجمالي 15 · QR 96 · تذييل 12/18
// (مفيش إطار تأكيد CON5-16T في Figma — نصوص التأكيد من عندنا: «أُرسل المستند…» و«جاري تجهيز ملف PDF…»)
const SENT: Record<DocView["kind"], string> = { invoice: "أُرسلت الفاتورة", credit: "أُرسل الإشعار الدائن", "self-billing": "أُرسلت الفاتورة" };

export function DocViewer() {
  const url = useUrlState();
  const id = url.get("invoice");
  if (!id) return null;
  return <Viewer key={id} id={id} onClose={() => url.replace({ invoice: null })} />;
}

function Viewer({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast();
  const q = useQuery({ queryKey: ["invoices", "doc", id], queryFn: () => api.invoices.doc(id), retry: false });
  const d = q.data;
  const send = useMutation({ mutationFn: () => api.invoices.send(id), onSuccess: () => toast("أُرسل المستند", `${SENT[d?.kind ?? "invoice"]} ${id} ${d?.kind === "self-billing" ? "للمزوّد" : "للعميل"}`) });
  const pdf = useMutation({ mutationFn: () => api.invoices.pdf(id), onSuccess: () => toast("تنزيل PDF", `جاري تجهيز ملف PDF لـ${id}`) });
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-white">
          <div className="absolute inset-0 bg-ink/70" />
        </Dialog.Overlay>
        <Dialog.Content dir="rtl" onOpenAutoFocus={keepFocusQuiet} className="fixed inset-0 z-50 flex flex-col overflow-y-auto focus:outline-none" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="flex min-h-16 shrink-0 flex-wrap items-center gap-2.5 bg-ink px-4 py-2 sm:px-6">
            <Dialog.Title className="min-w-0 flex-1 truncate text-14 leading-[22px] font-medium text-white">{d?.bar ?? id}</Dialog.Title>
            <Dialog.Description className="sr-only">عرض المستند للطباعة أو الإرسال</Dialog.Description>
            <BarBtn icon="mail" loading={send.isPending} disabled={!d} onClick={() => send.mutate()}>
              {d?.kind === "self-billing" ? "إرسال للمزوّد" : "إرسال للعميل"}
            </BarBtn>
            <BarBtn icon="download" loading={pdf.isPending} disabled={!d} onClick={() => pdf.mutate()}>
              تنزيل PDF
            </BarBtn>
            <Dialog.Close aria-label="إغلاق" className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-[#3d5260] text-white hover:bg-white/10">
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 items-start justify-center px-4 pt-9 pb-10" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <article className="flex w-full max-w-[680px] flex-col gap-2.5 rounded-[6px] bg-white px-5 py-8 sm:px-12 sm:py-10">
              {q.isError ? (
                <p className="py-10 text-center text-13 text-muted">
                  {isApiError(q.error, 404) ? "المستند غير موجود" : "تعذّر تحميل المستند"}
                  {isApiError(q.error, 404) ? null : (
                    <>
                      {" · "}
                      <button type="button" className="font-medium text-ink underline" onClick={() => q.refetch()}>
                        إعادة المحاولة
                      </button>
                    </>
                  )}
                </p>
              ) : !d ? (
                Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-6 w-full" />)
              ) : (
                <>
                  <h2 className="text-[22px] leading-[34px] font-bold text-ink">{d.title}</h2>
                  <p className="text-12 leading-[18px] font-light text-muted">{d.issuer}</p>
                  {d.rows.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
                      <span className="shrink-0 font-light text-muted">{k}</span>
                      <span className="min-w-0 text-end font-medium text-ink">{v}</span>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-3 py-1.5 text-[15px] leading-5">
                    <span className="shrink-0 font-light text-muted">{d.total[0]}</span>
                    <span className="num min-w-0 text-end font-bold text-ink">{d.total[1]}</span>
                  </div>
                  <span aria-label="رمز QR (هيئة الزكاة والضريبة والجمارك)" role="img" className="flex size-24 items-center justify-center rounded-[6px] border border-border bg-white text-ink">
                    <Icon name="qr" size={72} />
                  </span>
                  <p className="text-12 leading-[18px] font-light text-muted">{d.footer}</p>
                </>
              )}
            </article>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BarBtn({ icon, children, loading, disabled, onClick }: { icon: "mail" | "download"; children: string; loading?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className="inline-flex h-[46px] shrink-0 items-center gap-1.5 rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1 disabled:opacity-70"
    >
      {children}
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon name={icon} size={16} />}
    </button>
  );
}
