"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/panel/PageHead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { accountTitle, type ReceivingAccount } from "@/lib/api/bank";
import { useUrlState } from "@/lib/use-url-state";
import { AddAccountModal, SettlementModal } from "../_components/bank/BankModals";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الحساب البنكي (3260-204545)
// بطاقة r14 بإطار · حشو 16 · مسافة 8: العنوان 16 Bold يمين + «إضافة حساب» (ثانوي M 46 · edit 16) شمال
// كل حساب صف r12 بإطار · حشو 10·12: الاسم 14 SemiBold + سطر 12 Light رمادي يمين · شارة «الافتراضي · موثّق» (#EAF7EC) أو «جديد» (#FDF3E1) + «مراجعة الطلب» شمال.
// الحساب الجديد من المزوّد = طلب (CON5-03D) بشارة «جديد» وزر «مراجعة الطلب» · المضاف من اللوحة «بانتظار التحقق» لحد ما «المالية» تتحقق.
// النوافذ (القسم 2.3): ?tab=bank&modal=bank-add (CON5-07M إضافة حساب استلام) · ?tab=bank&modal=settlement (CON5-07M إعدادات تسوية — مش مربوطة في Figma).
const PILL = {
  verified: ["الافتراضي · موثّق", "bg-success-tint text-success"],
  request: ["جديد", "bg-[#fdf3e1] text-warning"],
  pending: ["بانتظار التحقق", "bg-[#fdf3e1] text-warning"],
} as const;

export default function BankTab({ profile, canEdit }: ProfileTabProps) {
  const url = useUrlState();
  const pid = profile.provider.id;
  const q = useQuery({ queryKey: ["providers", "bank", pid], queryFn: () => api.bank.list(pid) });
  const branches = useQuery({ queryKey: ["providers", "branches", pid], queryFn: () => api.profile.branches(pid) });
  const modal = url.get("modal");
  const close = () => url.replace({ modal: null });
  const branchName = (id: string | null) => (id ? `فرع ${branches.data?.find((b) => b.id === id)?.name ?? ""}` : "كل الفروع");

  const sub = (a: ReceivingAccount) =>
    [a.type === "bank" ? "حساب بنكي" : "محفظة إلكترونية", ...(a.requestNote ? [a.requestNote, a.requestId] : [a.holder, a.branchId ? `مخصّص لـ${branchName(a.branchId)}` : branchName(null)])].filter(Boolean).join(" · ");
  const state = () => {
    if (q.isError)
      return (
        <EmptyState
          title="تعذّر تحميل البيانات"
          body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
          action={
            <Button variant="secondary" size="S" onClick={() => q.refetch()}>
              إعادة المحاولة
            </Button>
          }
        />
      );
    if (q.data && !q.data.items.length)
      return (
        <EmptyState
          title="لا يوجد حساب استلام بعد"
          body="أضف حساباً بنكياً أو محفظة إلكترونية لاستلام مستحقات المزوّد."
          action={
            canEdit ? (
              <Button variant="secondary" size="S" onClick={() => url.push({ modal: "bank-add" })}>
                إضافة حساب
              </Button>
            ) : undefined
          }
        />
      );
    return null;
  };

  return (
    <>
      <section className="flex flex-col gap-2 rounded-14 border border-border bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-16 leading-6 font-bold text-ink">الحساب البنكي لاستلام المستحقات</h2>
          {canEdit ? (
            <Button variant="secondary" className="h-[46px] px-4" icon={<Icon name="edit" size={16} />} onClick={() => url.push({ modal: "bank-add" })}>
              إضافة حساب
            </Button>
          ) : null}
        </div>
        {q.isLoading
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-12" />)
          : (state() ??
            q.data?.items.map((a) => {
              const pill = a.isDefault && a.status === "verified" ? PILL.verified : a.status === "request" ? PILL.request : a.status === "pending" ? PILL.pending : null;
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-2.5 rounded-12 border border-border bg-white px-3 py-2.5">
                  <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                    <span className="text-14 leading-[22px] font-semibold text-ink">{accountTitle(a)}</span>
                    <span className="text-12 leading-[18px] font-light text-muted">{sub(a)}</span>
                  </div>
                  {pill ? <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium ${pill[1]}`}>{pill[0]}</span> : null}
                  {a.status === "request" && a.requestId ? (
                    // CON5-03D · الطلبات (القسم 4) لسه ما اتبنتش — الرابط بيفتح صفحة الطلبات على رقم الطلب
                    <ButtonLink href={`/coming-soon?s=requests&req=${a.requestId}`} variant="secondary" className="h-[46px] px-4">
                      مراجعة الطلب
                    </ButtonLink>
                  ) : null}
                </div>
              );
            }))}
      </section>
      {modal === "bank-add" ? <AddAccountModal profile={profile} branches={branches.data ?? []} close={close} /> : null}
      {modal === "settlement" ? <SettlementModal profile={profile} close={close} /> : null}
    </>
  );
}
