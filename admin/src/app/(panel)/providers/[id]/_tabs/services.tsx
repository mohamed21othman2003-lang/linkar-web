"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { RowMenu, type RowMenuItem } from "@/components/panel/RowMenu";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CHANNEL_FILTERS, PRICE_FILTERS, SERVICE_SORTS, SERVICE_STATUS_FILTERS, WARRANTY_FILTERS, type ServiceRow } from "@/lib/api/services";
import { sizePrices } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import OffersTab from "./offers";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الخدمات والأسعار (3114-50957 · فرع الحمراء 3400-231034 · فرع المحمدية 3400-231438)
// + «موقوف» (CON5-07a · موقوف 3312-215143). الرابط: ?tab=services&view=all|services|offers|packages|paused&branch=&price=&status=&warranty=&channel=&sort=
// الشريط العلوي: شرائح النوع يمين (37 · r16 · حشو 6·14 · 13 Medium · #F1F3F2 / المختارة كحلي) وأزرار S ثانوية بـ+ شمال.
// الفلاتر (40 · r10 · «العنوان:» 13 Light + القيمة 13 SemiBold) ثم «مسح الفلاتر» شمال. الجدول: رأس 86 بصفّين #F4F6F5 r8 —
// «الفرع: …» فوق عمودي التكلفة والبيع (القسم 18.1: الافتراضي أول فرع والأسعار للفرع المختار) · صفوف حشو 10 بفاصل #D9DEDB.
// الأسعار الثلاثة في خلية واحدة «سيدان · متوسط · كبير» (القسم 2.4)، والهامش من المنتج الأول (سيدان).
const VIEWS = [
  { key: "all", label: "الكل" },
  { key: "services", label: "خدمات" },
  { key: "offers", label: "عروض" },
  { key: "packages", label: "باقات" },
  { key: "paused", label: "موقوف" },
] as const;
type View = (typeof VIEWS)[number]["key"];
const FILTER = "h-10! gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold";
const COLS = "grid-cols-[minmax(170px,1fr)_120px_170px_170px_70px_80px_100px_80px]";
const STATUS_PILL = {
  draft: ["مسودة", "neutral"],
  paused: ["موقوفة", "warning"],
  hidden: ["مخفية", "danger"],
} as const;
const marginText = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

