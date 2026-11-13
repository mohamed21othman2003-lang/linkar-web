"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { FilterBar, SearchInput } from "@/components/panel/FilterBar";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { CITIES, PROVIDER_TABS, RATINGS, SORTS, TIERS, type Provider, type ProviderSort, type ProviderTab } from "@/lib/api/providers";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { ProviderDrawer } from "./ProviderDrawer";
import { ProviderOverlays } from "./ProviderOverlays";

// CON5-07 · مقدّمو الخدمة (3114-48542) وتبويباته: مراكز العناية (3114-50399) · المغاسل (3114-50449)
// · بانتظار الزيارة الميدانية (3114-50499) · موقوفة (3114-50549) — والقوائم CON5-07P (3260-261919 …)
// الرابط: /providers?tab=&city=&tier=&rating=&sort=&q= · الدرج ?provider=<id> · النوافذ ?modal=…&p=<id>
const TAB_LABEL: Record<ProviderTab, string> = {
  all: "الكل",
  care: "مراكز العناية",
  wash: "المغاسل",
  "pending-visit": "بانتظار الزيارة الميدانية",
  suspended: "موقوفة",
};

const all = (opts: readonly { value: string; label: string }[]) => [{ value: "", label: "الكل" }, ...opts];
const CITY_OPTS = all(CITIES.map((c) => ({ value: c, label: c })));
const TIER_OPTS = all(TIERS);
const RATING_OPTS = all(RATINGS);
// قيمة القائمة في Figma 13 SemiBold وحشو 12 يمين و10 شمال ومسافة 4
const FILTER = "gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold";

