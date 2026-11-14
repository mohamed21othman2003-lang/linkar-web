"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { KpiCard, KpiRow } from "@/components/panel/Kpi";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { BRANCH_TABS, BRANCH_TAB_LABEL, TIER_THRESHOLDS, dayLabel, type Branch, type BranchTab } from "@/lib/api/branches";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../providers/_components/form-bits";
import { BranchDrawer } from "./BranchDrawer";
import { BranchOverlays } from "./BranchOverlays";
import { MNote, SelectBox, StatusPill, TierPill } from "./bits";

// CON5-08 · الفروع (3114-55392) وتبويباته: معتمد (3114-55819) · بانتظار الزيارة الميدانية (3114-55866) · معتمد جديد (3114-55913) · مرفوض (3114-55960)
// · تحديد للرسالة الجماعية (3114-61752) — الرابط: /branches?tab=&select=1&sel=<ids> · النوافذ ?modal=…&b=<id>
export function BranchesView() {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const tab = (BRANCH_TABS as readonly string[]).includes(url.get("tab") ?? "") ? (url.get("tab") as BranchTab) : "all";
  const selecting = url.get("select") === "1";
  // التحديد محلي (يبدأ من ?sel= لو موجود) — وضع التحديد نفسه ?select=1 في الرابط
  const [sel, setSelState] = useState<string[]>(() => (url.get("sel") ?? "").split(",").filter(Boolean));
  const [exporting, setExporting] = useState(false);

  const list = useQuery({ queryKey: ["branches", { tab }], queryFn: () => api.branches.list({ tab }) });
  const kpis = useQuery({ queryKey: ["branches", "kpis"], queryFn: api.branches.kpis });
  const counts = list.data?.counts;
  const items = list.data?.items;
  const k = kpis.data;

  const toggle = (id: string) => setSelState((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const allIds = items?.map((b) => b.id) ?? [];
  const allOn = allIds.length > 0 && allIds.every((id) => sel.includes(id));
  const toggleAll = () => setSelState((l) => (allOn ? [] : [...new Set([...l, ...allIds])]));

  const columns = useMemo<Column<Branch>[]>(
    () => [
      {
        id: "branch",
        header: selecting ? (
          <div className="flex flex-col items-start gap-0.5">
            <span>الفرع · الكود</span>
            <SelectBox checked={allOn} partial={sel.length > 0} onChange={toggleAll} label="تحديد كل الفروع" />
          </div>
        ) : (
          "الفرع · الكود"
        ),
        width: 202,
        cell: (b) => (
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{b.name}</span>
            <span className="text-12 leading-[18px] font-light text-muted">
              {b.reserved ? "‏" : ""}
              {b.code}
              {b.reserved ? " (محجوز)" : ""}
            </span>
            {selecting ? <SelectBox checked={sel.includes(b.id)} onChange={() => toggle(b.id)} label={`تحديد ${b.name}`} /> : null}
          </div>
        ),
      },
      { id: "provider", header: "مقدّم الخدمة", width: 110, cell: (b) => <p className="text-13 leading-5 font-normal">{b.provider.label}</p> },
      { id: "tier", header: "الفئة", width: 110, cell: (b) => (b.tier ? <TierPill tier={b.tier} /> : <p className="text-13 leading-5 font-normal">—</p>) },
      {
        id: "last",
        header: "آخر تقييم ميداني",
        width: 190,
        cell: (b) => (
          <p className="text-13 leading-5 font-normal">
            {b.status === "pending-visit" || b.status === "request" ? (b.visitAt ? `زيارة ${dayLabel(b.visitAt)}` : "—") : b.status === "rejected" && b.lastReview ? `زيارة ${dayLabel(b.lastReview)}` : b.lastReview ? dayLabel(b.lastReview) : "—"}
          </p>
        ),
      },
      { id: "next", header: "التقييم الدوري القادم", width: 190, cell: (b) => <p className="text-13 leading-5 font-normal">{b.nextReview ? dayLabel(b.nextReview) : "—"}</p> },
      {
        id: "status",
        header: "الحالة",
        width: 170,
        cell: (b) => {
          const line = b.status === "pending-visit" || b.status === "request" ? (b.visitAt ? `الزيارة ${dayLabel(b.visitAt)}` : undefined) : b.statusLine;
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusPill status={b.status} />
              {line ? <span className="text-[11px] leading-[19px] font-light text-muted">{line}</span> : null}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: " ",
        width: 100,
        actions: true,
        cell: (b) =>
          canEdit ? (
            <button
              type="button"
              aria-label={`إجراءات ${b.name}`}
              onClick={() => url.push({ modal: "actions", b: b.id })}
              className="flex h-[35px] items-center gap-1.5 rounded-8 border border-border bg-white ps-3 pe-2.5 text-13 leading-[21px] font-medium text-ink hover:bg-surface-1"
            >
              إجراءات
              <Icon name="chevron-down" size={14} />
            </button>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selecting, sel, allOn, canEdit, url],
  );

  const picked = (items ?? []).filter((b) => sel.includes(b.id));
  const byProvider = new Map<string, string[]>();
  picked.forEach((b) => byProvider.set(b.provider.label, [...(byProvider.get(b.provider.label) ?? []), b.district]));

  return (
    <>
      <div className="flex min-h-[100px] flex-col justify-end">
        <PageHead
          title="الفروع"
          description="كل فروع مقدّمي الخدمة بكودها وفئتها وتقييماتها الميدانية."
          actions={
            <>
              {canEdit ? (
                <Button variant="accent" className="h-11" onClick={() => url.push({ modal: "add-branch" })}>
                  إضافة فرع
                  <Icon name="plus" size={16} />
                </Button>
              ) : null}
              <Button variant="secondary" className="h-[46px]" onClick={() => setExporting(true)}>
                تصدير
                <Icon name="download" size={16} />
              </Button>
              {canEdit && (tab === "all" || tab === "approved" || selecting) ? (
                <Button variant="secondary" className="h-[46px]" onClick={() => (setSelState([]), url.replace({ select: selecting ? null : "1", sel: null }))} aria-pressed={selecting}>
                  رسالة جماعية
                  <Icon name="message" size={16} />
                </Button>
              ) : null}
            </>
          }
        />
      </div>
      <KpiRow>
        <KpiCard label="فروع معتمدة" icon="map-pin" value={k ? num(k.approved) : "—"} loading={kpis.isLoading} hint={k ? `في ${num(k.providers)} منشأة · منها ${num(k.newApproved)} معتمد جديد` : " "} hintClassName={HINT} />
        <KpiCard label="بلاتيني · ذهبي · فضي" icon="star" value={k ? k.tiers.map((n) => num(n)).join(" · ") : "—"} loading={kpis.isLoading} hint="حسب آخر زيارة لكل فرع" hintClassName={HINT} />
        <KpiCard label="بانتظار الزيارة الميدانية" icon="calendar" value={k ? num(k.pending) : "—"} loading={kpis.isLoading} hint={k?.pendingNames || " "} hintClassName={`${HINT} text-info!`} />
        <KpiCard label="تقييمات دورية خلال 60 يوماً" icon="clock" value={k ? num(k.periodic) : "—"} loading={kpis.isLoading} hint={k ? `أقربها ${dayLabel(k.periodicNext)}` : " "} hintClassName={`${HINT} text-warning!`} />
      </KpiRow>
      {selecting ? (
        <section aria-label="الفروع المحددة" className="flex min-h-[100px] flex-wrap items-center justify-between gap-2 rounded-12 bg-ink py-2 ps-4 pe-2.5">
          <div className="flex min-w-0 flex-col">
            <p className="text-14 leading-[22px] font-semibold text-white">{selectedTitle(picked.length, byProvider.size)}</p>
            <p className="text-12 leading-[18px] font-light text-[#c9d1cd]">{picked.length ? [...byProvider].map(([p, ds]) => `${p} (${ds.join("، ")})`).join(" · ") : "حدّد الفروع من الجدول لإرسال رسالة لها"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="h-[46px] border-white! bg-transparent! text-white! hover:bg-white/10!" onClick={() => (setSelState([]), url.replace({ select: null, sel: null }))}>
              إلغاء التحديد
            </Button>
            <Button variant="accent" className="h-11" disabled={!picked.length} onClick={() => url.push({ modal: "bulk" })}>
              إرسال رسالة
              <Icon name="message" size={16} />
            </Button>
          </div>
        </section>
      ) : null}
      <section className="flex flex-col gap-4 rounded-16 bg-white p-5">
        <Tabs
          variant="pill"
          label="تبويبات الفروع"
          value={tab}
          onChange={(t) => url.replace({ tab: t === "all" ? null : t })}
          items={BRANCH_TABS.map((t) => ({ key: t, label: BRANCH_TAB_LABEL[t], count: counts?.[t] }))}
        />
        <DataTable
          columns={columns}
          data={items}
          getRowId={(b) => b.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          empty={
            tab === "all"
              ? { title: "لا توجد فروع بعد", body: "أضف أول فرع لمقدّم خدمة معتمد.", action: canEdit ? <Button variant="accent" size="S" onClick={() => url.push({ modal: "add-branch" })}>إضافة فرع</Button> : null }
              : { title: "لا توجد فروع في هذا التبويب", body: tab === "pending-visit" ? "لا توجد فروع بانتظار الزيارة الميدانية." : tab === "rejected" ? "لا توجد فروع مرفوضة." : undefined }
          }
          onRowClick={selecting ? (b) => toggle(b.id) : (b) => url.push({ branch: b.id })}
          rowLabel={(b) => (selecting ? `تحديد ${b.name}` : `تفاصيل ${b.name}`)}
          rowClass={(b) => (selecting && sel.includes(b.id) ? "bg-lime-tint" : undefined)}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
        <p className="text-12 leading-[18px] font-light text-muted">{TIER_THRESHOLDS}</p>
      </section>
      <ExportModal open={exporting} onOpenChange={setExporting} module="branches" tab={tab} />
      {url.get("modal") === "bulk" ? <BulkMessageModal branches={picked} byProvider={byProvider} close={() => url.replace({ modal: null })} done={() => (setSelState([]), url.replace({ modal: null, select: null, sel: null }))} /> : null}
      <BranchDrawer />
      <BranchOverlays />
    </>
  );
}

const HINT = "text-13 leading-[22px] font-light text-muted";
const branchesWord = (n: number) => (n === 1 ? "فرع محدد" : n === 2 ? "فرعان محددان" : `${num(n)} فروع محددة`);
const providersWord = (n: number) => (n === 1 ? "مقدّم خدمة واحد" : n === 2 ? "مقدّمَي خدمة" : `${num(n)} مقدّمي خدمة`);
const selectedTitle = (n: number, p: number) => (n ? `${branchesWord(n)} من ${providersWord(p)}` : "لم تُحدَّد فروع بعد");

// ───────────── CON5-08M · رسالة جماعية (3114-62061) ─────────────
// 640 · حشو 24 · مسافة 14 · شرائح 30 r20 (المختارة #F7FBE9 بإطار كحلي وعلامة ✓ و12 SemiBold) · حقول 44 · نص 96 · ملاحظة زرقاء · «إرسال لـ N فروع» أخضر
const RECIPIENTS = ["مدير الفرع", "المالك", "فني الفرع"] as const;
const CHANNELS = ["إشعار في لوحة المزوّد", "واتساب أعمال", "رسالة نصية", "بريد إلكتروني"] as const;
const CHANNEL_SHORT: Record<string, string> = { "إشعار في لوحة المزوّد": "إشعار في اللوحة", "واتساب أعمال": "واتساب أعمال", "رسالة نصية": "رسالة نصية", "بريد إلكتروني": "بريد إلكتروني" };
// «القالب · من «قوالب الردود»» — القوالب المعتمدة (CON5-21)
const TEMPLATES: { title: string; body: string }[] = [
  { title: "تذكير بالتواصل مع العميل خلال 24 ساعة", body: "مرحباً {اسم الفرع}، نذكّركم بتأكيد التواصل مع كل عميل خلال 24 ساعة من حجزه، وتسجيل «تم التواصل مع العميل» في اللوحة. أي طلب إعادة جدولة يُرسل من الحجز نفسه." },
  { title: "تذكير بتحديث المستندات", body: "مرحباً {اسم الفرع}، نذكّركم بتحديث المستندات التي تقترب من الانتهاء من صفحة «المستندات» في لوحة المزوّد." },
  { title: "موعد زيارة التقييم الدوري", body: "مرحباً {اسم الفرع}، اقترب موعد زيارة التقييم الدوري للفرع. سيتواصل معكم فريق الجودة لتأكيد الموعد." },
];
const LINKS = ["صفحة «الحجوزات» في لوحة المزوّد", "صفحة «المستندات» في لوحة المزوّد", "بدون رابط"];
const WHEN = ["الآن", "غداً 9:00 ص", "بعد يومين 9:00 ص"];

function ToggleChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-[30px] items-center gap-1.5 rounded-[20px] border px-2.5 text-12 leading-[18px] whitespace-nowrap text-ink ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white font-normal hover:bg-surface-1"}`}
    >
      {on ? <Icon name="check" size={12} /> : null}
      {children}
    </button>
  );
}

function BulkMessageModal({ branches, byProvider, close, done }: { branches: Branch[]; byProvider: Map<string, string[]>; close: () => void; done: () => void }) {
  const toast = useToast();
  const [recipients, setRecipients] = useState<string[]>(["مدير الفرع", "المالك"]);
  const [channels, setChannels] = useState<string[]>(["إشعار في لوحة المزوّد", "واتساب أعمال"]);
  const [template, setTemplate] = useState(TEMPLATES[0].title);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [link, setLink] = useState(LINKS[0]);
  const [when, setWhen] = useState(WHEN[0]);
  const [tried, setTried] = useState(false);
  const flip = (l: string[], v: string) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const n = branches.length;
  const nWord = n === 1 ? "فرع واحد" : n === 2 ? "فرعين" : `${num(n)} فروع`;
  const m = useMutation({
    mutationFn: () => api.branches.bulkMessage({ ids: branches.map((b) => b.id), recipients, channels, template, body, link, when }),
    onSuccess: (r) => {
      const parts = [r.managers ? `${num(r.managers)} مديري فروع` : "", r.owners ? `${num(r.owners)} ملّاك` : "", r.techs ? `${num(r.techs)} فنيين` : ""].filter(Boolean).join(" + ");
      const ch = CHANNELS.filter((c) => channels.includes(c)).map((c) => CHANNEL_SHORT[c]).join(" + ");
      done();
      toast("أُرسلت الرسالة الجماعية", `أُرسلت الرسالة لـ ${nWord} (${num(r.total)} مستلمين: ${parts}) · ${ch}`);
    },
  });
  const errors = { recipients: !recipients.length, channels: !channels.length, body: !body.trim() };
  const invalid = Object.values(errors).some(Boolean);
  void byProvider;
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={640} title={`رسالة جماعية · ${nWord}`} subtitle="تصل لمستخدمي اللوحة المختارين، وتُسجَّل في «الرسائل» وسجل كل فرع.">
      <div className="flex flex-col gap-1.5">
        <span className="text-12 leading-5 font-medium text-muted">تصل إلى</span>
        <div className="flex flex-wrap gap-1.5">
          {RECIPIENTS.map((r) => (
            <ToggleChip key={r} on={recipients.includes(r)} onClick={() => setRecipients(flip(recipients, r))}>
              {r}
            </ToggleChip>
          ))}
        </div>
        {tried && errors.recipients ? <p className="text-12 text-danger">اختر مستلماً واحداً على الأقل</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-12 leading-5 font-medium text-muted">القناة</span>
        <div className="flex flex-wrap gap-1.5">
          {CHANNELS.map((c) => (
            <ToggleChip key={c} on={channels.includes(c)} onClick={() => setChannels(flip(channels, c))}>
              {c}
            </ToggleChip>
          ))}
        </div>
        {tried && errors.channels ? <p className="text-12 text-danger">اختر قناة واحدة على الأقل</p> : null}
      </div>
      <Field label="القالب · من «قوالب الردود»">
        {(id) => (
          <Select
            id={id}
            value={template}
            onChange={(v) => {
              setTemplate(v);
              setBody(TEMPLATES.find((t) => t.title === v)?.body ?? body);
            }}
            options={TEMPLATES.map((t) => ({ value: t.title, label: t.title }))}
            className={SEL}
          />
        )}
      </Field>
      <Field label="نص الرسالة" error={tried && errors.body ? "اكتب نص الرسالة" : undefined}>
        {(id) => <TextArea id={id} value={body} onChange={setBody} invalid={tried && errors.body} className="text-14! leading-[22px] font-normal!" />}
      </Field>
      <Field label="رابط مرفق (اختياري)">{(id) => <Select id={id} value={link} onChange={setLink} options={LINKS.map((l) => ({ value: l, label: l }))} className={`${SEL} [&>svg]:hidden`} />}</Field>
      <Field label="الإرسال">{(id) => <Select id={id} value={when} onChange={setWhen} options={WHEN.map((w) => ({ value: w, label: w }))} className={SEL} />}</Field>
      <MNote className="min-h-[100px]">واتساب عبر حساب لينكار للأعمال وبقالب معتمد فقط. لا تُرسل أسعار البيع أو بيانات العملاء في الرسائل الجماعية.</MNote>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button
          variant="accent"
          className="h-11"
          loading={m.isPending}
          onClick={() => {
            setTried(true);
            if (!invalid) m.mutate();
          }}
        >
          إرسال لـ {nWord}
          <Icon name="message" size={16} />
        </Button>
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
const SEL = "[&>span]:text-14! [&>span]:font-normal!";
