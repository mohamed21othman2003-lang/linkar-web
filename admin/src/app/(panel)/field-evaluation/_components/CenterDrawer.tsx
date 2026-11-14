"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CENTER_ACTION_LABEL } from "@/lib/api/field-evaluation";
import { useUrlState } from "@/lib/use-url-state";
import { Card, EndNote, KV, SPill } from "./bits";

// CON5-17D · <المركز> (600 · رأس كحلي r18 بشارات الحالة والتصنيف + نسبة التقييم الميداني 24 Bold · بطاقات «الموديولات/التجربة/الاعتماد»):
//   مركز الواحة للعناية (3114:62902) · مركز درع للحماية (62943) · مغاسل اللؤلؤة (62994) · كار سبا (63044) · مركز الصفوة للعناية (63080)
//   جونسون Johnson (63109) · XPEL السعودية (63160) · مركز الريم (63197) · مغسلة الفارس (63226)
// زر الذيل: متابعة التقييم → CON5-T1701 · قرار الاعتماد → CON5-17P (درع) أو نافذة القرار (اللؤلؤة) · منح مباشر → نافذة · جدولة تقييم دوري → نافذة
export function CenterDrawer() {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const id = url.get("center");
  const modal = url.get("modal");
  const q = useQuery({ queryKey: ["centers", "one", id], queryFn: () => api.centers.get(id!), enabled: !!id, retry: false });
  const c = q.data;
  const close = () => url.replace({ center: null, modal: null });
  const draft = useMutation({ mutationFn: () => api.centers.saveDraft(id!), onSuccess: (r) => toast("مسودة", r.toast) });

  const act = () => {
    if (!c?.action) return;
    if (c.action === "continue") draft.mutate();
    else if (c.action === "decision" && c.id === "lk-dr-001") router.push(`/field-evaluation/centers/${c.id}`);
    else url.push({ modal: c.action === "decision" ? "fe-decision" : c.action === "direct" ? "fe-direct" : "fe-periodic" });
  };

  return (
    <Drawer
      open={!!id && !modal}
      onOpenChange={(o) => !o && close()}
      title={c?.name ?? (q.isError ? "المركز غير موجود" : "…")}
      subtitle={c?.drawerSub}
      footer={
        c?.action ? (
          <Button variant={c.action === "periodic" ? "secondary" : "primary"} className={c.action === "periodic" ? "h-[50px]!" : ""} loading={draft.isPending} onClick={act}>
            {CENTER_ACTION_LABEL[c.action].drawer}
          </Button>
        ) : undefined
      }
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-24 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-14" />
        </>
      ) : q.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-13 text-muted">تعذّر تحميل المركز.</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : c ? (
        <>
          <div className="flex items-center gap-3.5 rounded-[18px] bg-ink p-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="num text-24 font-bold text-white">{c.hero.value}</p>
              <p className="text-12 leading-5 font-medium text-white">التقييم الميداني</p>
            </div>
            {[...c.hero.pills].reverse().map((p) => (
              <SPill key={p.label} tone={p.tone}>
                {p.label}
              </SPill>
            ))}
          </div>
          {c.tiles.map((t) => (
            <Card key={t.title} title={t.title} center>
              {t.rows.map(([k, v, tone]) => (
                <KV key={k} k={k} tone={tone} tight>
                  {v}
                </KV>
              ))}
            </Card>
          ))}
          {c.note ? (
            <EndNote start tone={c.note.tone === "info" ? "trial" : c.note.tone} icon={c.note.tone === "info" ? "info" : "alert"}>
              {c.note.text}
            </EndNote>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
