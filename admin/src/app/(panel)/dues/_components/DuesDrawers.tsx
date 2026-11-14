"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DCard, DKV, FootBtn, Head2, NavyHero, Pill, WarnNote } from "@/components/finance/bits";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CLAIM_STATUS, type Block, type DrawerDoc, type Two } from "@/lib/api/dues";
import { useUrlState } from "@/lib/use-url-state";

// أدراج مستحقات المزوّدين:
// CON5-14D · كشف <المزوّد> · أكتوبر: جونسون (3114:72303) · لومار (72474) · XPEL (72560) · نانو شيلد (72646) · درع (72761) · لمعة (72842) · الريم (72924) · الندى (72967)
// CON5-14D · TRF-2026-10-0062…0067 (73010…73220) · TRF-2026-09-0048 (73262)
// CON5-14C · مراجعة المطالبة CL-2026-0010 (73388) · CL-2026-0013 (73485)

/** هيكل الدرج + حالات التحميل والخطأ */
function Shell({ open, onClose, doc, loading, error, retry, footer, children }: { open: boolean; onClose: () => void; doc?: DrawerDoc; loading: boolean; error: boolean; retry: () => void; footer?: ReactNode; children?: ReactNode }) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title={doc?.title ?? (error ? "تعذّر التحميل" : "…")} subtitle={doc?.subtitle} tight footerClassName="sm:pb-6!" footer={doc ? footer : undefined}>
      {loading ? (
        <>
          <Skeleton className="h-[112px] w-full rounded-16" />
          <Skeleton className="h-[204px] w-full rounded-14" />
        </>
      ) : error ? (
        <p className="py-10 text-center text-13 text-muted">
          تعذّر التحميل.{" "}
          <button type="button" className="font-medium text-ink underline" onClick={retry}>
            إعادة المحاولة
          </button>
        </p>
      ) : doc ? (
        <>
          {doc.hero ? <NavyHero title={doc.hero.title} pill={<Pill tone={doc.hero.tone}>{doc.hero.pill}</Pill>} lines={doc.hero.lines} gap={8} /> : null}
          {children}
          {doc.blocks.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}
        </>
      ) : null}
    </Drawer>
  );
}

function BlockView({ b }: { b: Block }) {
  const router = useRouter();
  const toast = useToast();
  switch (b.kind) {
    case "kv":
      return (
        <DCard title={b.title} variant="tile">
          {b.rows.map(([k, v, s]) => (
            <DKV key={k} k={k} valueClassName={s === "success" ? "text-success" : s === "bold" ? "font-bold! text-ink" : undefined}>
              {v}
            </DKV>
          ))}
        </DCard>
      );
    case "table":
      return (
        <DCard title={b.title} variant="tile">
          <MiniTable cols={b.cols} rows={b.rows} />
        </DCard>
      );
    case "link":
      return (
        <button
          type="button"
          onClick={() => (b.href ? router.push(b.href) : toast("تنزيل", `جاري تجهيز «${b.label}»`))}
          className="flex min-h-[46px] items-center gap-2 rounded-12 border border-border bg-white px-3.5 py-3 text-start hover:bg-surface-1"
        >
          <span className="min-w-0 flex-1 text-13 leading-5 font-medium text-ink">{b.label}</span>
          <Icon name="chevron-left" size={16} className="shrink-0 text-ink" />
        </button>
      );
    case "note":
      return <WarnNote>{b.text}</WarnNote>;
    case "status":
      return <Pill tone={b.tone}>{b.label}</Pill>;
  }
}

