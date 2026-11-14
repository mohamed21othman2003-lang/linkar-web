"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { PoVoucher } from "@/lib/api/agencies";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { APill, DKV, DTile, Hero, InfoBtn, Stats } from "./bits";

// CON5-09D · PO-2026-01488 (3114:2542) · 01406 (2756) · 01217 (2834) · 01403 (6657) · 01397 (6781) · 01392 (6887) · 01271 (7010)
// · 01259 (7133) · 01247 (7258) — درج طلب الشراء الكامل: إحصاءات + «الطلب» + جدول «العملاء والقسائم» (كل صف يفتح درج القسيمة CON5-09V)
// · 01190 (2959) · 01102 (2996) — الدرج المختصر (بطاقة «الطلب» بس). الرابط ?po=PO-…
export function PoDrawer() {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const id = url.get("po");
  const q = useQuery({ queryKey: ["agencies", "po", id], queryFn: () => api.agencies.order(id!), enabled: !!id, retry: false });
  const o = q.data;
  const send = useMutation({
    mutationFn: () => api.agencies.sendVouchers(id!),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("القسائم", r.toast);
    },
  });
  const columns = useMemo<Column<PoVoucher>[]>(
    () => [
      {
        id: "customer",
        header: "العميل",
        width: 190,
        cell: (x) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-[18px] font-semibold text-ink">{x.customer}</span>
            <bdi className="text-12 leading-5 font-light text-muted">{x.phone}</bdi>
          </div>
        ),
      },
      {
        id: "code",
        header: "القسيمة",
        width: 150,
        cell: (x) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-[18px] font-semibold text-ink">{x.code}</span>
            <span className="text-12 leading-5 font-light text-muted">{x.booking}</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "الحالة",
        width: 110,
        cell: (x) => (x.used ? <APill tone="success">مستخدمة</APill> : <span className="inline-flex h-[22px] items-center rounded-8 bg-warning-tint px-2 text-12 font-medium whitespace-nowrap text-[#9a6b00]">بانتظار الزيارة</span>),
      },
      { id: "actions", header: " ", width: 40, actions: true, cell: (x) => <InfoBtn label={`قسيمة ${x.booking}`} onClick={() => url.push({ voucher: x.booking })} /> },
    ],
    [url],
  );

  return (
    <Drawer
      open={!!id}
      onOpenChange={(v) => !v && url.replace({ po: null })}
      title={<bdi>{o?.id ?? id}</bdi>}
      subtitle={o ? (o.kind === "short" ? o.agency : `${o.agency} · ${o.dateLabel}`) : " "}
      footer={
        o?.kind === "full" ? (
          <>
            <Button loading={send.isPending} onClick={() => send.mutate()}>
              {o.id === "PO-2026-01488" && !o.sent ? "إرسال القسائم للعملاء" : "إعادة إرسال غير المستخدمة"}
            </Button>
            <Button variant="secondary" className="h-[50px]!" onClick={() => router.push(`/partners/agencies/${o.agencyId}?tab=vouchers`)}>
              القسائم والعملاء
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الطلب.</p>
      ) : !o ? (
        <>
          <Skeleton className="h-[88px] w-full rounded-16" />
          <Skeleton className="h-[94px] w-full rounded-12" />
          <Skeleton className="h-[200px] w-full rounded-12" />
        </>
      ) : (
        <>
          {o.kind === "short" ? (
            <Hero icon="qr" title={o.hero.title} sub={o.hero.sub} pill={<APill tone={o.hero.pillTone}>{o.hero.pill}</APill>} />
          ) : (
            <Hero radius={16} icon="qr" title={o.hero.title} sub={o.hero.sub} subClass="text-[#c9d1cd]" pill={<APill tone={o.hero.pillTone}>{o.hero.pill}</APill>} />
          )}
          {o.kind === "short" && o.short ? (
            <DTile title="الطلب">
              <DKV k="الخدمة والمركز">
                {o.short.service}
              </DKV>
              <DKV k="القسائم">
                {o.short.vouchers}
              </DKV>
              <DKV k="القيمة بسعر الوكالات · شامل الضريبة">
                {o.short.value}
              </DKV>
              <p className="text-13 leading-[22px] font-light text-muted">{o.short.note}</p>
            </DTile>
          ) : null}
          {o.kind === "short" ? (
            <Note>كل باقة تُصدر قسيمة برمز QR. يزور العميل المركز، ويتحقق المركز من القسيمة ويؤكد استخدامها.</Note>
          ) : (
            <>
              <Stats
                items={[
                  { label: "القسائم", value: o.vouchers === 1 ? "قسيمة واحدة" : `‏${o.vouchers} ${o.vouchers > 10 ? "قسيمة" : "قسائم"}` },
                  { label: "مستخدمة", value: String(o.list?.filter((x) => x.used).length ?? 0) },
                  { label: "القيمة · ر.س\nشامل الضريبة", value: num(o.value) },
                ]}
              />
              <DTile title="الطلب" gap={6} r12>
                <DKV k="التاريخ" pad>
                  {o.dateLabel}
                </DKV>
                <DKV k="فرع الوكالة والمندوب" pad>
                  {o.branchRep}
                </DKV>
                <DKV k="الدفع" pad>
                  {o.payment}
                </DKV>
                {o.lines?.map((l) => (
                  <DKV key={l.k} k={l.k} pad>
                    {l.v}
                  </DKV>
                ))}
              </DTile>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-16 leading-[26px] font-bold text-ink">العملاء والقسائم</h3>
                <p className="text-12 leading-5 font-light text-muted">{o.countLabel}</p>
              </div>
              <DataTable columns={columns} data={o.list} getRowId={(x) => x.code} onRowClick={(x) => url.push({ voucher: x.booking })} rowLabel={(x) => `${x.customer} · ${x.booking}`} edge={12} headRadius={10} rowPadY={12} rowClassName="border-divider" />
              {o.more ? <p className="text-12 leading-5 font-light text-muted">{o.more}</p> : null}
            </>
          )}
        </>
      )}
    </Drawer>
  );
}
