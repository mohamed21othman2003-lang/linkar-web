"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { SearchInput } from "@/components/panel/FilterBar";
import { RowMenu } from "@/components/panel/RowMenu";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { couponsMutations, KIND_LABEL, STATUS_LABEL, type Coupon, type CouponStatus } from "@/lib/api/coupons";
import { ltrRuns } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { Pager, Plain, SegmentCard, TwoLine } from "./bits";
import { CreateCouponModal } from "./CreateCouponModal";

// CON5-05 · العملاء · الكوبونات (3400-230073) · بعد الإنشاء: OCT15 (3411-244519) · LINKAR20 (3411-245025) · REEM100 (3411-246524) · OCT15 كود واحد (3435-327105)
// الرابط: /customers?tab=coupons&q=&kind=&status= · الدرج ?coupon=<الكود> · الإنشاء ?modal=create-coupon
// قائمة ⋯ (Row menu «كوبون» / «كوبون منتهٍ»): نسخ الكود → CON5-05T نُسخ الكود (3411-247886) · إيقاف → CON5-05T أُوقف الكوبون (3411-247891)
const KINDS = [{ value: "", label: "الكل" }, ...Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))];
const STATUSES = [{ value: "", label: "الكل" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))];
const FILTER = "gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold";

export function CouponsView() {
  const url = useUrlState();
  const canEdit = useCan("customers", "edit");
  const toast = useToast();
  const qc = useQueryClient();
  const q = url.get("q") ?? "";
  const kind = url.get("kind") ?? "";
  const status = url.get("status") ?? "";

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

  const list = useQuery({ queryKey: ["coupons", "list", { q, kind, status }], queryFn: () => api.coupons.list({ q, kind, status }) });
  const customers = useQuery({ queryKey: ["customers", "list", { segment: "all", center: "", branch: "", service: "", city: "", q: "", page: 1 }], queryFn: () => api.customers.list({}) });
  const counts = customers.data?.counts;
  const filtered = !!(q || kind || status);
  const clear = () => {
    setSearch("");
    url.replace({ q: null, kind: null, status: null });
  };
  const stop = useMutation({
    mutationFn: (code: string) => couponsMutations.stop(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      toast("أُوقف الكوبون");
    },
  });
  const copy = (c: Coupon) => {
    navigator.clipboard?.writeText(c.code).catch(() => {});
    toast("نُسخ الكود");
  };
  const open = (c: Coupon) => url.push({ coupon: c.code, modal: null });
  const items = list.data?.items;
  const total = list.data?.total ?? 0;

  const columns: Column<Coupon>[] = [
    { id: "code", header: "الكود", width: 130, cell: (c) => <Plain>{c.display}</Plain> },
    { id: "kind", header: "النوع", width: 100, cell: (c) => <TwoLine top={KIND_LABEL[c.kind]} bottom={c.kindSub} /> },
    { id: "disc", header: "الخصم", width: 150, cell: (c) => <TwoLine top={c.discount} bottom={c.discountSub} /> },
    { id: "scope", header: "ينطبق على", width: 210, cell: (c) => <TwoLine top={c.scope} bottom={c.scopeSub} /> },
    { id: "valid", header: "الصلاحية", width: 170, cell: (c) => <Plain>{c.validity}</Plain> },
    { id: "sent", header: "أُرسل", width: 70, cell: (c) => <Plain>{c.sent}</Plain> },
    { id: "used", header: "استُخدم", width: 70, cell: (c) => <Plain>{c.used}</Plain> },
    { id: "status", header: "الحالة", width: 90, cell: (c) => <StatusPill s={c.status} /> },
    {
      id: "act",
      header: " ",
      width: 80,
      actions: true,
      cell: (c) => (
        <>
          <button type="button" aria-label={`تفاصيل ${c.code}`} title="التفاصيل" onClick={() => open(c)} className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
            <Icon name="info" size={16} />
          </button>
          <RowMenu
            label={`إجراءات ${c.code}`}
            items={[
              { label: "نسخ الكود", icon: "copy", onSelect: () => copy(c) },
              ...(canEdit && (c.status === "active" || c.status === "scheduled") ? [{ label: "إيقاف", icon: "x" as const, danger: true, onSelect: () => stop.mutate(c.code) }] : []),
            ]}
          />
        </>
      ),
    },
  ];

  const reset = { tab: null, q: null, kind: null, status: null, coupon: null };
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-24 font-bold text-ink">العملاء</h1>
          <p className="text-13 font-light text-muted">حسابات العملاء وشرائحهم ونقاطهم.</p>
        </div>
        {canEdit ? (
          <button type="button" onClick={() => url.push({ modal: "create-coupon", kind: null })} className="flex h-11 items-center gap-1.5 rounded-12 bg-lime px-4 text-14 font-medium text-ink hover:bg-lime/85">
            إنشاء كوبون
            <Icon name="plus" size={16} />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SegmentCard label="كل العملاء" icon="users" value={counts?.all} active={false} onClick={() => url.push(reset)} />
        <SegmentCard label="نشطون خلال 90 يوماً" icon="tag" value={counts?.active} active={false} onClick={() => url.push({ ...reset, segment: "active" })} />
        <SegmentCard label="لديهم قسائم صالحة" icon="qr" value={counts?.vouchers} active={false} onClick={() => url.push({ ...reset, segment: "vouchers" })} />
        <SegmentCard label="الكوبونات" icon="gift" value={list.data?.counts.all} active onClick={() => clear()} />
      </div>

      <section className="flex flex-col gap-3 rounded-16 border border-border bg-white px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالكود أو رقم الجوال" className="h-10! w-full min-w-[240px] flex-1 [&_input]:text-13 [&_input]:placeholder:font-normal [&_input]:placeholder:text-[#9aa39f]" iconEnd />
          <Select variant="filter" label="النوع" value={kind} options={KINDS} onChange={(v) => url.replace({ kind: v || null })} className={FILTER} />
          <Select variant="filter" label="الحالة" value={status} options={STATUSES} onChange={(v) => url.replace({ status: v || null })} className={FILTER} />
        </div>
        <DataTable
          columns={columns}
          data={items}
          getRowId={(c) => c.code}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={{ title: "لا توجد كوبونات بعد" }}
          onRowClick={open}
          rowLabel={(c) => `تفاصيل ${c.code}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
        {list.isLoading ? <Skeleton className="h-8 w-40" /> : <Pager page={1} pages={1} from={total ? 1 : 0} to={total} total={total} onPage={() => {}} forceOne />}
      </section>

      <CouponDrawer />
      <CreateCouponModal />
    </>
  );
}

// شارة الحالة: 22 · r8 · حشو 1·8 · 12/20 Medium
const PILL: Record<CouponStatus, string> = {
  active: "bg-success-tint text-success",
  scheduled: "bg-info-tint text-info",
  expired: "bg-surface-2 text-ink",
  stopped: "bg-[#fbeaea] text-danger",
};
function StatusPill({ s }: { s: CouponStatus }) {
  return <span className={`inline-flex h-[22px] items-center rounded-8 px-2 text-12 leading-5 font-medium whitespace-nowrap ${PILL[s]}`}>{STATUS_LABEL[s]}</span>;
}

// ───────────── CON5-05D · كوبون (JOIN100 3411-248268 · MOHD150 3411-248431 · WELCOME10 3411-248508 · NANO15 3411-248577 · PPF500 3411-248646
// · WATANI96 3411-248778 · OCT15 3411-248847 · LINKAR20 3411-249004 · REEM100 3411-249077 · OCT15 كود واحد 3435-327385) ─────────────
// العنوان 18/30 Regular + سطر 13/22 · بطاقة كحلي r18 (أيقونة 48 خضرا r14 + الخصم 13/22 أبيض 70% + الحالة) · «الإعدادات» · «الاستخدام» (أرقام الجوال)
function CouponDrawer() {
  const url = useUrlState();
  const code = url.get("coupon");
  const q = useQuery({ queryKey: ["coupons", "one", code], queryFn: () => api.coupons.get(code!), enabled: !!code });
  const c = q.data;
  return (
    <Drawer
      open={!!code}
      onOpenChange={(o) => !o && url.replace({ coupon: null })}
      title={<span className="font-normal">{c ? ltrRuns(c.display) : code}</span>}
      subtitle={c?.headSub}
    >
      {q.isLoading ? (
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-[84px] w-full rounded-[18px]" />
          <Skeleton className="h-60 w-full rounded-14" />
        </div>
      ) : q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الكوبون</p>
      ) : c ? (
        <>
          <div className="flex items-center gap-3.5 rounded-[18px] bg-ink p-[18px]">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-lime text-ink">
              <Icon name="gift" size={22} />
            </span>
            <p className="num min-w-0 flex-1 text-13 leading-[22px] font-light text-white/70">{ltrRuns(c.hero)}</p>
            <StatusPill s={c.status} />
          </div>
          <section className="flex flex-col gap-2 rounded-14 border border-border p-3.5">
            <h3 className="text-12 leading-5 font-medium text-muted">الإعدادات</h3>
            {c.settings.map((r) => (
              <div key={r.k} className="flex items-start justify-between gap-2 text-13 leading-[22px]">
                <span className="shrink-0 font-light text-muted">{r.k}</span>
                <span className="num min-w-0 text-end font-medium text-ink">{ltrRuns(r.v)}</span>
              </div>
            ))}
          </section>
          {c.usage ? (
            <section className="flex flex-col gap-2 rounded-14 border border-border p-3.5">
              <h3 className="num text-12 leading-5 font-medium text-muted">{c.usage.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] table-fixed text-start">
                  <colgroup>
                    <col style={{ width: 128 }} />
                    <col style={{ width: 138 }} />
                    <col style={{ width: 138 }} />
                    <col style={{ width: 110 }} />
                  </colgroup>
                  <thead>
                    <tr className="text-12 leading-[22px] font-medium text-muted">
                      <th className="pb-2 text-start font-medium">رقم الجوال</th>
                      <th className="pb-2 text-start font-medium">أُرسل</th>
                      <th className="pb-2 text-start font-medium">استُخدم</th>
                      <th className="pb-2 text-start font-medium">رقم الحجز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.usage.rows.map((r) => (
                      <tr key={r.phone} className="num text-13 leading-[22px] text-ink">
                        <td className="pb-2">
                          <bdi dir="ltr">{r.phone}</bdi>
                        </td>
                        <td className="pb-2">{r.sent}</td>
                        <td className="pb-2">{r.used}</td>
                        <td className="pb-2">{r.booking}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="num text-12 leading-5 font-light text-muted">{c.usage.footer}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