/** جدول صغير جوه البطاقة: رأس 38/58 #F4F6F5 r10 حشو 9·12 · صفوف حشو 12 بفاصل #E8ECEA */
function MiniTable({ cols, rows }: { cols: { h: string; h2?: string; w: number }[]; rows: (string | Two)[][] }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[514px]">
        <div className="flex rounded-10 bg-surface-1 px-3 py-[9px] text-12 leading-5 font-medium text-muted">
          {cols.map((c) => (
            <span key={c.h} className="shrink-0" style={{ width: c.w }}>
              {c.h2 ? <Head2 a={c.h} b={c.h2} /> : c.h}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center border-b border-divider p-3">
            {r.map((v, j) => (
              <span key={j} className="shrink-0" style={{ width: cols[j].w }}>
                {typeof v === "string" ? (
                  <span className="block text-13 leading-5 font-normal text-ink">{v}</span>
                ) : (
                  <span className="flex flex-col gap-0.5">
                    <span className="text-13 leading-5 font-semibold text-ink">{v.main}</span>
                    <span className="text-12 leading-[18px] font-light text-muted">{v.sub}</span>
                  </span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────── كشف المزوّد ─────────────
export function StatementDrawer() {
  const url = useUrlState();
  const toast = useToast();
  const id = url.get("provider");
  const isModal = !!url.get("modal");
  const q = useQuery({ queryKey: ["dues", "statement", id], queryFn: () => api.dues.statement(id!), enabled: !!id });
  const dl = useMutation({ mutationFn: () => api.dues.download(`statement-${id}`), onSuccess: () => toast("تحميل الكشف", "جاري تجهيز الكشف وسيبدأ التنزيل خلال لحظات") });
  const s = q.data;
  const close = () => url.replace({ provider: null, period: null });
  const footer =
    s?.footer === "close" ? (
      <div className="flex items-center">
        <FootBtn variant="secondary" onClick={close}>
          إغلاق
        </FootBtn>
      </div>
    ) : s ? (
      <div className="flex flex-wrap items-center gap-2.5">
        <FootBtn variant="secondary" onClick={() => url.push({ modal: "deduction", provider: s.providerId })}>
          إضافة خصم أو تسوية
        </FootBtn>
        {s.canTransfer ? (
          <FootBtn variant="primary" onClick={() => url.push({ modal: "transfer", provider: s.providerId })}>
            تحويل المستحق
          </FootBtn>
        ) : null}
        <span className="hidden flex-1 sm:block" />
        <FootBtn variant="secondary" icon="download" loading={dl.isPending} onClick={() => dl.mutate()}>
          تحميل الكشف
        </FootBtn>
      </div>
    ) : null;
  // الكشف بيفضل مفتوح تحت نافذة «إضافة خصم» / «تحويل» (?provider= مشترك بينهم)
  return <Shell open={!!id && !isModal} onClose={close} doc={s} loading={q.isLoading} error={q.isError} retry={() => q.refetch()} footer={footer} />;
}

// ───────────── تفاصيل التحويل ─────────────
export function TransferDrawer() {
  const url = useUrlState();
  const id = url.get("transfer");
  const q = useQuery({ queryKey: ["dues", "transfer", id], queryFn: () => api.dues.transfer(id!), enabled: !!id });
  const close = () => url.replace({ transfer: null });
  const footer = (
    <div className="flex items-center">
      <FootBtn variant="secondary" onClick={close}>
        إغلاق
      </FootBtn>
    </div>
  );
  return <Shell open={!!id} onClose={close} doc={q.data} loading={q.isLoading} error={q.isError} retry={() => q.refetch()} footer={footer} />;
}

// ───────────── مراجعة المطالبة (CON5-14C) ─────────────
export function ClaimDrawer() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const id = url.get("claim");
  const modal = url.get("modal");
  const q = useQuery({ queryKey: ["dues", "claim", id], queryFn: () => api.dues.claim(id!), enabled: !!id });
  const approve = useMutation({
    mutationFn: () => api.dues.approveClaim(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dues"] });
      toast("اعتُمدت المطالبة", `اعتُمدت المطالبة ${id} · جاهزة للتحويل`);
      url.replace({ claim: null, tab: "claims" });
    },
  });
  const c = q.data?.claim;
  const st = c ? CLAIM_STATUS[c.status] : undefined;
  const close = () => url.replace({ claim: null });
  const footer =
    c?.status === "review" ? (
      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => url.push({ modal: "claim-reject" })} className="h-11 rounded-12 px-4 text-14 font-medium text-danger hover:bg-[#fbeaea]">
          رفض
        </button>
        <FootBtn variant="accent" icon="check" loading={approve.isPending} onClick={() => approve.mutate()}>
          اعتماد المطالبة
        </FootBtn>
        <span className="hidden flex-1 sm:block" />
        <FootBtn variant="secondary" icon="edit" onClick={() => url.push({ modal: "claim-edit" })}>
          طلب تعديل
        </FootBtn>
      </div>
    ) : (
      <div className="flex items-center gap-2.5">
        {c?.status === "approved" ? (
          <FootBtn variant="primary" onClick={() => url.push({ modal: "transfer", provider: c.providerId, claim: null })}>
            تحويل
          </FootBtn>
        ) : null}
        <FootBtn variant="secondary" onClick={close}>
          إغلاق
        </FootBtn>
      </div>
    );
  return (
    <Shell open={!!id && !modal?.startsWith("claim-")} onClose={close} doc={q.data} loading={q.isLoading} error={q.isError} retry={() => q.refetch()} footer={footer}>
      {st ? (
        <div className="flex">
          <Pill tone={st.tone}>{st.label}</Pill>
        </div>
      ) : null}
    </Shell>
  );
}
