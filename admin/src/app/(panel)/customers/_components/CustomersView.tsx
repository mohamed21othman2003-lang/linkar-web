"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { ALL_COUNT, audienceName, BRANCH_OPTS, CENTER_OPTS, CITY_OPTS, maskPhone, PAGE_SIZE, SERVICE_OPTS, viewNote, type CustomerQuery, type CustomerRow, type Segment } from "@/lib/api/customers";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { BulkModals } from "./BulkModals";
import { Checkbox, Note, Pager, Plain, SegmentCard, selectedLabel, TwoLine } from "./bits";
import { CouponsView } from "./CouponsView";
import { CustomerDrawer } from "./CustomerDrawer";
import { FilterMenu, MenuFooterLink, MenuFooterNote } from "./FilterMenu";

// CON5-05 · العملاء (3114-16054) وحالاته: محدد 3 (3114-16842) · شريحة نشطون خلال 90 يوماً (3114-17243 / الكل محدد 3114-17484)
// · شريحة لديهم قسائم صالحة (3114-18196 / 3114-18470) · المركز جونسون (3114-18769 / 3114-19147) · الفرع جونسون الزهراء (3114-19554 / 3114-19793)
// · الخدمة نانو سيراميك (3114-20056 / 3114-20351) · قوائم الفلاتر CON5-05P (3114-20672 / 20711 / 20754 / 20787)
// الرابط: /customers?segment=&center=&branch=&service=&city=&q=&page= · الدرج ?customer=<id> · النوافذ ?modal=sms|push|gift|points|export
// · الكوبونات ?tab=coupons (CON5-05 · الكوبونات 3400:230073)
export function CustomersView() {
  const url = useUrlState();
  if (url.get("tab") === "coupons") return <CouponsView />;
  return <CustomersList />;
}

