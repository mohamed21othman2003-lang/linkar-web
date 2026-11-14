"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { RowMenu, type RowMenuItem } from "@/components/panel/RowMenu";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { OfferRow, OfferStatus } from "@/lib/api/offers";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { ConfirmOfferAction, OfferDrawer, PackageDrawer } from "../_components/offers/OfferDrawers";
import { OfferFormModal } from "../_components/offers/OfferForm";
import { PackageFormModal } from "../_components/offers/PackageForm";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · العروض والباقات (3127-3263) · الباقات (3312-213706)
// جوه تبويب «الخدمات والأسعار» من شرائح «عروض» و«باقات» (?tab=services&view=offers|packages) — تبويب الخدمات بيمرّر الشرائح `chips`.
// الشريط: الشرائح يمين و«عرض جديد» (M مميز · + 16) ثم «باقة جديدة» (M ثانوي · package 16) شمال.
// الجدول جوه بطاقة بيضا r16 · حشو 20: رأس 38 #F4F6F5 r10 (حشو 9·12 · 12 Medium رمادي) · صفوف 65 (حشو 12 · فاصل #E8ECEA)
// الأعمدة من اليمين: «العرض · المصدر» (العنوان 13 SemiBold + المصدر 12 Light) · الفرع 170 · الفترة 170 · الحجوزات 110 · الإجراءات (ⓘ 32 r10 + ⋯ 32).
// رأس الجدول في Figma عمود إجراءاته 44 والصفوف 72 — منقولة زي ما هي (العناوين مزاحة 28 عن القيم).
// ⋯ العرض: تعديل البيانات · إيقاف مؤقت · إيقاف دائم — ⋯ الباقة: تعديل البيانات · إيقاف مؤقت · حذف.
const HEAD = "grid-cols-[minmax(0,1fr)_170px_170px_110px_44px]";
const ROW = "grid-cols-[minmax(0,1fr)_170px_170px_110px_72px]";
const STATUS: Partial<Record<OfferStatus, [string, "neutral" | "warning" | "danger"]>> = {
  draft: ["مسودة", "neutral"],
  paused: ["موقوف", "warning"],
  stopped: ["متوقف نهائياً", "danger"],
};

