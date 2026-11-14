"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KV, Tile } from "@/components/panel/KV";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useUrlState } from "@/lib/use-url-state";
import { EndNote } from "../../field-evaluation/_components/bits";
import { QualityHero } from "./ComplaintDrawer";

// CON5-18D · RV-… (600 · رأس كحلي بأيقونة نجمة · «نص التقييم» · «رد المركز» · «تقييم الجوانب»):
//   بلاغات: RV-88407 (3114:826) · RV-88395 (857) → «إخفاء» (CON5-18M إخفاء → CON5-T1804) / «إبقاء» (CON5-T1805)
//   RV-88402 (888) رد بانتظار الاعتماد → «اعتماد ونشر الرد» (CON5-T1807) / «إعادة مع ملاحظة» (CON5-18M 3114:1300 → CON5-T1808)
//   RV-88399 (935) · RV-88391 (973) · RV-88377 مخفي (1011) — عرض فقط
export function ReviewDrawer() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const id = url.get("review");
  const modal = url.get("modal");
  const q = useQuery({ queryKey: ["quality", "review", id], queryFn: () => api.quality.review(id!), enabled: !!id, retry: false });
  const r = q.data;
  const close = () => url.replace({ review: null, modal: null });
  const done = (t: string, title: string) => {
    qc.invalidateQueries({ queryKey: ["quality"] });
    toast(title, t);
  };
  const keep = useMutation({ mutationFn: () => api.quality.keep(id!), onSuccess: (x) => (done(x.toast, "أُبقي التقييم"), url.replace({ review: null })) });
  const approve = useMutation({ mutationFn: () => api.quality.approveReply(id!), onSuccess: (x) => done(x.toast, "نُشر رد المركز") });

  return (
    <Drawer
      open={!!id && !modal}
      onOpenChange={(o) => !o && close()}
      title={r?.title ?? (q.isError ? "التقييم غير موجود" : "…")}
      subtitle={r?.subtitle}
      footer={
        r?.state === "flagged" ? (
          <>
            <Button variant="secondary" className="h-[50px]!" loading={keep.isPending} onClick={() => keep.mutate()}>
              إبقاء
            </Button>
            <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "rv-hide" })}>
              إخفاء
            </Button>
          </>
        ) : undefined
      }
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[90px] w-full rounded-[18px]" />
          <Skeleton className="h-20 w-full rounded-14" />
        </>
      ) : q.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-13 text-muted">تعذّر تحميل التقييم.</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : r ? (
        <>
          <QualityHero icon="star" title={r.heroTitle} sub={r.heroSub} pill={r.heroPill ? { label: r.heroPill, tone: "danger" } : undefined} />
          <Tile title="نص التقييم">
            <p className="text-13 leading-[22px] font-light text-ink">{r.fullText}</p>
          </Tile>
          {r.state === "flagged" ? <EndNote start tone="trial">الإخفاء يزيل التقييم من صفحة المركز ولا يُحتسب في المتوسط. الإبقاء يغلق البلاغ.</EndNote> : null}
          {r.reply ? (
            <Tile title={r.reply.pending ? "رد المركز · بانتظار اعتماد لينكار" : "رد المركز"}>
              <p className="text-13 leading-[22px] font-light text-ink">{r.reply.text}</p>
              {r.reply.pending ? (
                <div className="flex min-h-[100px] flex-wrap items-center gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
                  <Button variant="accent" className="h-11!" icon={<Icon name="check" size={16} />} loading={approve.isPending} onClick={() => approve.mutate()}>
                    اعتماد ونشر الرد
                  </Button>
                  <Button variant="secondary" className="h-[46px]!" onClick={() => url.push({ modal: "rv-return" })}>
                    إعادة مع ملاحظة
                  </Button>
                </div>
              ) : null}
            </Tile>
          ) : null}
          {r.aspects ? (
            <Tile title="تقييم الجوانب">
              {r.aspects.map(([k, v]) => (
                <KV key={k} k={k}>
                  <span dir="ltr">★ {v}</span>
                </KV>
              ))}
            </Tile>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
