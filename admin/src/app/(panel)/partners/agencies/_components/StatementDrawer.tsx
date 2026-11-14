"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { ST_LABEL } from "@/lib/api/agencies";
import { arDate, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { APill, DKV, DTile, Hero } from "./bits";

// CON5-09D · INV-2026-09-0198 (3114:3033) · INV-2026-10-0214 (3076) · INV-2026-10-0215 (3117) · INV-2026-10-0212 (3158)
// · INV-2026-09-0151 (6553 — الشكل المفصّل، بيتفتح من «الكشوف والمدفوعات» في ملف الوكالة). الرابط ?inv=INV-…
// الأزرار: متأخر = تسجيل سداد + تذكير (T0907) · صادر = تسجيل سداد · المفصّل = تنزيل PDF (T0932)
export function StatementDrawer() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const id = url.get("inv");
  const q = useQuery({ queryKey: ["agencies", "statement", id], queryFn: () => api.agencies.statement(id!), enabled: !!id, retry: false });
  const s = q.data;
  const remind = useMutation({
    mutationFn: () => api.agencies.remind(id!),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("تذكير", r.toast);
    },
  });
  const d = s?.detailed;
  const pill = s ? (d ? { label: "مدفوعة", tone: "success" as const } : s.state === "overdue" ? { label: `متأخر ${s.overdueDays} يوماً`, tone: "danger" as const } : ST_LABEL[s.state]) : null;

  return (
    <Drawer
      open={!!id}
      onOpenChange={(v) => !v && url.replace({ inv: null })}
      title={<bdi>{s?.id ?? id}</bdi>}
      subtitle={s ? (d ? d.subtitle : `${s.agency} · كشف ${s.period}`) : " "}
      footer={
        !s ? null : d ? (
          <Button variant="secondary" className="h-[50px]!" icon={<Icon name="download" size={18} />} onClick={() => toast("تنزيل", "جارٍ تنزيل الكشف بصيغة PDF")}>
            تنزيل PDF
          </Button>
        ) : s.state === "paid" ? null : (
          <>
            <Button onClick={() => url.push({ modal: "ag-pay", ref: s.id })}>تسجيل سداد</Button>
            {s.state === "overdue" ? (
              <Button variant="secondary" className="h-[50px]!" loading={remind.isPending} onClick={() => remind.mutate()}>
                تذكير
              </Button>
            ) : null}
          </>
        )
      }
    >
      {q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الكشف.</p>
      ) : !s || !pill ? (
        <>
          <Skeleton className="h-[90px] w-full rounded-[18px]" />
          <Skeleton className="h-[170px] w-full rounded-14" />
        </>
      ) : d ? (
        <>
          <Hero radius={16} icon="receipt" title={d.amountLabel} sub={d.heroSub} pill={<APill tone={pill.tone}>{pill.label}</APill>} />
          <DTile title="الكشف">
            <DKV k="الفترة">{d.rangeLabel}</DKV>
            <DKV k="الإصدار">{d.issued}</DKV>
            <DKV k="الاستحقاق">{d.dueLabel}</DKV>
            <DKV k="قبل الضريبة">{d.beforeVat}</DKV>
            <DKV k="ضريبة القيمة المضافة 15%">{d.vat}</DKV>
          </DTile>
          <DTile title="السداد">
            <DKV k="التاريخ">{d.paidOn}</DKV>
            <DKV k="الطريقة">{d.method}</DKV>
            <DKV k="المبلغ · شامل الضريبة">{d.amountLabel}</DKV>
          </DTile>
        </>
      ) : (
        <>
          <Hero icon="receipt" title={`${num(s.amount)} ر.س`} sub={`${s.agency} · يستحق ${arDate(s.due)}`} pill={<APill tone={pill.tone}>{pill.label}</APill>} />
          <DTile title="ملخص الكشف">
            <DKV k="الفترة">{s.periodFull}</DKV>
            <DKV k="طلبات الفترة">
              <button type="button" className="hover:underline" onClick={() => url.push({ inv: null, tab: "orders", ag: s.agency })}>
                حسب «الطلبات والقسائم»
              </button>
            </DKV>
            <DKV k="المبلغ شامل الضريبة">{num(s.amount)} ر.س</DKV>
            <DKV k="الاستحقاق">{arDate(s.due)}</DKV>
          </DTile>
          {s.state === "paid" && s.paid ? (
            <DTile title="السداد">
              <DKV k="سُدّد">
                {arDate(s.paid.on)} · {s.paid.method}
              </DKV>
              <DKV k="سجّله">{s.paid.by}</DKV>
            </DTile>
          ) : null}
        </>
      )}
    </Drawer>
  );
}