export default function OffersTab({ profile, canEdit, kind, chips }: ProfileTabProps & { kind: "offers" | "packages"; chips: ReactNode }) {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  const pid = profile.provider.id;
  const list = useQuery({ queryKey: ["providers", "offers", pid, kind], queryFn: () => api.offers.list(pid, kind) });
  const rows = list.data?.items;
  const isPkg = kind === "packages";
  const open = (modal: string, o?: string) => url.push({ modal, o: o ?? null });
  const pause = useMutation({
    mutationFn: (r: OfferRow) => api.offers.setPaused(r.kind, r.id, r.status !== "paused"),
    onSuccess: (_x, r) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      const what = r.kind === "offer" ? "العرض" : "الباقة";
      const paused = r.status !== "paused";
      toast(paused ? `أُوقف${r.kind === "offer" ? "" : "ت"} ${what} مؤقتاً` : `أُعيد تفعيل ${what}`, paused ? `أُوقف ${r.title} مؤقتاً واختفى من الموقع والتطبيق` : `أُعيد تفعيل ${r.title}`);
    },
    onError: () => toast("تعذّر التنفيذ", "حدث خطأ، حاول مرة أخرى"),
  });

  const menu = (r: OfferRow): RowMenuItem[] => [
    { label: "تعديل البيانات", icon: "edit", onSelect: () => open(r.kind === "offer" ? "offer-edit" : "package-edit", r.id), disabled: r.status === "stopped" },
    r.status === "paused"
      ? { label: "إعادة تفعيل", icon: "check", onSelect: () => pause.mutate(r) }
      : { label: "إيقاف مؤقت", icon: "clock", onSelect: () => pause.mutate(r), disabled: r.status === "stopped" || r.status === "draft" },
    r.kind === "offer"
      ? { label: "إيقاف دائم", icon: "lock", onSelect: () => open("offer-stop", r.id), disabled: r.status === "stopped" }
      : { label: "حذف", icon: "trash", onSelect: () => open("package-delete", r.id) },
  ];
  const details = (r: OfferRow) => url.push(r.kind === "offer" ? { offer: r.id } : { package: r.id });
  const actions = (r: OfferRow) => (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        aria-label={`تفاصيل ${r.title}`}
        title="التفاصيل"
        onClick={() => details(r)}
        className="flex size-8 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1"
      >
        <Icon name="info" size={16} />
      </button>
      {canEdit ? <RowMenu items={menu(r)} label={`إجراءات ${r.title}`} /> : null}
    </div>
  );
  const title = (r: OfferRow) => (
    <span className="flex flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-1.5 text-13 leading-5 font-semibold text-ink">
        {r.title}
        {STATUS[r.status] ? (
          <Pill size="S" tone={STATUS[r.status]![1]}>
            {STATUS[r.status]![0]}
          </Pill>
        ) : null}
      </span>
      <span className="text-12 leading-[18px] font-light text-muted">{r.sub}</span>
    </span>
  );

  const state = (): ReactNode => {
    if (list.isError)
      return (
        <EmptyState
          title="تعذّر تحميل البيانات"
          body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
          action={
            <Button variant="secondary" size="S" onClick={() => list.refetch()}>
              إعادة المحاولة
            </Button>
          }
        />
      );
    if (!rows || rows.length) return null;
    return (
      <EmptyState
        title={isPkg ? "لا توجد باقات بعد" : "لا توجد عروض بعد"}
        body={isPkg ? "اجمع خدمتين أو أكثر في باقة بسعر أقل من حجزها منفردة." : "أنشئ عرضاً بخصم على خدمة أو أكثر لفروع محددة وفترة محددة."}
        action={
          canEdit ? (
            <Button variant="secondary" size="S" onClick={() => open(isPkg ? "package-new" : "offer-new")}>
              {isPkg ? "باقة جديدة" : "عرض جديد"}
            </Button>
          ) : undefined
        }
      />
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {chips}
        {canEdit ? (
          <div className="flex flex-wrap gap-2.5">
            <Button variant="accent" className="h-11 px-4" icon={<Icon name="plus" size={16} />} onClick={() => open("offer-new")}>
              عرض جديد
            </Button>
            <Button variant="secondary" className="h-[46px] px-4" icon={<Icon name="package" size={16} />} onClick={() => open("package-new")}>
              باقة جديدة
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-16 bg-white sm:p-5">
        {/* أقل من md: كل صف كارت */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {list.isLoading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 w-full rounded-12" />)
            : (state() ??
              rows?.map((r) => (
                <div key={r.id} className="flex flex-col gap-2.5 rounded-12 border border-border bg-white p-3.5 text-13">
                  {title(r)}
                  <dl className="flex flex-col gap-1.5 border-t border-divider pt-2.5">
                    {(
                      [
                        ["الفرع", r.branchLabel],
                        ["الفترة", <bdi key="p">{r.period}</bdi>],
                        ["الحجوزات", num(r.bookings)],
                      ] as [string, ReactNode][]
                    ).map(([k, val]) => (
                      <div key={k} className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 font-light text-muted">{k}</dt>
                        <dd className="num min-w-0 text-end text-ink">{val}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex justify-start border-t border-divider pt-2.5">{actions(r)}</div>
                </div>
              )))}
        </div>

        <div className="hidden md:block" role="table" aria-label={isPkg ? `باقات ${profile.provider.name}` : `عروض ${profile.provider.name}`}>
          <div role="row" className={`grid ${HEAD} rounded-10 bg-surface-1 px-3 py-[9px] text-12 leading-5 font-medium text-muted`}>
            <span role="columnheader">{isPkg ? "الباقة · المصدر" : "العرض · المصدر"}</span>
            <span role="columnheader">الفرع</span>
            <span role="columnheader">الفترة</span>
            <span role="columnheader">الحجوزات</span>
            <span role="columnheader" className="sr-only">
              إجراءات
            </span>
          </div>
          {list.isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="border-b border-divider px-3 py-[22px]">
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ))
            : (state() ??
              rows?.map((r) => (
                <div key={r.id} role="row" className={`grid ${ROW} items-center border-b border-divider p-3 text-13 leading-5 text-ink`}>
                  <span role="cell" className="min-w-0">
                    {title(r)}
                  </span>
                  <span role="cell">{r.branchLabel}</span>
                  <span role="cell">
                    <bdi>{r.period}</bdi>
                  </span>
                  <span role="cell" className="num">
                    {num(r.bookings)}
                  </span>
                  <span role="cell">{actions(r)}</span>
                </div>
              )))}
        </div>
      </div>
    </>
  );
}

/** نوافذ العروض والباقات ودروجها — بتتركّب مرة في ملف المزوّد (ProfileView):
 *  ?modal=offer-new | package-new | offer-edit | package-edit | offer-stop | package-delete &o=<id> · ?offer=<id> · ?package=<id> */
export function OffersOverlays({ profile }: { profile: ProfileTabProps["profile"] }) {
  const url = useUrlState();
  const modal = url.get("modal");
  const oid = url.get("o");
  const pid = profile.provider.id;
  const close = () => url.replace({ modal: null, o: null });
  const branches = useQuery({ queryKey: ["providers", "branches", pid], queryFn: () => api.profile.branches(pid) });
  const b = branches.data;
  const offer = useQuery({ queryKey: ["providers", "offer", oid], queryFn: () => api.offers.getOffer(oid!), enabled: !!oid && (modal === "offer-edit" || modal === "offer-stop") });
  const pkg = useQuery({ queryKey: ["providers", "package", oid], queryFn: () => api.offers.getPackage(oid!), enabled: !!oid && (modal === "package-edit" || modal === "package-delete") });
  const offerId = url.get("offer");
  const packageId = url.get("package");

  let node: ReactNode = null;
  if (b) {
    if (modal === "offer-new") node = <OfferFormModal profile={profile} branches={b} onClose={close} />;
    else if (modal === "package-new") node = <PackageFormModal profile={profile} branches={b} onClose={close} />;
    else if (modal === "offer-edit" && offer.data) node = <OfferFormModal key={offer.data.id} profile={profile} branches={b} offer={offer.data} onClose={close} />;
    else if (modal === "package-edit" && pkg.data) node = <PackageFormModal key={pkg.data.id} profile={profile} branches={b} pkg={pkg.data} onClose={close} />;
    else if (modal === "offer-stop" && offer.data) node = <ConfirmOfferAction kind="offer-stop" id={offer.data.id} name={offer.data.name} close={close} />;
    else if (modal === "package-delete" && pkg.data) node = <ConfirmOfferAction kind="package-delete" id={pkg.data.id} name={pkg.data.name} close={close} />;
  }
  return (
    <>
      {offerId && b ? <OfferDrawer id={offerId} profile={profile} branches={b} /> : null}
      {packageId && b ? <PackageDrawer id={packageId} profile={profile} branches={b} /> : null}
      {node}
    </>
  );
}
