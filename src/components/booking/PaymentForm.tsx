"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { PaymentMethodId } from "@/lib/data/booking/types";
import { formatNumber, formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { RadioDot, Toggle } from "./Radio";
import { Summary, type SummaryRow } from "./Summary";
import { computeTotals } from "./pricing";
import { InstallmentModal, MarketerCodeModal, VerifyPaymentModal } from "./popups";

export type MethodView = { id: PaymentMethodId; name: string; description: string; badge: string; flow: "direct" | "verify" | "redirect" };
type MarketerView = { code: string; name: string; credit: number; min: number };

const badgeStyle: Record<PaymentMethodId, string> = {
  apple: "bg-pay-black text-white",
  mada: "border border-border-default bg-white",
  stc: "border border-border-default bg-white",
  tabby: "bg-tabby text-pay-black",
  tamara: "bg-tamara text-pay-black",
  card: "border border-border-default bg-white",
};

// W2-35 الدفع · W2-35m مدى (يفتح P-09) · W2-35b فشلت العملية · W2-35s كود المسوّق — الدفع تجريبي بالكامل
export function PaymentForm({
  locale,
  summary,
  subtotal,
  pointsAvailable,
  pointsSar,
  initialMarketer,
  marketers,
  methods,
  instruments,
  stcPhone,
  failedMethod,
  initialMethod,
  failDemo,
  selfMarketerDemo,
  branchName,
  itemsLabel,
  successHref,
  failHref,
  retryHref,
}: {
  locale: Locale;
  summary: { at: string; providerName: string; providerSlug: string; providerLogo: string; lines: { key: string; name: string; price: string }[]; rows: SummaryRow[] };
  subtotal: number;
  pointsAvailable: number;
  pointsSar: number;
  initialMarketer: MarketerView | null;
  marketers: MarketerView[];
  methods: MethodView[];
  instruments: Record<"mada" | "card" | "stc", string>;
  stcPhone: string;
  failedMethod: PaymentMethodId | null;
  initialMethod: PaymentMethodId | null; // ?method=mada ← W2-35m
  failDemo: boolean;
  selfMarketerDemo: boolean;
  branchName: string;
  itemsLabel: string;
  successHref: string; // + &method=…&pts=…
  failHref: string; // + &failed=…
  retryHref: string;
}) {
  const t = getBookingDict(locale);
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethodId>(initialMethod ?? failedMethod ?? "apple");
  const [usePoints, setUsePoints] = useState(pointsAvailable > 0);
  const [marketer, setMarketer] = useState<MarketerView | null>(initialMarketer && subtotal >= initialMarketer.min ? initialMarketer : null);
  const [autoApplied] = useState(!!initialMarketer);
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [codeIssue, setCodeIssue] = useState<{ reason: "min" | "self"; m: MarketerView } | null>(
    initialMarketer && subtotal < initialMarketer.min ? { reason: "min", m: initialMarketer } : null,
  );
  const [dialog, setDialog] = useState<null | "verify" | "installment">(null);
  const [busy, setBusy] = useState(false);

  const totals = computeTotals({ subtotal, points: usePoints ? pointsSar : 0, marketerCredit: marketer?.credit ?? 0 });
  const amount = formatPrice(locale, totals.due);
  const current = methods.find((m) => m.id === method)!;

  const finish = (ok: boolean) => {
    setDialog(null);
    setBusy(true);
    const extra = `&method=${method}&pts=${usePoints ? 1 : 0}${marketer ? "" : "&nomkt=1"}`;
    router.push(ok ? `${successHref}${extra}` : `${failHref}&failed=${method}`);
  };
  const pay = () => {
    if (current.flow === "verify") return setDialog("verify");
    if (current.flow === "redirect") return setDialog("installment");
    finish(!(failDemo && !failedMethod));
  };
  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const m = marketers.find((x) => x.code.toUpperCase() === code);
    if (!m) return setPromoError(true);
    setPromoError(false);
    if (selfMarketerDemo) return setCodeIssue({ reason: "self", m });
    if (subtotal < m.min) return setCodeIssue({ reason: "min", m });
    setMarketer(m);
    setPromo("");
  };

  const adjustments: SummaryRow[] = [{ label: t.subtotal, value: formatPrice(locale, subtotal) }];
  if (usePoints && pointsSar > 0) adjustments.push({ label: t.pointsDiscount, value: `−${formatPrice(locale, pointsSar)}`, tone: "credit" });
  if (marketer) adjustments.push({ label: t.fill(t.marketerCredit, { code: marketer.code }), value: `−${formatPrice(locale, marketer.credit)}`, tone: "credit" });

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {failedMethod && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-promotional-red/40 bg-bg-danger-subtle px-4 py-3.5">
            <Icon name="info" size={18} className="shrink-0 text-state-gray" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-label-l text-promotional-red">{t.failTitle}</span>
              <span className="text-body-s">{t.fill(t.failBody, { method: methods.find((m) => m.id === failedMethod)?.name ?? "" })}</span>
            </div>
            <button type="button" onClick={() => router.replace(retryHref)} className="rounded-md bg-deep-charcoal px-4 py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle">
              {t.retry}
            </button>
          </div>
        )}

        <section className="flex flex-col gap-3.5 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">{t.payMethod}</h2>
            <p className="text-body-s text-v3-text-meta">{t.paySub}</p>
          </div>
          <div role="radiogroup" className="flex flex-col gap-3.5">
            {methods.map((m) => {
              const on = m.id === method;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setMethod(m.id);
                    // النموذج الأولي: STC Pay / تابي / تمارا تفتح نافذتها مباشرة (OVERLAY · DISSOLVE 200ms)
                    if (m.id === "stc") setDialog("verify");
                    if (m.flow === "redirect") setDialog("installment");
                  }}
                  className={`flex min-h-20 items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-start transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/8" : "border border-border-default bg-white"}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <RadioDot on={on} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-label-l">{m.name}</span>
                      <span className="text-caption text-v3-text-meta">{t.fill(m.description, { amount: formatPrice(locale, totals.installment) })}</span>
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-sm px-2.5 py-[5px] text-label-m ${badgeStyle[m.id]}`}>{m.badge}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <h2 className="text-h4">{t.pointsTitle}</h2>
          {pointsAvailable > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-cool-gray/25 px-4 py-3.5">
              <span className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma/booking/tile-points.svg" alt="" width={40} height={40} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-label-l">{t.fill(t.usePoints, { points: formatNumber(pointsAvailable), amount: formatPrice(locale, pointsSar) })}</span>
                  <span className="text-caption text-v3-text-meta">{t.pointsRule}</span>
                </span>
              </span>
              <Toggle on={usePoints} onChange={setUsePoints} label={t.pointsTitle} />
            </div>
          )}
          {marketer ? (
            <>
              <div className="flex items-center gap-3 rounded-md border border-nature-green/35 bg-bg-success-subtle px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-nature-green text-white">
                  <Icon name="check" size={16} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-label-l">
                    <bdi>{marketer.code}</bdi>
                  </span>
                  <span className="text-caption text-green-active">{t.fill(t.marketerApplied, { name: marketer.name, amount: formatPrice(locale, marketer.credit) })}</span>
                </span>
                <button type="button" onClick={() => setMarketer(null)} className="text-label-m underline">
                  {t.remove}
                </button>
              </div>
              {autoApplied && <p className="text-caption text-v3-text-meta">{t.fill(t.autoApplied, { min: formatPrice(locale, marketer.min) })}</p>}
              {pointsAvailable === 0 && <p className="text-caption text-v3-text-meta">{t.pointsGuest}</p>}
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyPromo();
              }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2.5">
                <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-default bg-white px-3.5 focus-within:border-deep-charcoal">
                  <Icon name="tag" size={18} className="shrink-0 text-state-gray" />
                  <input
                    value={promo}
                    onChange={(e) => (setPromo(e.target.value), setPromoError(false))}
                    placeholder={t.promoPh}
                    aria-invalid={promoError}
                    className="min-w-0 flex-1 bg-transparent text-[16px] font-light outline-none placeholder:text-v3-text-meta"
                  />
                </label>
                <button type="submit" className="h-[50px] shrink-0 rounded-md border border-deep-charcoal px-5 text-label-m hover:bg-tile">
                  {t.apply}
                </button>
              </div>
              {promoError && <span className="text-caption text-promotional-red">{t.invalidCode}</span>}
            </form>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
          <h2 className="text-h4">{t.voucherTitle}</h2>
          <p className="flex items-start gap-2 text-body-s">
            <Icon name="check" size={16} className="mt-1 shrink-0 text-nature-green" />
            {t.voucherLine1}
          </p>
          <p className="flex items-start gap-2 text-body-s">
            <Icon name="info" size={16} className="mt-1 shrink-0 text-state-gray" />
            {t.fill(t.voucherLine2, { branch: branchName })}
          </p>
        </section>
      </div>

      <Summary
        v={{
          ...summary,
          adjustments,
          totalLabel: t.due,
          totalNote: marketer ? t.dueVat : t.fill(t.dueTax, { tax: formatPrice(locale, totals.tax) }),
          total: amount,
        }}
        cta={
          <button
            type="button"
            onClick={pay}
            disabled={busy}
            className="flex h-14 items-center justify-center rounded-[14px] bg-pay-black px-4 text-label-l text-white disabled:opacity-70"
          >
            {busy ? t.processing : t.fill(t.pay[method], { amount })}
          </button>
        }
        footer={<p className="text-caption text-text-secondary">{t.agree}</p>}
      />

      <VerifyPaymentModal
        key={method}
        locale={locale}
        open={dialog === "verify"}
        kind={method === "stc" ? "stc" : "bank"}
        amount={amount}
        instrument={method === "stc" ? instruments.stc : method === "card" ? instruments.card : instruments.mada}
        phone={stcPhone}
        onClose={() => setDialog(null)}
        onConfirm={(code) => finish(code !== "000000" && !(failDemo && !failedMethod))}
        onCancel={() => finish(false)}
      />
      <InstallmentModal
        locale={locale}
        open={dialog === "installment"}
        kind={method === "tamara" ? "tamara" : "tabby"}
        installment={formatPrice(locale, totals.installment)}
        onClose={() => setDialog(null)}
        onContinue={() => finish(!(failDemo && !failedMethod))}
      />
      {codeIssue && (
        <MarketerCodeModal
          locale={locale}
          open
          reason={codeIssue.reason}
          code={codeIssue.m.code}
          min={formatPrice(locale, codeIssue.m.min)}
          total={formatPrice(locale, subtotal)}
          items={itemsLabel}
          onClose={() => setCodeIssue(null)}
          onContinue={() => (setCodeIssue(null), setPromo(""))}
          onEdit={() => (setCodeIssue(null), setPromo(codeIssue.m.code))}
        />
      )}
    </>
  );
}
