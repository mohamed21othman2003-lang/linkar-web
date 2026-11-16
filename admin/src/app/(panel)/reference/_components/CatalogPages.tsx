"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { ltrRuns, num } from "@/lib/format";
import { productOptions, productWarranty, templateCount, templateCritical } from "@/lib/api/reference";
import { useUrlState } from "@/lib/use-url-state";
import { CategoryIcon, HEAD_ROW, PanelHead, SmallBtn } from "./bits";
import { EditableList } from "./EditableList";
import { ScrollX } from "@/components/ui/ScrollX";

function Loading() {
  return (
    <>
      <Skeleton className="h-11 w-1/2" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </>
  );
}
function Failed({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      title="تعذّر تحميل البيانات"
      body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
      action={
        <Button variant="secondary" size="S" onClick={retry}>
          إعادة المحاولة
        </Button>
      }
    />
  );
}

/** خلية بعرض Figma تنكمش في الشاشات الأصغر */
const cell = (w: number) => ({ flex: `0 1 ${w}px` });

function Acts({ edit, del }: { edit: () => void; del: () => void }) {
  return (
    <span className="flex shrink-0 items-center justify-end gap-1.5" style={{ flex: "0 0 70px" }}>
      <SmallBtn icon="edit" label="تعديل" onClick={edit} />
      <SmallBtn icon="trash" danger label="حذف" onClick={del} />
    </span>
  );
}

// ───────── CON5-20 · تصنيفات الخدمات (3114:80128) ─────────
export function CategoriesPage() {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["reference", "categories"], queryFn: () => api.reference.categories() });
  return (
    <>
      <PanelHead
        title="تصنيفات الخدمات"
        action={
          <Button variant="accent" className="h-11!" onClick={() => url.push({ modal: "ref-cat-new" })}>
            إضافة تصنيف
            <Icon name="plus" size={16} />
          </Button>
        }
      />
      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <Failed retry={() => q.refetch()} />
      ) : !q.data?.length ? (
        <EmptyState title="لا توجد تصنيفات بعد" />
      ) : (
        <ScrollX>
          <div className="min-w-[520px]">
            <div className={HEAD_ROW}>
              <span className="min-w-0 flex-1">التصنيف</span>
              <span style={cell(120)}>المنتجات المعتمدة</span>
              <span style={{ flex: "0 0 70px" }} />
            </div>
            {q.data.map((c) => (
              <div key={c.slug} className="flex items-center gap-2 border-b border-divider px-2 py-3">
                <Link href={`/reference/service-categories/${c.slug}`} className="min-w-0 flex-1 text-13 font-semibold text-ink hover:underline">
                  {c.name}
                  {c.draft ? <span className="ms-2 text-12 font-medium text-pending">مسودة</span> : null}
                </Link>
                <span className="num text-13 text-ink" style={cell(120)}>
                  {num(c.products.length)}
                </span>
                <Acts edit={() => url.push({ modal: "ref-cat-edit", cat: c.slug })} del={() => url.push({ modal: "ref-cat-delete", cat: c.slug })} />
              </div>
            ))}
          </div>
        </ScrollX>
      )}
    </>
  );
}

// ───────── CON5-20 · تصنيف · <الخدمة> (نانو سيراميك 3114:77859 …) ─────────
const PCOLS: [string, number][] = [
  ["المنتج المعتمد", 116],
  ["المواصفات", 210],
  ["الضمان", 150],
  ["الخيارات", 120],
  ["مقدّمو الخدمة", 70],
];

