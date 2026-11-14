"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/panel/PageHead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import type { CompanyForm } from "@/lib/api/profile";
import { CompanyStep } from "../../new/_components/AddProviderWizard";
import { Stepper } from "../../new/_components/bits";
import { LeaveModal } from "../../new/_components/WizardModals";
import { accountSchema, wizardSchema, type WizardValues } from "../../new/_components/schema";

// CON5-07E1 · تعديل بيانات المنشأة · جونسون (3304-158088) — نفس خطوة «المنشأة والمالك» في معالج الإضافة (CON5-07N1 3114-51246)
// بقيم المنشأة، والأرقام الحساسة (الموحد · الهوية · الآيبان) راجعة مخفية من الخادم: تفضل زي ما هي لو ما اتعدّلتش.
// المسار: مقدّمو الخدمة ← الاسم ← تعديل البيانات · العنوان «تعديل بيانات <الاسم>» · الأزرار: «إلغاء» يمين و«حفظ التعديلات» كحلي شمال.
const masked = (v: string) => v.includes("•");
const digits = (v: string) => v.replace(/\D/g, "");
const editSchema = wizardSchema
  .pick({ type: true, brand: true, brandEn: true, city: true, legalName: true, cr: true, vat: true, code: true, codeEdited: true, logo: true, ownerName: true, ownerPhone: true, email: true, docs: true })
  .extend({
    unified: z.string().refine((v) => masked(v) || /^7\d{9}$/.test(digits(v)), "10 أرقام يبدأ بـ7"),
    nationalId: z.string().refine((v) => masked(v) || /^[12]\d{9}$/.test(digits(v)), "رقم الهوية 10 أرقام يبدأ بـ1 أو 2"),
    accounts: z.array(accountSchema.extend({ iban: z.string().refine((v) => masked(v) || /^SA\d{22}$/.test(v.replace(/\s/g, "").toUpperCase()), "الآيبان يبدأ بـSA ثم 22 رقماً") })).min(1),
  });

const toWizard = (c: CompanyForm): WizardValues => ({ ...c, codeEdited: true, branches: [] });

export function EditCompany({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["providers", "company-form", id], queryFn: () => api.profile.companyForm(id), retry: (n, e) => !isApiError(e, 404) && n < 2 });
  const profile = useQuery({ queryKey: ["providers", "profile", id], queryFn: () => api.profile.get(id) });
  if (q.isError)
    return (
      <div className="rounded-16 border border-border bg-white">
        <EmptyState title="مقدّم الخدمة غير موجود" body="ربما حُذف أو تغيّر رابطه." action={<ButtonLink href="/providers" variant="secondary" size="S">العودة لمقدّمي الخدمة</ButtonLink>} />
      </div>
    );
  if (!q.data || !profile.data)
    return (
      <>
        <Skeleton className="h-[86px] w-80" />
        <Skeleton className="h-[58px] rounded-14" />
        <Skeleton className="h-[420px] rounded-16" />
      </>
    );
  return <Form id={id} initial={q.data} name={profile.data.provider.name} short={profile.data.provider.short ?? profile.data.provider.name} />;
}

function Form({ id, initial, name, short }: { id: string; initial: CompanyForm; name: string; short: string }) {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const form = useForm<WizardValues>({ resolver: zodResolver(editSchema) as unknown as Resolver<WizardValues>, defaultValues: toWizard(initial), mode: "onTouched" });
  const [leave, setLeave] = useState<string | null>(null);
  const saved = useRef(false);
  const dirty = form.formState.isDirty;
  const back = `/providers/${id}`;

  // تأكيد قبل مغادرة نموذج فيه تعديلات (القسم 18.2 · 6)
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty && !saved.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (v: WizardValues) => api.profile.saveCompanyForm(id, { ...initial, ...v, accounts: v.accounts, docs: v.docs }),
    onSuccess: () => {
      saved.current = true;
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast("حُفظت بيانات المنشأة", `حُفظت بيانات المنشأة · أُبلغ مسؤول التواصل لدى ${short} وسُجّل التعديل`);
      router.push(back);
    },
    onError: () => toast("تعذّر الحفظ", "تعذّر حفظ بيانات المنشأة، حاول مرة أخرى"),
  });
  const goTo = (href: string) => (dirty && !saved.current ? setLeave(href) : router.push(href));
  const link = (href: string, label: string) => (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        goTo(href);
      }}
      className="hover:text-ink"
    >
      {label}
    </Link>
  );

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-0.5">
        <nav aria-label="مسار الصفحة" className="text-12 leading-[18px] font-light text-muted">
          {link("/providers", "مقدّمو الخدمة")} ← {link(back, name)} ← تعديل البيانات
        </nav>
        <h1 className="text-24 font-bold text-ink">تعديل بيانات {name}</h1>
      </div>
      <Stepper step={1} />
      <form
        onSubmit={form.handleSubmit(
          (v) => save.mutate(v),
          () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()),
        )}
        noValidate
        className="flex flex-col gap-5"
      >
        <CompanyStep edit />
        <div className="flex items-center justify-between gap-2.5">
          <Button variant="secondary" className="h-[46px] px-[18px]" onClick={() => goTo(back)} disabled={save.isPending}>
            إلغاء
          </Button>
          <Button type="submit" className="h-11 px-[18px]" loading={save.isPending}>
            حفظ التعديلات
          </Button>
        </div>
      </form>
      {leave ? (
        <LeaveModal
          onStay={() => setLeave(null)}
          onLeave={() => {
            saved.current = true;
            router.push(leave);
          }}
        />
      ) : null}
    </FormProvider>
  );
}
