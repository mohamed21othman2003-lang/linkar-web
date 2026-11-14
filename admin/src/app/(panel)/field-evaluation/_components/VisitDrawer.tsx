"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useUrlState } from "@/lib/use-url-state";
import { Card, EndNote, KV, VisitPill } from "./bits";

// CON5-17D · زيارة · … (600 · رأس كحلي r16 · بطاقة «الزيارة»/«النتيجة حسب القالب» · ذيل بزرين):
//   الزهراء والحمراء · مجدولة (3114:64210) · فرع الصفا · مجدولة (3114:64248) · فرع النسيم · بانتظار القرار (3114:64283)
//   فرع السامر · مكتملة (3114:64329) · فرع العليا · مكتملة (3114:64370) · (أبحر الشمالية: TODO(Figma) ما لهاش إطار)
// الأزرار: مجدولة = «إعادة جدولة» (CON5-17M 3114:64161) / «إلغاء الزيارة» (3114:64191)
//          بانتظار القرار = «اعتماد القرار» → CON5-17T صدر قرار النسيم / «زيارة ثانية» → جدولة زيارة للفرع نفسه
//          مكتملة = «تقرير الزيارة PDF» → CON5-17T تنزيل تقرير الزيارة / «إغلاق»
export function VisitDrawer() {
  const url = useUrlState();
  const id = url.get("visit");
  const modal = url.get("modal");
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["field-visits", "one", id], queryFn: () => api.fieldVisits.get(id!), enabled: !!id, retry: false });
  const v = q.data;
  const close = () => url.replace({ visit: null, modal: null });

  const decide = useMutation({
    mutationFn: () => api.fieldVisits.decide(id!),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["field-visits"] });
      qc.invalidateQueries({ queryKey: ["centers"] });
      url.replace({ visit: null });
      toast("صدر القرار", r.toast);
    },
  });
  const report = useMutation({
    mutationFn: () => api.fieldVisits.report(id!),
    onSuccess: (r) => toast("تقرير الزيارة", r.toast),
  });

  const footer = !v ? null : v.tab === "scheduled" ? (
    <>
      <Button className="h-11!" icon={<Icon name="calendar" size={16} />} onClick={() => url.push({ modal: "fe-reschedule" })}>
        إعادة جدولة
      </Button>
      <Button variant="secondary" className="h-[46px]!" onClick={() => url.push({ modal: "fe-cancel" })}>
        إلغاء الزيارة
      </Button>
    </>
  ) : v.tab === "pending" ? (
    <>
      <Button className="h-11!" loading={decide.isPending} onClick={() => decide.mutate()}>
        اعتماد القرار
      </Button>
      <Button variant="secondary" className="h-[46px]!" onClick={() => url.push({ modal: "fe-schedule", branch: v.branchCode ?? null })}>
        زيارة ثانية
      </Button>
    </>
  ) : (
    <>
      <Button className="h-11!" loading={report.isPending} icon={<Icon name="download" size={16} />} onClick={() => report.mutate()}>
        تقرير الزيارة PDF
      </Button>
      <Button variant="secondary" className="h-[46px]!" onClick={close}>
        إغلاق
      </Button>
    </>
  );

  return (
    <Drawer
      open={!!id && !modal}
      onOpenChange={(o) => !o && close()}
      title={v?.title ?? (q.isError ? "الزيارة غير موجودة" : "…")}
      subtitle={v?.subtitle}
      tight
      footer={footer}
      footerClassName="sm:pb-6!"
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[108px] w-full rounded-16" />
          <Skeleton className="h-40 w-full rounded-14" />
        </>
      ) : q.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-13 text-muted">تعذّر تحميل الزيارة.</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : v ? (
        <>
          <div className="flex flex-col gap-1.5 rounded-16 bg-ink px-[18px] py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-16 leading-6 font-bold text-white">{v.heroTitle}</p>
              <VisitPill tone={v.pill.tone}>{v.heroPill ?? v.pill.label.split(" · ")[0]}</VisitPill>
            </div>
            {v.heroLines.map((l) => (
              <p key={l} className="text-13 leading-5 font-light text-[#c9d1cd]">
                {l}
              </p>
            ))}
          </div>
          {v.cards.map((c) => (
            <Card key={c.title} title={c.title}>
              <div className="flex flex-col">
                {c.rows.map(([k, val]) => (
                  <KV key={k} k={k}>
                    {val}
                  </KV>
                ))}
              </div>
            </Card>
          ))}
          {v.note ? <EndNote>{v.note}</EndNote> : null}
        </>
      ) : null}
    </Drawer>
  );
}