export function CategoryPage({ slug }: { slug: string }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["reference", "category", slug], queryFn: () => api.reference.category(slug) });
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Failed retry={() => q.refetch()} />;
  const c = q.data;
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <p className="text-12 font-light text-muted">
          <Link href="/reference/service-categories" className="hover:text-ink">
            تصنيفات الخدمات
          </Link>{" "}
          ← {c.name}
        </p>
        <div className="flex items-center gap-3">
          <CategoryIcon icon={c.icon} />
          <h1 className="text-[22px] leading-[34px] font-bold text-ink">{c.name}</h1>
          <SmallBtn icon="edit" label="تعديل التصنيف" onClick={() => url.push({ modal: "ref-cat-edit", cat: c.slug })} />
        </div>
      </div>
      <section className="flex flex-col gap-2.5 rounded-14 border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-16 font-bold text-ink">المنتجات المعتمدة</h2>
          <Button variant="accent" className="h-11!" onClick={() => url.push({ modal: "ref-product", product: "new" })}>
            إضافة منتج معتمد
            <Icon name="plus" size={16} />
          </Button>
        </div>
        {c.products.length ? (
          <ScrollX>
            <div className="min-w-[640px]">
              <div className={`${HEAD_ROW} min-h-[52px]`}>
                {PCOLS.map(([l, w]) => (
                  <span key={l} className="min-w-0" style={cell(w)}>
                    {l}
                  </span>
                ))}
                <span className="flex-1" />
                <span style={{ flex: "0 0 70px" }} />
              </div>
              {c.products.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border-b border-divider px-2 py-[10px] text-13 text-ink">
                  <span className="min-w-0 font-semibold" style={cell(116)}>
                    {ltrRuns(p.name)}
                  </span>
                  <span className="min-w-0" style={cell(210)}>
                    {ltrRuns(p.summary)}
                  </span>
                  <span className="min-w-0" style={cell(150)}>
                    {ltrRuns(productWarranty(p))}
                  </span>
                  <span className="min-w-0" style={cell(120)}>
                    {productOptions(p)}
                  </span>
                  <span className="num min-w-0" style={cell(70)}>
                    {num(p.providers)}
                  </span>
                  <span className="flex-1" />
                  <Acts edit={() => url.push({ modal: "ref-product", product: p.id })} del={() => url.push({ modal: "ref-product-delete", product: p.id })} />
                </div>
              ))}
            </div>
          </ScrollX>
        ) : (
          <EmptyState title="لا توجد منتجات معتمدة بعد" />
        )}
      </section>
      <Link href="/reference/accreditation" className="flex h-[42px] items-center justify-between gap-2 rounded-10 border border-border bg-white px-3 text-13 font-medium text-ink hover:bg-surface-1">
        <span>{ltrRuns(c.criteria)}</span>
        <Icon name="chevron-left" size={16} />
      </Link>
    </>
  );
}

// ───────── CON5-20 · معايير اعتماد الفروع والخدمات (3114:80275) + تبويب الفئات (3114:76963) ─────────
const TCOLS: [string, number][] = [
  ["اسم القالب", 132],
  ["التصنيف", 120],
  ["طريقة الاختبار", 230],
  ["عدد المعايير", 80],
  ["الحرجة", 60],
  ["حد القبول", 70],
];