export default function ServicesTab(props: ProfileTabProps) {
  const { profile, canEdit } = props;
  const url = useUrlState();
  const id = profile.provider.id;
  const v = url.get("view");
  const view: View = VIEWS.some((x) => x.key === v) ? (v as View) : "all";
  const f = {
    branch: url.get("branch") ?? "",
    price: url.get("price") ?? "",
    status: url.get("status") ?? "",
    warranty: url.get("warranty") ?? "",
    channel: url.get("channel") ?? "",
    sort: url.get("sort") ?? "popular",
  };
  const branches = useQuery({
    queryKey: ["providers", "branches", id],
    queryFn: () => api.profile.branches(id),
  });
  const list = useQuery({
    queryKey: ["providers", "services", id, view, f],
    queryFn: () =>
      api.services.list(id, {
        ...f,
        sort: f.sort,
        view: view === "paused" ? "paused" : "all",
      }),
    enabled: view !== "offers" && view !== "packages",
  });
  const approved = (branches.data ?? []).filter((b) => b.status === "approved");
  const branch = list.data?.branch || f.branch || approved[0]?.id;
  const filtered = !!(f.price || f.status || f.warranty || f.channel || url.get("sort"));
  const clear = () =>
    url.replace({
      price: null,
      status: null,
      warranty: null,
      channel: null,
      sort: null,
    });
  const open = (modal: string, s?: string) => url.push({ modal, s: s ?? null });
  const qc = useQueryClient();
  const toast = useToast();
  // إعادة نشر خدمة موقوفة/مخفية أو نشر مسودة (مش في Figma — لازم عشان الإيقاف يترجع)
  const resume = useMutation({
    mutationFn: (r: ServiceRow) => api.services.resume(r.id),
    onSuccess: (_x, r) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast("نُشرت الخدمة", r.status === "draft" ? `نُشرت ${r.name}` : `أُعيد نشر ${r.name}`);
    },
  });

  const chips = (
    <div role="tablist" aria-label="نوع العنصر" className="flex flex-wrap items-center gap-2">
      {VIEWS.map((x) => (
        <button
          key={x.key}
          type="button"
          role="tab"
          aria-selected={view === x.key}
          onClick={() => url.replace({ view: x.key === "all" ? null : x.key })}
          className={`h-[37px] rounded-16 px-3.5 text-13 leading-[25px] font-medium ${view === x.key ? "bg-ink text-white" : "bg-[#f1f3f2] text-ink hover:bg-surface-2"}`}
        >
          {x.label}
        </button>
      ))}
    </div>
  );

  if (view === "offers" || view === "packages") return <OffersTab {...props} kind={view} chips={chips} />;

  const rowMenu = (r: ServiceRow): RowMenuItem[] => [
    {
      label: "تعديل البيانات",
      icon: "edit",
      onSelect: () => open("service-edit", r.id),
    },
    r.status === "published"
      ? {
          label: "إيقاف مؤقت",
          icon: "clock",
          onSelect: () => open("service-pause", r.id),
        }
      : {
          label: r.status === "draft" ? "نشر الخدمة" : "إعادة نشر الخدمة",
          icon: "check",
          onSelect: () => resume.mutate(r),
        },
    {
      label: "حذف",
      icon: "trash",
      onSelect: () => open("service-delete", r.id),
    },
  ];
  const actions = (r: ServiceRow) => (
    <div className="flex items-center justify-start gap-2">
      <button
        type="button"
        aria-label={`تفاصيل ${r.name}`}
        title="التفاصيل"
        onClick={() => url.push({ service: r.id })}
        className="flex size-8 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1"
      >
        <Icon name="info" size={16} />
      </button>
      {canEdit ? <RowMenu items={rowMenu(r)} label={`إجراءات ${r.name}`} /> : null}
    </div>
  );
  const nameCell = (r: ServiceRow) => (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="font-semibold">{r.name}</span>
      {r.status !== "published" ? (
        <Pill size="S" tone={STATUS_PILL[r.status][1]}>
          {STATUS_PILL[r.status][0]}
        </Pill>
      ) : null}
    </span>
  );
  const branchSelect = (
    <Select
      variant="filter"
      label="الفرع"
      value={branch}
      onChange={(b) => url.replace({ branch: b })}
      options={approved.map((b) => ({ value: b.id, label: `فرع ${b.name}` }))}
      className="h-8! gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold"
    />
  );

  const rows = list.data?.items;
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
    if (view === "paused") return <p className="py-12 text-center text-13 leading-5 font-semibold text-muted">لا توجد خدمات أو عروض أو باقات موقوفة</p>;
    if (filtered)
      return (
        <EmptyState
          title="لا توجد نتائج"
          body="جرّب كلمة بحث أخرى أو غيّر الفلاتر."
          action={
            <Button variant="secondary" size="S" onClick={clear}>
              مسح الفلاتر
            </Button>
          }
        />
      );
    return (
      <EmptyState
        title="لا توجد خدمات بعد"
        body="أضف أول خدمة بمنتجاتها وأسعارها لكل فرع."
        action={
          canEdit ? (
            <Button variant="secondary" size="S" onClick={() => open("service-new")}>
              إضافة خدمة
            </Button>
          ) : undefined
        }
      />
    );
  };

  return (
    <>
      {view === "paused" ? (
        // CON5-07a · موقوف: أزرار M («باقة جديدة» ثانوي · «عرض جديد» مميز) شمال الشرائح
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {chips}
          {canEdit ? (
            <div className="flex flex-wrap gap-2.5">
              <Button variant="accent" className="h-11 px-4" icon={<Icon name="plus" size={16} />} onClick={() => open("offer-new")}>
                عرض جديد
              </Button>
              <Button variant="secondary" className="h-[46px] border-transparent! px-4" icon={<Icon name="plus" size={16} />} onClick={() => open("package-new")}>
                باقة جديدة
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {chips}
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="S" icon={<Icon name="plus" size={14} />} onClick={() => open("package-new")}>
                باقة جديدة
              </Button>
              <Button variant="secondary" size="S" icon={<Icon name="plus" size={14} />} onClick={() => open("offer-new")}>
                عرض جديد
              </Button>
              <Button variant="secondary" size="S" icon={<Icon name="plus" size={14} />} onClick={() => open("service-new")}>
                إضافة خدمة
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {view !== "paused" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select variant="filter" label="السعر" value={f.price} onChange={(x) => url.replace({ price: x || null })} options={PRICE_FILTERS} className={FILTER} />
            <Select variant="filter" label="الحالة" value={f.status} onChange={(x) => url.replace({ status: x || null })} options={SERVICE_STATUS_FILTERS} className={FILTER} />
            <Select variant="filter" label="الضمان" value={f.warranty} onChange={(x) => url.replace({ warranty: x || null })} options={WARRANTY_FILTERS} className={FILTER} />
            <Select variant="filter" label="القناة" value={f.channel} onChange={(x) => url.replace({ channel: x || null })} options={CHANNEL_FILTERS} className={FILTER} />
            <Select variant="filter" label="الترتيب" value={f.sort} onChange={(x) => url.replace({ sort: x === "popular" ? null : x })} options={SERVICE_SORTS} className={FILTER} />
          </div>
          <button type="button" onClick={clear} className="text-13 leading-5 font-medium text-success hover:underline">
            مسح الفلاتر
          </button>
        </div>
      ) : null}

      {view === "paused" && !list.isLoading && !rows?.length && !list.isError ? (
        <div className="rounded-16 bg-white p-5">{state()}</div>
      ) : (
        <>
          {/* أقل من md: كل خدمة كارت */}
          <div className="flex flex-col gap-2.5 md:hidden">
            <div className="flex items-center justify-between gap-2 rounded-12 bg-surface-1 px-3 py-2 text-12 font-medium text-muted">
              <span>الأسعار: سيدان · متوسط · كبير</span>
              {branchSelect}
            </div>
            {list.isLoading
              ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36 w-full rounded-12" />)
              : (state() ??
                rows?.map((r) => (
                  <div key={r.id} className="flex flex-col gap-2.5 rounded-12 border border-border bg-white p-3.5 text-13">
                    <div className="text-ink">{nameCell(r)}</div>
                    <dl className="flex flex-col gap-1.5 border-t border-divider pt-2.5">
                      {(
                        [
                          ["النوع", r.typeLabel],
                          ["سعر التكلفة", r.cost ? <bdi dir="ltr">{sizePrices(r.cost)}</bdi> : "—"],
                          ["سعر البيع", r.sale ? <bdi dir="ltr">{sizePrices(r.sale)}</bdi> : "—"],
                          ["الهامش", r.marginPct != null ? marginText(r.marginPct) : "—"],
                          ["الضمان", r.warrantyLabel],
                          ["مدة التنفيذ", r.durationShort],
                        ] as [string, ReactNode][]
                      ).map(([k, val]) => (
                        <div key={k} className="flex items-start justify-between gap-3">
                          <dt className="shrink-0 font-light text-muted">{k}</dt>
                          <dd className="num min-w-0 text-end text-ink">{val}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="border-t border-divider pt-2.5">{actions(r)}</div>
                  </div>
                )))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[1000px]" role="table" aria-label={`خدمات ${profile.provider.name}`}>
              <div role="row" className={`grid ${COLS} items-end gap-2 rounded-8 bg-surface-1 px-2.5 py-[9px] text-12 leading-[23px] font-medium text-muted`}>
                <span role="columnheader">الخدمة</span>
                <span role="columnheader">النوع</span>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <div className="flex">{branchSelect}</div>
                  <span aria-hidden className="h-px bg-border" />
                  <div className="grid grid-cols-2 gap-2">
                    <span role="columnheader">سعر التكلفة · س · م · ك</span>
                    <span role="columnheader">سعر البيع · س · م · ك</span>
                  </div>
                </div>
                <span role="columnheader">الهامش</span>
                <span role="columnheader">الضمان</span>
                <span role="columnheader">مدة التنفيذ</span>
                <span role="columnheader" className="sr-only">
                  إجراءات
                </span>
              </div>
              {list.isLoading
                ? Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="border-b border-border px-2.5 py-[18px]">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                : (state() ??
                  rows?.map((r) => (
                    <div key={r.id} role="row" className={`grid ${COLS} items-center gap-2 border-b border-border p-2.5 text-13 leading-[25px] text-ink`}>
                      <span role="cell">{nameCell(r)}</span>
                      <span role="cell">{r.typeLabel}</span>
                      <span role="cell" className="num">
                        {r.cost ? <bdi dir="ltr">{sizePrices(r.cost)}</bdi> : "—"}
                      </span>
                      <span role="cell" className="num">
                        {r.sale ? <bdi dir="ltr">{sizePrices(r.sale)}</bdi> : "—"}
                      </span>
                      <span role="cell" className="num">
                        {r.marginPct != null ? marginText(r.marginPct) : "—"}
                      </span>
                      <span role="cell">{r.warrantyLabel}</span>
                      <span role="cell">{r.durationShort}</span>
                      <span role="cell">{actions(r)}</span>
                    </div>
                  )))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