function CustomersList() {
  const url = useUrlState();
  const canEdit = useCan("customers", "edit");
  const segment = (["active", "vouchers"].includes(url.get("segment") ?? "") ? url.get("segment") : "all") as Segment;
  const center = url.get("center") ?? "";
  const branch = url.get("branch") ?? "";
  const service = url.get("service") ?? "";
  const city = url.get("city") ?? "";
  const q = url.get("q") ?? "";
  const page = Math.max(1, Number(url.get("page")) || 1);

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
    const t = setTimeout(() => replace({ q: search.trim() || null, page: null }), 300);
    return () => clearTimeout(t);
  }, [search, q, replace]);

  const query: CustomerQuery = { segment, center, branch, service, city, q, page };
  const list = useQuery({ queryKey: ["customers", "list", query], queryFn: () => api.customers.list(query) });
  const counts = list.data?.counts;
  const total = list.data?.total ?? 0;
  const items = list.data?.items;
  const filtered = !!(q || center || branch || service || city);
  const clear = () => {
    setSearch("");
    url.replace({ q: null, center: null, branch: null, service: null, city: null, page: null });
  };

  // التحديد: صفوف بعينها، أو «الكل» = كل عملاء العرض/الشريحة (CON5-05 · … · الكل محدد)
  const viewKey = JSON.stringify({ segment, center, branch, service, city, q });
  const [sel, setSel] = useState<{ key: string; ids: string[]; all: boolean }>({ key: viewKey, ids: [], all: false });
  const selection = sel.key === viewKey ? sel : { key: viewKey, ids: [], all: false };
  const pageIds = useMemo(() => items?.map((c) => c.id) ?? [], [items]);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selection.ids.includes(id));
  const toggle = (id: string, on: boolean) => setSel({ key: viewKey, all: false, ids: on ? [...selection.ids, id] : selection.ids.filter((x) => x !== id) });
  const toggleAll = (on: boolean) => setSel({ key: viewKey, all: on, ids: on ? pageIds : [] });
  const clearSel = () => setSel({ key: viewKey, ids: [], all: false });
  const selCount = selection.all ? total : selection.ids.length;
  const viewQuery: CustomerQuery = { segment, center, branch, service, city, q };

  const setSegment = (s: Segment) => url.replace({ segment: s === "all" ? null : s, page: null });
  const set = (k: string) => (v: string) => url.replace({ [k]: v || null, page: null });
  const openDrawer = (c: CustomerRow) => url.push({ customer: c.id, modal: null });

  const columns = useMemo<Column<CustomerRow>[]>(
    () => [
      {
        id: "sel",
        width: 36,
        header: <Checkbox label="تحديد الكل" checked={selection.all || allOnPage} indeterminate={!selection.all && !allOnPage && selection.ids.length > 0} onChange={(v) => toggleAll(v)} />,
        cell: (c) => <Checkbox label={`تحديد ${c.name}`} checked={selection.all || selection.ids.includes(c.id)} onChange={(v) => (selection.all ? setSel({ key: viewKey, all: false, ids: pageIds.filter((x) => x !== c.id) }) : toggle(c.id, v))} />,
      },
      { id: "name", header: "العميل", width: 180, cell: (c) => <TwoLine top={c.name} bottom={maskPhone(c.phone)} ltrBottom /> },
      { id: "city", header: "المدينة", width: 70, cell: (c) => <Plain>{c.city}</Plain> },
      { id: "top", header: "الأكثر طلباً", width: 236, cell: (c) => <TwoLine top={c.top.service} bottom={c.top.where} /> },
      { id: "bookings", header: "الحجوزات", width: 130, cell: (c) => <TwoLine top={num(c.bookings.count)} bottom={c.bookings.sub} /> },
      { id: "vouchers", header: "القسائم الصالحة", width: 170, cell: (c) => (c.vouchers ? <TwoLine top={num(c.vouchers.count)} bottom={c.vouchers.sub} /> : <Plain>—</Plain>) },
      { id: "points", header: "النقاط", width: 70, cell: (c) => <Plain>{num(c.points)}</Plain> },
      { id: "last", header: "آخر حجز", width: 130, cell: (c) => <Plain>{c.lastBooking}</Plain> },
      {
        id: "actions",
        header: " ",
        width: 48,
        actions: true,
        cell: (c) => (
          <button type="button" aria-label={`تفاصيل ${c.name}`} title="التفاصيل" onClick={() => openDrawer(c)} className="me-auto flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
            <Icon name="info" size={16} />
          </button>
        ),
      },
    ],
    [selection, allOnPage, pageIds, viewKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const note = viewNote(viewQuery);
  const branchOpt = BRANCH_OPTS.find((o) => o.value === branch);
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = from + (items?.length ?? 0) - 1;
  const selNames = selection.ids.map((id) => items?.find((c) => c.id === id)?.name).filter(Boolean) as string[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-24 font-bold text-ink">العملاء</h1>
          <p className="text-13 font-light text-muted">حسابات العملاء وشرائحهم ونقاطهم.</p>
        </div>
        <button type="button" onClick={() => url.push({ modal: "export", scope: null })} className="flex h-[46px] items-center gap-1.5 rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1">
          تصدير الكل
          <Icon name="download" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SegmentCard label="كل العملاء" icon="users" value={counts?.all ?? Number(ALL_COUNT.replace(",", ""))} active={segment === "all"} onClick={() => setSegment("all")} />
        <SegmentCard label="نشطون خلال 90 يوماً" icon="tag" value={counts?.active} active={segment === "active"} onClick={() => setSegment("active")} />
        <SegmentCard label="لديهم قسائم صالحة" icon="qr" value={counts?.vouchers} active={segment === "vouchers"} onClick={() => setSegment("vouchers")} />
        <SegmentCard label="الكوبونات" icon="gift" value={counts?.coupons} active={false} onClick={() => url.push({ tab: "coupons", segment: null, center: null, branch: null, service: null, city: null, q: null, page: null })} />
      </div>

      <section className="flex flex-col gap-3 rounded-16 border border-border bg-white px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم أو الجوال" className="h-10! w-full min-w-[240px] flex-1 [&_input]:text-13 [&_input]:placeholder:font-normal [&_input]:placeholder:text-[#9aa39f]" iconEnd />
          <FilterMenu label="المركز" value={center} options={CENTER_OPTS} allCount={ALL_COUNT} searchPlaceholder="ابحث باسم المركز" onChange={(v) => url.replace({ center: v || null, branch: null, page: null })} />
          <FilterMenu
            label="الفرع"
            value={branch}
            valueLabel={branchOpt?.label}
            options={BRANCH_OPTS}
            width={300}
            searchPlaceholder="ابحث باسم الفرع أو كوده"
            onChange={(v, o) => url.replace({ branch: v || null, center: v ? (o?.group ?? null) : center || null, page: null })}
            footer={<MenuFooterLink href="/branches">عرض كل الفروع (55)</MenuFooterLink>}
          />
          <FilterMenu label="الخدمة الأكثر طلباً" value={service} options={SERVICE_OPTS} allCount={ALL_COUNT} onChange={set("service")} footer={<MenuFooterNote>فئات الخدمات من البيانات المرجعية. الشريحة تضم من كانت أكثر حجوزاتهم من الفئة.</MenuFooterNote>} />
          <FilterMenu label="المدينة" value={city} options={CITY_OPTS} allCount={ALL_COUNT} width={240} onChange={set("city")} />
        </div>

        {note ? <Note>{note}</Note> : null}

        {selCount > 0 ? (
          <BulkBar
            title={selection.all ? (segment !== "all" || filtered ? `كل عملاء الشريحة محددون · ${num(total)} عميلاً` : `كل العملاء محددون · ${num(total)} عميلاً`) : selectedLabel(selCount)}
            sub={selection.all && (segment !== "all" || filtered) ? audienceName(viewQuery) : undefined}
            canEdit={canEdit}
            onOpen={(m) => url.push({ modal: m })}
            onExport={() => url.push({ modal: "export", scope: "selected" })}
            onClear={clearSel}
          />
        ) : null}

        <DataTable
          columns={columns}
          data={items}
          getRowId={(c) => c.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered || segment !== "all"}
          onClearFilters={() => {
            clear();
            setSegment("all");
          }}
          empty={{ title: "لا يوجد عملاء بعد" }}
          onRowClick={openDrawer}
          rowLabel={(c) => `تفاصيل ${c.name}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
        {list.isLoading ? <Skeleton className="h-8 w-40" /> : <Pager page={page} pages={Math.ceil(total / PAGE_SIZE)} from={from} to={to} total={total} onPage={(p) => url.replace({ page: p === 1 ? null : String(p) })} />}
      </section>

      <CustomerDrawer />
      <BulkModals audience={selection.all ? { kind: "view", query: viewQuery, total } : { kind: "selected", ids: selection.ids, names: selNames }} onDone={clearSel} />
      <ExportModal
        open={url.get("modal") === "export"}
        onOpenChange={(o) => !o && url.replace({ modal: null, scope: null })}
        module="العملاء"
        tab={url.get("scope") === "selected" ? "المحدد" : audienceName(viewQuery)}
        filters={Object.fromEntries(Object.entries({ segment, center, branch, service, city, q }).filter(([, v]) => v && v !== "all"))}
      />
    </>
  );
}

// شريط الإجراءات الجماعية (CON5-05 · محدد 3 3114:16842): كحلي r12 · حشو 8·16·8·10 · مسافة 8
// العدد 14 SemiBold أبيض (+ اسم الشريحة 12 Light #C9D1CD) · أزرار بيضا 34 r10 حشو 7·12 · «إلغاء التحديد» 13 Medium أخضر فاتح
function BulkBar({ title, sub, canEdit, onOpen, onExport, onClear }: { title: string; sub?: string; canEdit: boolean; onOpen: (m: string) => void; onExport: () => void; onClear: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-12 bg-ink py-2 ps-4 pe-2.5">
      <div className="flex min-w-0 flex-col">
        <p className="num text-14 leading-[22px] font-semibold text-white">{title}</p>
        {sub ? <p className="text-12 leading-[18px] font-light text-[#c9d1cd]">{sub}</p> : null}
      </div>
      <span className="hidden flex-1 md:block" />
      {canEdit ? (
        <>
          <BarBtn icon="message" onClick={() => onOpen("sms")}>
            رسالة نصية
          </BarBtn>
          <BarBtn icon="bell" onClick={() => onOpen("push")}>
            إشعار في التطبيق
          </BarBtn>
          <BarBtn icon="gift" onClick={() => onOpen("gift")}>
            كوبون أو هدية
          </BarBtn>
        </>
      ) : null}
      <BarBtn icon="download" onClick={onExport}>
        تصدير المحدد
      </BarBtn>
      <button type="button" onClick={onClear} className="px-0 text-13 leading-5 font-medium text-lime hover:underline">
        إلغاء التحديد
      </button>
    </div>
  );
}

function BarBtn({ icon, children, onClick }: { icon: UiGlyph; children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[34px] items-center gap-1.5 rounded-10 bg-white px-3 text-13 leading-5 font-medium text-ink hover:bg-surface-1">
      {children}
      <Icon name={icon} size={16} />
    </button>
  );
}
