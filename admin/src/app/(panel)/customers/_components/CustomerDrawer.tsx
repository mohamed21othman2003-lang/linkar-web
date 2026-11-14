"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { customersMutations, maskPhone, POINT_REASONS, POINT_TYPES, type Customer, type KV } from "@/lib/api/customers";
import { ltrRuns, num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";

// CON5-05D · درج العميل — نفس المكوّن لكل العملاء (محمد سالم 3114-16433 · ريم س. 3114-16508 · أحمد ز. 3114-16565 · ناصر ع. 3114-16613
// · مهند ك. 3114-16661 · عبدالعزيز ف. 3114-22070 · منيرة ح. 3114-22156 · سارة م. 3114-22242 · يوسف ع. 3114-22328 · لمى ع. 3114-22414
// · ريما د. 3114-22495 · سعود ب. 3114-22579 · ماجد ك. 3114-22663 · خالد الدوسري 3114-22747) — الرابط ?customer=<id>
// الأرقام (نقطة · حجوزات) · «الاهتمامات» · «الدعوات» · «القسائم الصالحة (n)» · «السيارة/السيارات» · روابط · «تعديل النقاط»
export function CustomerDrawer() {
  const url = useUrlState();
  const id = url.get("customer");
  const q = useQuery({ queryKey: ["customers", "one", id], queryFn: () => api.customers.get(id!), enabled: !!id });
  const c = q.data;
  const canEdit = useCan("customers", "edit");
  const close = () => url.replace({ customer: null, modal: null });

  return (
    <>
      <Drawer
        open={!!id}
        onOpenChange={(o) => !o && close()}
        tight
        footerClassName="sm:pb-6!"
        title={c ? <Link href={`/customers/${c.id}`} className="hover:underline" title="ملف العميل">{c.name}</Link> : q.isError ? "تعذّر تحميل العميل" : "…"}
        subtitle={c ? ltrRuns(`${maskPhone(c.phone)} · ${c.city}`) : undefined}
        footer={
          c && canEdit ? (
            <>
              <button type="button" onClick={() => url.push({ modal: "points" })} className="flex h-[46px] items-center sm:w-[284px] sm:flex-none! justify-center rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1">
                تعديل النقاط
              </button>
              <span aria-hidden className="hidden sm:block" />
            </>
          ) : null
        }
      >
        {q.isLoading ? (
          <div className="flex flex-col gap-3.5">
            <Skeleton className="h-[72px] w-full rounded-12" />
            <Skeleton className="h-48 w-full rounded-14" />
            <Skeleton className="h-32 w-full rounded-14" />
          </div>
        ) : q.isError ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-13 text-muted">حدث خطأ أثناء التحميل. حاول مرة أخرى.</p>
            <Button variant="secondary" size="S" onClick={() => q.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : c ? (
          <Body c={c} />
        ) : null}
      </Drawer>
      {c ? <PointsModal c={c} open={!!id && url.get("modal") === "points"} onClose={() => url.replace({ modal: null })} /> : null}
    </>
  );
}

function Body({ c }: { c: Customer }) {
  const d = c.drawer;
  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat value={num(c.bookings.count)} label={d.bookingsLabel} />
        <Stat value={num(c.points)} label="نقطة" />
      </div>
      <Tile title="الاهتمامات">
        {d.interests.map((r) => (
          <Row key={r.k} r={r} />
        ))}
      </Tile>
      {d.invites ? (
        <Tile title="الدعوات">
          {d.invites.map((r) => (
            <Row key={r.k} r={r} />
          ))}
        </Tile>
      ) : null}
      {d.vouchers?.length ? (
        <Tile title={`القسائم الصالحة (${num(d.vouchers.length)})`}>
          {d.vouchers.map((v) => (
            <div key={v.title} className="flex flex-col">
              <p className="text-13 leading-5 font-semibold text-ink">{ltrRuns(v.title)}</p>
              <p className="text-12 leading-[18px] font-light text-muted">{ltrRuns(v.sub)}</p>
            </div>
          ))}
        </Tile>
      ) : null}
      <Tile title={d.cars.length > 1 ? "السيارات" : "السيارة"}>
        {d.cars.map((car) => (
          <p key={car} className="text-13 leading-[21px] font-normal text-ink">
            {ltrRuns(car)}
          </p>
        ))}
      </Tile>
      {d.links.map((l) => (
        <Link key={l.label} href={l.href} className="flex min-h-[46px] items-center gap-2 rounded-12 border border-border bg-white px-3.5 py-3 text-13 leading-5 font-medium text-ink hover:bg-surface-1">
          <span className="min-w-0 flex-1">{ltrRuns(l.label)}</span>
          <Icon name="chevron-left" size={16} className="shrink-0" />
        </Link>
      ))}
    </>
  );
}

// رقم: #F4F6F5 r12 · حشو 12·14 · الرقم 20/30 Bold · العنوان 12/18 Light رمادي
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-12 bg-surface-1 px-3.5 py-3">
      <span className="num text-[20px] leading-[30px] font-bold text-ink">{value}</span>
      <span className="text-12 leading-[18px] font-light text-muted">{label}</span>
    </div>
  );
}

