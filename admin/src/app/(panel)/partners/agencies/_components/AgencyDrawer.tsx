"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { ARR_LABEL } from "@/lib/api/agencies";
import { phone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { actModal } from "./AgenciesView";
import { APill, DKV, DTile, Hero, Stats } from "./bits";

// CON5-09D · DL-014 (3114:2254) · DL-007 (2304) · DL-021 (2352) · DL-018 (2400) · DL-009 (2448) · DL-011 (2496)
// درج الوكالة ?agency=DL-… : رأس كحلي (شارة الوضع المالي) · 4 إحصاءات · الترتيب المالي · المسؤول المفوّض
// الأزرار: إجراء الوكالة (كحلي) · ملف الوكالة (لو لها ملف CON5-09P) · إيقاف الوكالة (لو مش موقوفة)
const ACT_FOOT = { limit: "تعديل الحد", pay: "تسجيل سداد", topup: "تسجيل شحن", confirm: "تأكيد الشحن", reactivate: "إعادة تفعيل" } as const;

export function AgencyDrawer() {
  const url = useUrlState();
  const router = useRouter();
  const id = url.get("agency");
  const q = useQuery({ queryKey: ["agencies", "one", id], queryFn: () => api.agencies.get(id!), enabled: !!id, retry: false });
  const a = q.data;
  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && url.replace({ agency: null })}
      title={a?.name ?? "…"}
      subtitle={a ? <bdi>{`${a.id} · ${ARR_LABEL[a.arrangement]}`}</bdi> : " "}
      footer={
        a ? (
          <>
            <Button onClick={() => url.push(actModal(a))}>{ACT_FOOT[a.act]}</Button>
            {a.hasProfile ? (
              <Button variant="secondary" className="h-[50px]!" onClick={() => router.push(`/partners/agencies/${a.id}`)}>
                ملف الوكالة
              </Button>
            ) : null}
            {!a.suspended ? (
              <Button variant="secondary" className="h-[50px]! text-danger-strong!" onClick={() => url.push({ modal: "ag-suspend", ref: a.id })}>
                إيقاف الوكالة
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الوكالة.</p>
      ) : !a ? (
        <>
          <Skeleton className="h-[84px] w-full rounded-[18px]" />
          <Skeleton className="h-[74px] w-full rounded-12" />
          <Skeleton className="h-[110px] w-full rounded-14" />
        </>
      ) : (
        <>
          <Hero icon="car" sub={a.heroLine} pill={<APill tone={a.status.tone}>{a.status.tone === "danger" ? "متأخر" : a.status.label}</APill>} />
          <Stats items={a.stats} />
          <DTile title="الترتيب المالي">
            <DKV k="الترتيب">{ARR_LABEL[a.arrangement]}</DKV>
            <p className="text-13 leading-[22px] font-light text-ink">{a.financeLine}</p>
          </DTile>
          <DTile title="المسؤول المفوّض">
            <p className="text-13 leading-[22px] font-medium text-ink">
              {a.contact.name} · <bdi>{phone(a.contact.phone)}</bdi>
            </p>
          </DTile>
        </>
      )}
    </Drawer>
  );
}
