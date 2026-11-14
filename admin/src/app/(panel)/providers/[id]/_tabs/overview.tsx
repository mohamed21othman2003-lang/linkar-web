"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { arDate } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · نظرة عامة (3114-48595)
// أزرار S ثانوية يمين («تعديل بيانات المنشأة» → CON5-07E1 · «تذكير بإرسال المستندات» → CON5-07M طلب مستند)
// بطاقة «بيانات المنشأة»: r16 · حشو 18·18·14 · مسافة 8 · عنوان 16 Bold · صفوف 32 (المفتاح 13 Light رمادي يمين والقيمة 13 Medium شمال)
// «المستندات» 16 Medium ثم جدول: رأس 38 #F4F6F5 r10 حشو 9·12 · صفوف 45 حشو 12 بفاصل #E8ECEA · عمود «الجهة» 220
export default function OverviewTab({ profile, canEdit }: ProfileTabProps) {
  const url = useUrlState();
  const p = profile.provider;
  const c = p.company;
  const rows: [string, string, boolean?][] = [
    ["الكود", p.code, true],
    ["الاسم التجاري", p.name],
    ["الاسم القانوني", c.legalName],
    ["النوع", c.kind],
    ["المالك", c.owner],
    ["السجل · الضريبي", `${c.cr} · ${c.vat}`],
    ["الانضمام", arDate(profile.joinedAt)],
  ];
  return (
    <>
      {canEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/providers/${p.id}/edit`} variant="secondary" size="S">
            تعديل بيانات المنشأة
          </ButtonLink>
          <Button variant="secondary" size="S" onClick={() => url.push({ modal: "request-doc", p: p.id })}>
            تذكير بإرسال المستندات
          </Button>
        </div>
      ) : null}
      <section className="flex flex-col gap-2 rounded-16 border border-border bg-white px-[18px] pt-[18px] pb-3.5">
        <h2 className="text-16 leading-6 font-bold text-ink">بيانات المنشأة</h2>
        <dl className="flex flex-col">
          {rows.map(([k, v, ltr]) => (
            <div key={k} className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
              <dt className="shrink-0 font-light text-muted">{k}</dt>
              <dd className="min-w-0 text-end font-medium text-ink">{ltr ? <bdi className="num">{v}</bdi> : <Phoneish v={v} />}</dd>
            </div>
          ))}
        </dl>
      </section>
      <h2 className="text-16 leading-[26px] font-medium text-ink">المستندات</h2>
      <div className="flex flex-col">
        <div className="flex rounded-10 bg-surface-1 px-3 py-[9px] text-12 leading-5 font-medium text-muted">
          <span className="min-w-0 flex-1">المستند</span>
          <span className="w-[130px] shrink-0 sm:w-[220px]">الجهة</span>
        </div>
        {profile.docs.map((d) => (
          <div key={d.name} className="flex gap-2 border-b border-divider p-3 text-13 leading-5 text-ink">
            <span className="min-w-0 flex-1">{d.name}</span>
            <span className="w-[130px] shrink-0 sm:w-[220px]">{d.authority}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** «فهد العتيبي · 055 410 2290» — الجوال رقم إنجليزي معزول عشان ما يتقلبش جوه السطر العربي */
function Phoneish({ v }: { v: string }) {
  const m = /^(.*?)(0\d{2} \d{3} \d{4})$/.exec(v);
  if (!m) return <>{v}</>;
  return (
    <>
      {m[1]}
      <bdi className="num">{m[2]}</bdi>
    </>
  );
}
