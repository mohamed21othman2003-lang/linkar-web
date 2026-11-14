"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { SearchInput } from "@/components/panel/FilterBar";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { CITIES, CONTACT_TYPES, PAGE_SIZE, type ContactMessage, type CorpRequest, type Message, type MsgTab, type Suggestion } from "@/lib/api/messages";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { InfoBtn, MsgKpi, MsgPager, ReplyBtn, StatusCell, TwoLine } from "./bits";
import { MessageDrawer } from "./MessageDrawer";
import { MessageModals } from "./MessageModals";

// CON5-19 · الرسائل (3114:1328) وتبويباته: المقترحات (3114:2061) · برامج الشركات (3114:2105)
// الرابط: /messages?tab=suggestions|corp&status=&type=&city=&q=&page= · الدرج ?message=<MSG|SG|CORP> · النوافذ ?modal=msg-reply|msg-transfer|msg-nominate&ref=<id>
const TABS: { key: MsgTab; label: string }[] = [
  { key: "contact", label: "تواصل معنا" },
  { key: "suggestions", label: "المقترحات" },
  { key: "corp", label: "برامج الشركات" },
];
const STATUS_OPTS: Record<MsgTab, { value: string; label: string }[]> = {
  contact: [
    { value: "all", label: "الكل" },
    { value: "new", label: "جديد" },
    { value: "answered", label: "تم الرد" },
  ],
  suggestions: [
    { value: "all", label: "الكل" },
    { value: "new", label: "جديد" },
    { value: "review", label: "قيد الدراسة" },
    { value: "answered", label: "تم الرد" },
  ],
  corp: [
    { value: "all", label: "الكل" },
    { value: "new", label: "جديد" },
    { value: "contacted", label: "تم التواصل" },
  ],
};
const TYPE_OPTS = [{ value: "all", label: "الكل" }, ...CONTACT_TYPES.map((t) => ({ value: t, label: t }))];
const CITY_OPTS = [{ value: "all", label: "الكل" }, ...CITIES.map((t) => ({ value: t, label: t }))];
const SEARCH: Record<MsgTab, string> = { contact: "ابحث بالاسم أو الجوال أو رقم الحجز", suggestions: "ابحث في المقترحات", corp: "ابحث باسم الشركة" };
const EMPTY: Record<MsgTab, string> = { contact: "لا توجد رسائل", suggestions: "لا توجد مقترحات", corp: "لا توجد طلبات شركات" };

