"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DCard, DKV, FootBtn, NavyHero, Pill } from "@/components/finance/bits";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { VoucherDetail } from "@/lib/api/invoices";
import { useUrlState } from "@/lib/use-url-state";

// CON5-16D · درج القسيمة: LK-9H4T-2PWC (3114:47922) · LK-8P3V-6JRC (47955) · LK-3R7D-9KWA (47988) · LK-5C1N-8TQE (48021) · LK-2W8K-6FMA (48053)
// رأس كحلي (الخدمة + الشارة + الصلاحية) · بطاقة QR 154 (رمز 120 في النص) · «القواعد» · الذيل: «إعادة إرسال» (أو «إغلاق» للمستخدمة/الملغاة)
// + «عرض الحجز» (أو «فتح الطلب REQ-0417» لقسيمة لدى لينكار). تأكيد «إعادة إرسال» من عندنا (مفيش إطار CON5-16T).
export function VoucherDrawer() {
  const url = useUrlState();
  const code = url.get("voucher");
  const q = useQuery({ queryKey: ["invoices", "voucher", code], queryFn: () => api.invoices.voucher(code!), enabled: !!code });
  const v = q.data;
  const close = () => url.replace({ voucher: null });
  return (
    <Drawer
      open={!!code}
      onOpenChange={(o) => !o && close()}
      title={v ? `القسيمة ${v.code}` : q.isError ? "تعذّر تحميل القسيمة" : "…"}
      subtitle={v?.subtitle}
      tight
      footerClassName="sm:pb-6!"
      footer={v ? <Footer key={v.code} v={v} onClose={close} /> : undefined}
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[82px] w-full rounded-16" />
          <Skeleton className="h-[154px] w-full rounded-14" />
        </>
      ) : q.isError ? (
        <p className="py-10 text-center text-13 text-muted">
          تعذّر تحميل القسيمة.{" "}
          <button type="button" className="font-medium text-ink underline" onClick={() => q.refetch()}>
            إعادة المحاولة
          </button>
        </p>
      ) : v ? (
        <>
          <NavyHero title={v.hero.title} pill={<Pill tone={v.hero.tone}>{v.hero.pill}</Pill>} lines={[v.hero.line]} />
          <div role="img" aria-label={`رمز QR للقسيمة ${v.code}`} className="flex items-center justify-center rounded-14 border border-border bg-white p-4 text-ink">
            <Icon name="qr" size={120} />
          </div>
          <DCard title="القواعد">
            {v.rules.map(([k, val]) => (
              <DKV key={k} k={k}>
                {val}
              </DKV>
            ))}
          </DCard>
        </>
      ) : null}
    </Drawer>
  );
}

function Footer({ v, onClose }: { v: VoucherDetail; onClose: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const resend = useMutation({ mutationFn: () => api.invoices.send(v.code, "resend"), onSuccess: () => toast("أُعيد إرسال القسيمة", `أُعيد إرسال القسيمة ${v.code} للعميل`) });
  return (
    <div className="flex items-center gap-2.5 [&>*]:flex-1">
      <FootBtn variant="primary" onClick={() => router.push(v.primary.href)}>
        {v.primary.label}
      </FootBtn>
      {v.secondary === "resend" ? (
        <FootBtn variant="secondary" icon="mail" loading={resend.isPending} onClick={() => resend.mutate()}>
          إعادة إرسال
        </FootBtn>
      ) : (
        <FootBtn variant="secondary" onClick={onClose}>
          إغلاق
        </FootBtn>
      )}
    </div>
  );
}
