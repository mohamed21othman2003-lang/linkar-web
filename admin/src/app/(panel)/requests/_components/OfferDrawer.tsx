"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { ltrRuns, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { HeroPill, RTile } from "./bits";
import { ScrollX } from "@/components/ui/ScrollX";

// CON5-12D · عرض لينكار باتفاق مع المزوّد — خصم 15% تظليل كامل · لومار (مسودة) (3114:30133) · خصم 10% تفصيل داخلي كامل · جونسون (3114:30328)
// الرابط: ?offer=OF-LM-15 | OF-JN-10 — «إرسال للتوقيع» → CON5-12T (3114:32273)
// TODO(Figma): مفيش مدخل ظاهر للإطارين في القسم (ولا صف في الجدول) — متاحين بالرابط بس.
export function OfferDrawer() {
  const url = useUrlState();
  const id = url.get("offer");
  const toast = useToast();
  const qc = useQueryClient();
  const canEdit = useCan("requests", "decide");
  const q = useQuery({ queryKey: ["linkar-offers", id], queryFn: () => api.linkarOffers.get(id!), enabled: !!id, retry: false });
  const o = q.data;
  const close = () => url.replace({ offer: null });
  const m = useMutation({
    mutationFn: () => api.linkarOffers.act(id!),
    onSuccess: (x) => {
      qc.invalidateQueries({ queryKey: ["linkar-offers"] });
      close();
      toast("تم", x.toast);
    },
  });
  const actionable = o && canEdit && ((o.status === "draft" && o.action.next === "scheduled") || (o.status === "scheduled" && o.action.next === "stopped"));
  return (
    <Drawer
      open={!!id}
      onOpenChange={(v) => !v && close()}
      tight
      footerClassName="sm:pb-6!"
      title={o?.title ?? (q.isError ? "العرض" : "…")}
      subtitle={o?.subtitle}
      footer={
        actionable ? (
          <div className="flex items-center">
            <Button variant="accent" className="h-11 px-4" loading={m.isPending} onClick={() => m.mutate()}>
              {o.action.label}
            </Button>
          </div>
        ) : undefined
      }
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[112px] rounded-16" />
          <Skeleton className="h-[250px] rounded-14" />
        </>
      ) : !o ? (
        <Note tone="neutral">لم يعد هذا العرض موجوداً.</Note>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-16 bg-ink px-[18px] py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-16 leading-6 font-bold text-white">{o.heroTitle}</p>
              <HeroPill tone={o.status === "stopped" ? "rejected" : o.status === "scheduled" ? "approved" : o.pill.tone}>{o.status === "stopped" ? "موقوف" : o.status === "scheduled" ? "مجدول" : o.pill.label}</HeroPill>
            </div>
            {o.lines.map((l) => (
              <p key={l} className="text-13 leading-5 font-light text-[#c9d1cd]">
                {ltrRuns(l)}
              </p>
            ))}
          </div>
          <RTile title="الأسعار · شاملة الضريبة">
            <ScrollX className="rounded-10 border border-border">
              <div className="min-w-[440px]">
                <div className="grid min-h-14 grid-cols-5 items-center bg-surface-1 px-2.5 py-2 text-12 leading-5 font-medium text-muted">
                  {["الحجم", "التكلفة الحالية", "التكلفة في العرض", "سعر البيع الآن", "سعر البيع في العرض"].map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
                {o.rows.map(([size, cost, offerCost, sale, offerSale]) => (
                  <div key={size} className="grid min-h-[37px] grid-cols-5 items-center border-b border-divider px-2.5 py-2 text-13 leading-5 text-ink last:border-b-0">
                    <span className="font-medium">{ltrRuns(size)}</span>
                    <span className="num">{num(cost)}</span>
                    <span className="num">{num(offerCost)} ✓</span>
                    <span className="num">{num(sale)}</span>
                    <span className="num">{num(offerSale)}</span>
                  </div>
                ))}
              </div>
            </ScrollX>
            <p className="text-12 leading-5 font-light text-muted">{o.marginLine}</p>
          </RTile>
        </>
      )}
    </Drawer>
  );
}