export function MessagesView() {
  const url = useUrlState();
  const tab = (["suggestions", "corp"].includes(url.get("tab") ?? "") ? url.get("tab") : "contact") as MsgTab;
  const status = url.get("status") ?? "all";
  const type = url.get("type") ?? "all";
  const city = url.get("city") ?? "all";
  const q = url.get("q") ?? "";
  const page = Math.max(1, Number(url.get("page")) || 1);
  const [exportOpen, setExportOpen] = useState(false);

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

  const kpis = useQuery({ queryKey: ["messages", "kpis"], queryFn: () => api.messages.kpis() });
  const list = useQuery({ queryKey: ["messages", "list", { tab, status, type, city, q, page }], queryFn: () => api.messages.list({ tab, status, type, city, q, page }) });
  const counts = list.data?.counts;
  const total = list.data?.total ?? 0;
  const filtered = status !== "all" || (tab === "contact" && type !== "all") || (tab === "corp" && city !== "all") || !!q;
  const clear = () => url.replace({ status: null, type: null, city: null, q: null, page: null });

  const columns = useMemo(() => {
    const open = (id: string) => url.push({ message: id });
    const modal = (m: string, id: string) => url.push({ modal: m, ref: id });
    if (tab === "contact")
      return [
        { id: "id", header: "الرسالة", width: 80, cell: (r: ContactMessage) => <bdi className="text-13 font-medium">{r.id}</bdi> },
        { id: "from", header: "المرسل", width: 130, cell: (r: ContactMessage) => <TwoLine main={r.name} sub={<bdi dir="ltr">{r.phone}</bdi>} /> },
        { id: "type", header: "النوع", width: 110, cell: (r: ContactMessage) => r.type },
        { id: "subject", header: "الموضوع", width: 334, cell: (r: ContactMessage) => <TwoLine main={ltrRuns(r.subject)} sub={r.subjectNote ? ltrRuns(r.subjectNote) : undefined} /> },
        { id: "date", header: "التاريخ", width: 120, cell: (r: ContactMessage) => r.date },
        { id: "status", header: "الحالة", width: 130, cell: (r: ContactMessage) => <StatusCell status={r.status} note={r.statusNote} /> },
        {
          id: "actions",
          header: " ",
          width: 110,
          actions: true,
          cell: (r: ContactMessage) => (
            <>
              <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => open(r.id)} />
              {r.status === "new" ? <ReplyBtn onClick={() => modal("msg-reply", r.id)} /> : null}
            </>
          ),
        },
      ] satisfies Column<ContactMessage>[];
    if (tab === "suggestions")
      return [
        { id: "id", header: "المقترح", width: 80, cell: (r: Suggestion) => <bdi className="text-13 font-medium">{r.id}</bdi> },
        { id: "name", header: "العميل", width: 130, cell: (r: Suggestion) => <TwoLine main={r.name} /> },
        { id: "text", header: "نص المقترح", width: 384, cell: (r: Suggestion) => <TwoLine main={r.text} /> },
        { id: "date", header: "التاريخ", width: 130, cell: (r: Suggestion) => r.date },
        { id: "status", header: "الحالة", width: 190, cell: (r: Suggestion) => <StatusCell status={r.status} note={r.statusNote} /> },
        {
          id: "actions",
          header: " ",
          width: 110,
          actions: true,
          cell: (r: Suggestion) => (
            <>
              <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => open(r.id)} />
              {r.status !== "answered" ? <ReplyBtn outline={r.status === "review"} onClick={() => modal("msg-reply", r.id)} /> : null}
            </>
          ),
        },
      ] satisfies Column<Suggestion>[];
    return [
      { id: "id", header: "الطلب", width: 90, cell: (r: CorpRequest) => <bdi className="text-13 font-medium">{r.id}</bdi> },
      { id: "company", header: "الشركة والمسؤول", width: 214, cell: (r: CorpRequest) => <TwoLine main={r.company} sub={ltrRuns(`${r.contact} · ${r.phone}`)} /> },
      { id: "cars", header: "السيارات", width: 80, cell: (r: CorpRequest) => <span className="num">{num(r.cars)}</span> },
      { id: "cities", header: "المدن", width: 110, cell: (r: CorpRequest) => r.cities.join(" · ") },
      { id: "need", header: "الاحتياج", width: 220, cell: (r: CorpRequest) => <TwoLine main={r.need} /> },
      { id: "status", header: "الحالة", width: 150, cell: (r: CorpRequest) => <StatusCell status={r.status} note={r.statusNote} /> },
      {
        id: "actions",
        header: " ",
        width: 150,
        actions: true,
        cell: (r: CorpRequest) => (
          <>
            <InfoBtn label={`تفاصيل ${r.id}`} onClick={() => open(r.id)} />
            {r.status === "new" ? <ReplyBtn label="ترشيح مراكز" onClick={() => modal("msg-nominate", r.id)} /> : null}
          </>
        ),
      },
    ] satisfies Column<CorpRequest>[];
  }, [tab, url]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const footer =
    tab === "contact"
      ? total
        ? `عرض ${num((page - 1) * PAGE_SIZE + 1)} – ${num(Math.min(page * PAGE_SIZE, total))} من ${num(total)} هذا الشهر`
        : ""
      : tab === "suggestions"
        ? "من حساب العميل «الشكاوى والمقترحات ← اقتراح لتحسين لينكار»"
        : "من صفحة «برامج الشركات» · لينكار ترشّح مراكز معتمدة قريبة من مواقع الشركة";

  const k = kpis.data;
  return (
    <>
      <PageHead
        title="الرسائل"
        description="ما يصل من الموقع والتطبيق: نموذج «تواصل معنا»، مقترحات العملاء، وطلبات برامج الشركات."
        actions={
          <Button variant="secondary" icon={<Icon name="download" size={18} />} onClick={() => setExportOpen(true)}>
            تصدير
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MsgKpi label="رسائل جديدة" icon="mail" loading={!k} value={k ? num(k.newMessages.value) : "—"} hint={k?.newMessages.hint ?? " "} hintClassName="text-pending" />
        <MsgKpi label="متوسط زمن الرد" icon="clock" loading={!k} value={k?.responseTime.value ?? "—"} hint={k?.responseTime.hint ?? " "} />
        <MsgKpi label="مقترحات هذا الشهر" icon="star" loading={!k} value={k ? num(k.suggestions.value) : "—"} hint={k?.suggestions.hint ?? " "} />
        <MsgKpi label="طلبات الشركات" icon="car" loading={!k} value={k ? num(k.corp.value) : "—"} hint={k?.corp.hint ?? " "} />
      </div>
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
        <Tabs label="مصدر الرسالة" value={tab} onChange={(t) => url.replace({ tab: t === "contact" ? null : t, status: null, type: null, city: null, q: null, page: null })} items={TABS.map((t) => ({ ...t, count: counts?.[t.key] }))} />
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput value={search} onChange={setSearch} placeholder={SEARCH[tab]} />
          {tab === "contact" ? <Select variant="filter" label="النوع" value={type} options={TYPE_OPTS} onChange={(v) => url.replace({ type: v === "all" ? null : v, page: null })} /> : null}
          {tab === "corp" ? <Select variant="filter" label="المدينة" value={city} options={CITY_OPTS} onChange={(v) => url.replace({ city: v === "all" ? null : v })} /> : null}
          <Select variant="filter" label="الحالة" value={status} options={STATUS_OPTS[tab]} onChange={(v) => url.replace({ status: v === "all" ? null : v, page: null })} />
        </div>
        <DataTable<Message>
          key={tab}
          columns={columns as unknown as Column<Message>[]}
          data={list.data?.items}
          getRowId={(r) => r.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={{ title: EMPTY[tab] }}
          onRowClick={(r) => url.push({ message: r.id })}
          rowLabel={(r) => r.id}
          skeletonRows={tab === "contact" ? 6 : 4}
        />
        {list.data && (total || tab !== "contact") ? <MsgPager page={tab === "contact" ? page : 1} pages={tab === "contact" ? pages : 1} text={footer} onPage={(p) => url.replace({ page: p === 1 ? null : String(p) })} /> : null}
      </section>
      <MessageDrawer />
      <MessageModals />
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} module="messages" tab={tab} />
    </>
  );
}