export function ProvidersView() {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const tab = (PROVIDER_TABS as readonly string[]).includes(url.get("tab") ?? "") ? (url.get("tab") as ProviderTab) : "all";
  const city = url.get("city") ?? "";
  const tier = url.get("tier") ?? "";
  const rating = url.get("rating") ?? "";
  const sort = (SORTS.some((s) => s.value === url.get("sort")) ? url.get("sort") : "top-selling") as ProviderSort;
  const q = url.get("q") ?? "";

  // البحث يتكتب محلياً ويتحدّث في الرابط بعد توقف الكتابة
  const [search, setSearch] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setSearch(q);
  }
  const { replace } = url;
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => replace({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [search, q, replace]);

  const list = useQuery({ queryKey: ["providers", { tab, city, tier, rating, sort, q }], queryFn: () => api.providers.list({ tab, city, tier, rating, sort: url.get("sort") ? sort : undefined, q }) });
  const kpis = useQuery({ queryKey: ["providers", "kpis"], queryFn: api.providers.kpis });
  const counts = list.data?.counts;
  const filtered = !!(city || tier || rating || q);
  const clear = () => {
    setSearch("");
    url.replace({ city: null, tier: null, rating: null, q: null, sort: null });
  };
  const pending = tab === "pending-visit";

  const columns = useMemo<Column<Provider>[]>(
    () => [
      {
        id: "provider",
        // في Figma العمود 300 وبعده 28 فاضية على اليمين
        header: <span className="ps-7">مقدّم الخدمة · الكود</span>,
        width: pending ? 276 : 328,
        cell: (p) => (
          <div className="flex flex-col gap-0.5 ps-7">
            <span className="text-13 leading-5 font-semibold text-ink">{p.name}</span>
            <bdi dir="ltr" className="text-end text-12 leading-[18px] font-light text-muted">
              {p.code}
            </bdi>
          </div>
        ),
      },
      { id: "branches", header: "الفروع", width: pending ? 304 : 402, cell: (p) => <p className="text-13 leading-5 font-normal">{p.branchesLine}</p> },
      { id: "services", header: "الخدمات", width: 70, cell: (p) => <Plain v={p.services == null ? null : num(p.services)} /> },
      { id: "bookings", header: "حجوزات 2026", width: 90, cell: (p) => <Plain v={p.bookings2026 == null ? null : num(p.bookings2026)} /> },
      {
        id: "rating",
        header: "التقييم",
        width: 110,
        cell: (p) =>
          p.rating == null ? (
            <Plain v={null} />
          ) : (
            <bdi dir="ltr" className="num block text-end text-13 leading-5 font-normal whitespace-nowrap">
              <span className="text-star">★</span> {num(p.rating, 1)} · {num(p.ratingCount ?? 0)}
            </bdi>
          ),
      },
      ...(pending
        ? [
            {
              id: "status",
              header: "الحالة",
              width: 150,
              cell: (p: Provider) => (
                <div className="flex flex-col items-start gap-1">
                  <span className="inline-flex h-[26px] items-center rounded-full bg-[#fdf3e1] px-2.5 text-12 font-medium whitespace-nowrap text-warning">بانتظار الزيارة الميدانية</span>
                  {p.visitLine ? <span className="text-[11px] leading-[19px] font-light text-muted">{p.visitLine}</span> : null}
                </div>
              ),
            },
          ]
        : []),
      {
        id: "actions",
        header: " ",
        width: 72,
        actions: true,
        cell: (p) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`تفاصيل ${p.name}`}
              title="التفاصيل"
              onClick={() => url.push({ provider: p.id, modal: null, p: null })}
              className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1"
            >
              <Icon name="info" size={16} />
            </button>
            {canEdit ? (
              <button
                type="button"
                aria-label={`إجراءات ${p.name}`}
                title="إجراءات"
                onClick={() => url.push({ modal: "actions", p: p.id, provider: null })}
                className="flex size-8 shrink-0 items-center justify-center gap-[3px] rounded-full border border-border bg-white hover:bg-surface-1"
              >
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1 rounded-full bg-ink" />
                ))}
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [pending, url, canEdit],
  );

  const addBtn = (
    <ButtonLink href="/providers/new?step=1" variant="accent" className="h-11! gap-1.5">
      إضافة مقدّم خدمة
      <Icon name="plus" size={16} />
    </ButtonLink>
  );

  return (
    <>
      <div className="-mt-2">
        <PageHead title="مقدّمو الخدمة" description="كل المنشآت على لينكار: علامتها التجارية وفروعها وخدماتها وأسعارها وحسابها البنكي." actions={canEdit ? addBtn : null} />
      </div>
      <KpiRow>
        <KpiCard label="منشآت معتمدة" icon="store" value={kpis.data ? num(kpis.data.approvedProviders) : "—"} loading={kpis.isLoading} />
        <KpiCard label="فروع معتمدة" icon="map-pin" value={kpis.data ? num(kpis.data.approvedBranches) : "—"} loading={kpis.isLoading} />
        <KpiCard label="بانتظار الزيارة الميدانية" icon="clock" value={kpis.data ? num(kpis.data.pendingVisit) : "—"} loading={kpis.isLoading} />
        <KpiCard label="تقييم العملاء" icon="star" value={kpis.data ? num(kpis.data.rating, 1) : "—"} loading={kpis.isLoading} />
      </KpiRow>
      <section className="flex flex-col gap-4 rounded-16 bg-white p-5">
        <Tabs
          variant="pill"
          label="تبويبات مقدّمي الخدمة"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "all" ? null : k })}
          items={PROVIDER_TABS.map((k) => ({ key: k, label: TAB_LABEL[k], count: counts?.[k] }))}
        />
        <FilterBar className="gap-2!" onClear={clear} canClear={filtered}>
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث باسم مقدّم الخدمة أو الكود" className="min-w-[240px] flex-1" iconEnd />
          <Select variant="filter" label="المدينة" value={city} options={CITY_OPTS} onChange={(v) => url.replace({ city: v || null })} className={FILTER} />
          <Select variant="filter" label="الفئة" value={tier} options={TIER_OPTS} onChange={(v) => url.replace({ tier: v || null })} className={FILTER} />
          <Select variant="filter" label="التقييم" value={rating} options={RATING_OPTS} onChange={(v) => url.replace({ rating: v || null })} className={FILTER} />
          <Select variant="filter" label="الترتيب" value={sort} options={SORTS} onChange={(v) => url.replace({ sort: v === "top-selling" ? null : v })} className={FILTER} />
        </FilterBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(p) => p.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={
            tab === "all"
              ? { title: "لا يوجد مقدّمو خدمة بعد", body: "أضف أول منشأة بفروعها وخدماتها ومستنداتها.", action: canEdit ? addBtn : null }
              : { title: "لا توجد منشآت في هذا التبويب", body: tab === "suspended" ? "لا توجد منشآت موقوفة حالياً." : tab === "pending-visit" ? "لا توجد منشآت بانتظار الزيارة الميدانية." : undefined }
          }
          onRowClick={(p) => url.push({ provider: p.id, modal: null, p: null })}
          rowLabel={(p) => `تفاصيل ${p.name}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
      </section>
      <ProviderDrawer />
      <ProviderOverlays />
    </>
  );
}

function Plain({ v }: { v: string | null }) {
  return <p className="num text-13 leading-5 font-normal">{v ?? "—"}</p>;
}