function AccTabs({ tab }: { tab: "templates" | "tiers" }) {
  const url = useUrlState();
  const items = [
    { key: "tiers" as const, label: "فئات الفروع" },
    { key: "templates" as const, label: "معايير الخدمات والفروع" },
  ];
  return (
    <div role="tablist" aria-label="معايير اعتماد الفروع والخدمات" className="flex flex-wrap items-center gap-2">
      {items.map((t) => {
        const on = t.key === tab;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => url.replace({ tab: t.key === "templates" ? null : t.key })}
            className={`flex h-[38px] items-center rounded-10 px-3.5 text-14 whitespace-nowrap ${on ? "bg-ink font-semibold text-white" : "border border-border bg-white font-medium text-ink hover:bg-surface-1"}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function AccreditationPage() {
  const url = useUrlState();
  const tab = url.get("tab") === "tiers" ? "tiers" : "templates";
  const q = useQuery({ queryKey: ["reference", "templates"], queryFn: () => api.reference.templates(), enabled: tab === "templates" });
  if (tab === "tiers")
    return (
      <EditableList
        listKey="branch-tiers"
        head={(save) => (
          <>
            <PanelHead title="معايير اعتماد الفروع والخدمات" action={save} />
            <AccTabs tab="tiers" />
          </>
        )}
      />
    );
  return (
    <>
      <PanelHead
        title="معايير اعتماد الفروع والخدمات"
        action={
          <Button variant="accent" className="h-11!" onClick={() => url.push({ modal: "ref-template", template: "new" })}>
            إضافة قالب جديد
            <Icon name="plus" size={16} />
          </Button>
        }
      />
      <AccTabs tab="templates" />
      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <Failed retry={() => q.refetch()} />
      ) : !q.data?.length ? (
        <EmptyState title="لا توجد قوالب بعد" />
      ) : (
        <ScrollX>
          <div className="min-w-[700px]">
            <div className={HEAD_ROW}>
              {TCOLS.map(([l, w]) => (
                <span key={l} className="min-w-0" style={cell(w)}>
                  {l}
                </span>
              ))}
              <span className="flex-1" />
              <span style={{ flex: "0 0 70px" }} />
            </div>
            {q.data.map((t) => (
              <div key={t.id} className="flex items-center gap-2 border-b border-divider px-2 py-2.5 text-13 text-ink">
                <span className="min-w-0 font-semibold" style={cell(132)}>
                  {ltrRuns(t.name)}
                </span>
                <span className="min-w-0" style={cell(120)}>
                  {ltrRuns(t.category)}
                </span>
                <span className="min-w-0" style={cell(230)}>
                  {t.method || "—"}
                </span>
                <span className="num min-w-0" style={cell(80)}>
                  {templateCount(t)}
                </span>
                <span className="num min-w-0" style={cell(60)}>
                  {templateCritical(t)}
                </span>
                <span className="num min-w-0" style={cell(70)}>
                  {t.threshold || "—"}
                </span>
                <span className="flex-1" />
                <Acts edit={() => url.push({ modal: "ref-template", template: t.id })} del={() => url.push({ modal: "ref-template-delete", template: t.id })} />
              </div>
            ))}
          </div>
        </ScrollX>
      )}
    </>
  );
}

// ───────── CON5-20 · شهادة الضمان (3260:252246) ─────────
function BigSwitch({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-13 font-medium text-ink">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ${checked ? "justify-start bg-ink" : "justify-end bg-[#cfd6d3]"}`}>
        <span aria-hidden className={`size-5 rounded-full ${checked ? "bg-lime" : "bg-white"}`} />
      </button>
      {children}
    </label>
  );
}

const CERT: [string, string][] = [
  ["العميل", "«اسم العميل» · «رقم الجوال»"],
  ["السيارة", "«الماركة» «الموديل» · «اللوحة»"],
  ["الخدمة", "«اسم الخدمة»"],
  ["المنتج", "«المنتج المعتمد» · «الشركة · المنشأ»"],
  ["مقدّم الخدمة", "«المزوّد» · «الفرع»"],
  ["تاريخ التنفيذ", "«تاريخ اعتماد الحجز»"],
  ["مدة الضمان", "«مدة ضمان المنتج» · تنتهي «تاريخ الانتهاء»"],
  ["ما يغطيه", "«بنود الضمان»"],
  ["الشروط", "«شروط الضمان»"],
];

export function WarrantyPage() {
  const q = useQuery({ queryKey: ["reference", "warranty"], queryFn: () => api.reference.warranty() });
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Failed retry={() => q.refetch()} />;
  return <WarrantyForm key={q.dataUpdatedAt} initial={q.data} />;
}

function WarrantyForm({ initial }: { initial: { auto: boolean; manual: boolean } }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const save = useMutation({
    mutationFn: () => api.reference.saveWarranty(v),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["reference", "warranty"] });
      toast(r.toast);
    },
  });
  return (
    <>
      <PanelHead
        title="شهادة الضمان"
        action={
          <Button variant="accent" className="h-11!" loading={save.isPending} onClick={() => save.mutate()}>
            حفظ التغييرات
            <Icon name="check" size={16} />
          </Button>
        }
      />
      <BigSwitch checked={v.auto} onChange={(auto) => setV({ ...v, auto })}>
        إصدار تلقائي عند اعتماد الحجز
      </BigSwitch>
      <BigSwitch checked={v.manual} onChange={(manual) => setV({ ...v, manual })}>
        إصدار يدوي من تفاصيل الحجز
      </BigSwitch>
      <article aria-label="معاينة الشهادة" className="flex flex-col gap-3.5 rounded-16 border border-[#3bb34b] bg-white px-5 py-7 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-24 font-bold text-ink">شهادة ضمان لينكار</h2>
            <p className="text-14 text-[#6b7573]">صادرة من لينكار عن حجز معتمد</p>
          </div>
          <p className="text-13 font-medium text-[#6b7573]">رقم الشهادة · WC-«رقم الحجز»</p>
        </div>
        <hr className="border-[#e7eae8]" />
        {CERT.map(([k, val]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-1.5 text-13">
            <span className="shrink-0 font-light text-muted">{k}</span>
            <span className="min-w-0 text-end font-medium text-ink">{val}</span>
          </div>
        ))}
        <p className="text-12 text-[#6b7573]">
          رمز التحقق QR · يتحقق منه العميل والمركز على <bdi>lnkr.sa/w</bdi>
        </p>
      </article>
    </>
  );
}