// بطاقة: بإطار r14 · حشو 14 · مسافة 6 · العنوان 14/22 SemiBold
function Tile({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-14 border border-border bg-white p-3.5">
      <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

// صف «العنوان — القيمة»: 32 · حشو 6 · مسافة 12 · العنوان 13 Light رمادي يمين · القيمة 13 Medium على الشمال
function Row({ r }: { r: KV }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="shrink-0 text-13 leading-5 font-light text-muted">{r.k}</span>
      <span className="num min-w-0 flex-1 text-end text-13 leading-5 font-medium text-ink">{ltrRuns(r.v)}</span>
    </div>
  );
}

// ───────────── CON5-05M · تعديل النقاط (محمد سالم 3114-16706 … خالد الدوسري 3114-22798) → CON5-T0503 حُفظت النقاط (3114-16838) ─────────────
// 480 عرض · الرصيد الحالي · عدد النقاط + النوع (إضافة/خصم) · السبب من القائمة المرجعية «أسباب تعديل النقاط» · إلغاء / حفظ
const schema = z.object({
  amount: z.number({ error: "أدخل عدد النقاط" }).int("أدخل رقماً صحيحاً").positive("أدخل عدد النقاط"),
  type: z.enum(["add", "deduct"]),
  reason: z.string().min(1, "اختر السبب"),
});
type Values = z.infer<typeof schema>;

export function PointsModal({ c, open, onClose }: { c: Customer; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { register, control, handleSubmit, formState, reset } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { amount: 200, type: "add", reason: POINT_REASONS[0] } });
  const m = useMutation({
    mutationFn: (v: Values) => customersMutations.adjustPoints(c.id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      reset();
      onClose();
      toast("حُفظت النقاط", "حُفظ تعديل النقاط وأُبلغ العميل");
    },
  });
  const type = useWatch({ control, name: "type" });
  const amount = useWatch({ control, name: "amount" });
  const over = type === "deduct" && amount > c.points;
  const err = formState.errors;
  const dirty = formState.isDirty;
  const tryClose = () => {
    if (m.isPending) return;
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    reset();
    onClose();
  };
  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && tryClose()}
      title={`تعديل نقاط ${c.name}`}
      width={480}
      footer={
        <>
          <Button onClick={handleSubmit((v) => m.mutate(v))} loading={m.isPending} disabled={over} className="h-12">
            حفظ
          </Button>
          <Button variant="secondary" onClick={tryClose} disabled={m.isPending} className="h-[50px]">
            إلغاء
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-2 text-13 leading-[22px]">
        <span className="font-light text-muted">الرصيد الحالي</span>
        <span className="num font-medium text-ink">{`${num(c.points)} نقطة`}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pts-amount" className="text-12 leading-5 font-medium text-muted">
            عدد النقاط
          </label>
          <input
            id="pts-amount"
            type="number"
            inputMode="numeric"
            min={1}
            {...register("amount", { valueAsNumber: true })}
            aria-invalid={!!err.amount || over || undefined}
            className={`num h-11 rounded-10 border bg-white px-3 text-13 leading-[22px] font-medium text-ink outline-none focus:border-[1.5px] focus:border-ink ${err.amount || over ? "border-danger" : "border-border"}`}
          />
          {err.amount ? <p role="alert" className="text-12 text-danger">{err.amount.message}</p> : over ? <p role="alert" className="text-12 text-danger">الخصم أكبر من الرصيد الحالي</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-12 leading-5 font-medium text-muted">النوع</span>
          <Controller control={control} name="type" render={({ field }) => <Select ariaLabel="النوع" value={field.value} onChange={field.onChange} options={POINT_TYPES as { value: "add" | "deduct"; label: string }[]} />} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-12 leading-5 font-medium text-muted">السبب</span>
        <Controller control={control} name="reason" render={({ field }) => <Select ariaLabel="السبب" value={field.value} onChange={field.onChange} invalid={!!err.reason} options={POINT_REASONS.map((r) => ({ value: r, label: r }))} />} />
        {err.reason ? <p role="alert" className="text-12 text-danger">{err.reason.message}</p> : <p className="text-12 leading-5 font-medium text-muted">من القائمة المرجعية «أسباب تعديل النقاط»</p>}
      </div>
    </Modal>
  );
}
