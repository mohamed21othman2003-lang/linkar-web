"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DCard, DKV, FootBtn, NavyHero, Pill } from "@/components/finance/bits";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { PaymentDetail } from "@/lib/api/payments";
import { useUrlState } from "@/lib/use-url-state";

// CON5-15D · درج العملية: PAY-2026-10-48812 (3114:47343) · 48807 (47381) · 48803 (47419) · 48796 (47457) · 48781 (47495)
// · RF-2026-0190 (3114:47289) · RF-2026-0189 (47533) · RF-2026-0186 (47568)
// «عرض الإيصال» → الفاتورة CON5-16V · «عرض الإشعار الدائن» → الإشعار الدائن CON5-16V · «إرسال الإيصال» → رسالة للعميل + تأكيد
// (مفيش إطار CON5-15T للتأكيد في Figma — النص «أُرسل الإيصال للعميل» من عندنا).
export function PaymentDrawer() {
  const url = useUrlState();
  const id = url.get("refund") ?? url.get("payment");
  const q = useQuery({ queryKey: ["payments", "detail", id], queryFn: () => api.payments.get(id!), enabled: !!id });
  const d = q.data;
  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && url.replace({ refund: null, payment: null })}
      title={d?.title ?? (q.isError ? "تعذّر تحميل العملية" : "…")}
      subtitle={d?.subtitle}
      tight
      footerClassName="sm:pb-6!"
      footer={d ? <Footer key={d.id} d={d} /> : undefined}
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[82px] w-full rounded-16" />
          <Skeleton className="h-[194px] w-full rounded-14" />
        </>
      ) : q.isError ? (
        <p className="py-10 text-center text-13 text-muted">
          تعذّر تحميل العملية.{" "}
          <button type="button" className="font-medium text-ink underline" onClick={() => q.refetch()}>
            إعادة المحاولة
          </button>
        </p>
      ) : d ? (
        <>
          <NavyHero title={d.hero.title} pill={<Pill tone={d.tone}>{d.status}</Pill>} lines={d.hero.lines} gap={d.hero.lines.length > 1 ? 8 : 6} />
          {d.tiles.map((t) => (
            <DCard key={t.title} title={t.title} variant={d.tileStyle}>
              {t.rows.map(([k, v]) => (
                <DKV key={k} k={k}>
                  {v}
                </DKV>
              ))}
            </DCard>
          ))}
        </>
      ) : null}
    </Drawer>
  );
}

function Footer({ d }: { d: PaymentDetail }) {
  const toast = useToast();
  const router = useRouter();
  const send = useMutation({ mutationFn: () => api.payments.sendReceipt(d.id), onSuccess: () => toast("أُرسل الإيصال", "أُرسل الإيصال للعميل") });
  const view = () => router.push(`/invoices?invoice=${encodeURIComponent(d.doc)}`);
  if (d.footer === "refund-live")
    return (
      <div className="flex items-center gap-2.5">
        <FootBtn variant="accent" icon="share" loading={send.isPending} onClick={() => send.mutate()}>
          إرسال الإيصال للعميل
        </FootBtn>
        <span className="hidden flex-1 sm:block" />
        <FootBtn variant="secondary" icon="receipt" onClick={view}>
          عرض الإشعار الدائن
        </FootBtn>
      </div>
    );
  return (
    <div className="flex items-center gap-2.5 [&>*]:flex-1">
      <FootBtn variant="primary" icon="file" onClick={view}>
        {d.footer === "credit" ? "عرض الإشعار الدائن" : "عرض الإيصال"}
      </FootBtn>
      <FootBtn variant="secondary" icon="mail" loading={send.isPending} onClick={() => send.mutate()}>
        إرسال الإيصال
      </FootBtn>
    </div>
  );
}
