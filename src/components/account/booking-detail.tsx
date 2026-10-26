"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { useToast } from "./account-dialog";
import { BrandIcon, Card, ProviderTile, VoucherCode } from "./account-ui";
import {
  ContactBranchPopup,
  RatingModal,
  ShareVoucherPopup,
  VoucherModal,
  type BranchView,
  type RatingView,
  type VoucherView,
} from "./booking-modals";

type StepState = "done" | "current" | "todo" | "cancelled";
export type ManageView = { kind: "branch" | "support" | "rate" | "complaint"; title: string; sub: string; href?: string };

export type BookingDetailView = {
  branch: BranchView;
  statusLabel: string;
  statusTone: "lime" | "red";
  tracker: { label: string; note: string; state: StepState }[];
  tip: string;
  tipTone: "lime" | "red";
  voucher: { code: string; note: string; state: "active" | "used" | "cancelled" };
  manage: { title: string; actions: ManageView[] } | null;
  rows: { label: string; value: string; tone?: "green" }[];
  log: { time: string; text: string; tone: "green" | "red" }[];
  rating?: RatingView;
  voucherFull?: VoucherView;
};

const halfColor: Record<StepState, string> = { done: "bg-neon-green", current: "bg-neon-green", todo: "bg-cool-gray", cancelled: "bg-promotional-red" };

function StepDot({ state }: { state: StepState }) {
  if (state === "done")
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neon-green text-deep-charcoal">
        <Icon name="check" size={16} />
      </span>
    );
  if (state === "current")
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-deep-charcoal">
        <span className="size-2.5 rounded-full bg-neon-green" />
      </span>
    );
  if (state === "cancelled")
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-promotional-red text-white">
        <Icon name="x" size={16} />
      </span>
    );
  return <span className="size-8 shrink-0 rounded-full border-2 border-cool-gray bg-white" />;
}


const manageIcon: Record<ManageView["kind"], string> = { branch: "brand-phone", support: "brand-mail", rate: "brand-heart", complaint: "brand-shield" };

// W2-37 · متابعة الحجز (721:6093 · 824:276 · 824:516 · 824:759) — ومع W2-37v (القسيمة كاملة) وW2-63 (التقييم) كنوافذ فوقها
export function BookingDetail({
  locale,
  id,
  v,
  openVoucher = false,
  openRating = false,
}: {
  locale: Locale;
  id: string;
  v: BookingDetailView;
  openVoucher?: boolean;
  openRating?: boolean;
}) {
  const d = getAccountDict(locale);
  const t = d.booking;
  const router = useRouter();
  const [toast, showToast] = useToast();
  const [contact, setContact] = useState(false);
  const [rating, setRating] = useState(openRating && !!v.rating);
  const [share, setShare] = useState(false);

  const closeRating = () => {
    setRating(false);
    if (openRating) window.history.replaceState(null, "", routes.booking(id));
  };
  const download = () => showToast(d.toasts.downloading, "download");

  // زي الفيجما: الدعم → W2-96 · الشكوى → W2-69 · «قيّم الخدمة» في W2-37c → W2-39 (تقييم الخدمة بعد اكتمالها)
  const manageHref = (a: ManageView) =>
    a.kind === "support" ? routes.contact : a.kind === "complaint" ? routes.complaints() : a.kind === "rate" ? routes.bookingRate(id) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb items={[{ label: d.account, href: routes.account }, { label: d.bookingsCrumb, href: routes.bookings() }, { label: id }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-h3 text-deep-charcoal">{t.title(id)}</h1>
          <p className="text-body-m text-state-gray">{v.branch.branchLine}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-label-m text-deep-charcoal ${
            v.statusTone === "red" ? "border-promotional-red bg-promotional-red/10" : "border-neon-green bg-neon-green/20"
          }`}
        >
          <span className={`size-2 rounded-full ${v.statusTone === "red" ? "bg-promotional-red" : "bg-nature-green"}`} />
          {v.statusLabel}
        </span>
      </div>

      {/* متتبّع الحالة */}
      <Card className="flex flex-col gap-4 px-4 py-6 md:px-7">
        <ol className="flex items-start justify-start">
          {v.tracker.map((s, i) => (
            <li key={i} className={`flex min-w-0 flex-1 flex-col items-center gap-2 text-center ${v.tracker.length < 3 ? "max-w-[320px]" : ""}`}>
              <span className="flex w-full items-center">
                <span className={`h-[3px] flex-1 ${i === 0 ? "" : halfColor[s.state]}`} />
                <StepDot state={s.state} />
                <span className={`h-[3px] flex-1 ${i === v.tracker.length - 1 ? "" : halfColor[s.state]}`} />
              </span>
              <span
                className={`text-[16px] leading-[26px] ${
                  s.state === "current" ? "font-medium text-deep-charcoal" : s.state === "cancelled" ? "font-medium text-promotional-red" : s.state === "todo" ? "font-light text-state-gray" : "font-light text-deep-charcoal"
                }`}
              >
                {s.label}
              </span>
              <span className="px-1 text-caption text-state-gray">{s.note}</span>
            </li>
          ))}
        </ol>
        <p className={`flex items-center gap-2 rounded-md px-3.5 py-2.5 text-body-s text-deep-charcoal ${v.tipTone === "red" ? "bg-promotional-red/8" : "bg-neon-green/12"}`}>
          <Icon name="bell" size={18} className="shrink-0 text-nature-green" />
          {v.tip}
        </p>
      </Card>

      {/* عمودين من 1150 بس: على 1024 المحتوى 640 فعمود التفاصيل كان بيتزنق (≈280) والعناوين والقيم بتلف */}
      <div className="flex flex-col gap-5 min-[1150px]:flex-row min-[1150px]:items-start">
        {/* التفاصيل + سجل الحجز */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="flex flex-col gap-3 px-5 py-[22px] md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ProviderTile slug={v.branch.providerSlug} alt="" size={44} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-label-l text-deep-charcoal">{v.branch.branchLine}</span>
                  <span className="text-caption text-state-gray">{v.branch.address}</span>
                </div>
              </div>
              <a
                href={v.branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-[10px] border border-cool-gray px-3 py-2 text-label-m text-deep-charcoal hover:border-border-strong"
              >
                {t.directions}
              </a>
            </div>
            <div className="h-px bg-cool-gray" />
            {v.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4">
                <span className="text-body-s text-state-gray">{r.label}</span>
                <span className={`text-end text-label-m ${r.tone === "green" ? "text-green-active" : "text-deep-charcoal"}`}>{r.value}</span>
              </div>
            ))}
            <button type="button" onClick={download} className="flex items-center gap-1.5 self-start text-label-m text-green-active hover:underline">
              <BrandIcon name="feature-price" size={18} />
              {t.invoice}
            </button>
          </Card>

          <Card className="flex flex-col gap-3 px-5 py-[22px] md:px-6">
            <h2 className="text-h5 text-deep-charcoal">{t.activity}</h2>
            {v.log.map((l, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="flex items-center gap-2 text-body-s text-deep-charcoal">
                  <span className={`size-2 shrink-0 rounded-full ${l.tone === "red" ? "bg-promotional-red" : "bg-nature-green"}`} />
                  {l.text}
                </span>
                <span className="text-caption text-state-gray">{l.time}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* القسيمة + إدارة الحجز */}
        <div className="flex w-full shrink-0 flex-col gap-5 min-[1150px]:w-[340px]">
          <Card className="flex flex-col items-center gap-2.5 p-5">
            <img
              src="/figma/account/qr-placeholder.svg"
              alt=""
              width={140}
              height={140}
              className={`size-[140px] ${v.voucher.state === "active" ? "" : "opacity-25"}`}
            />
            <VoucherCode
              code={v.voucher.code}
              className={`text-[16.6px] leading-7 ${v.voucher.state === "cancelled" ? "text-state-gray line-through" : "text-deep-charcoal"}`}
            />
            <p className="text-center text-caption text-state-gray">{v.voucher.note}</p>
            {v.voucher.state !== "cancelled" && (
              <Link
                href={routes.voucher(id)}
                className="flex w-full items-center justify-center rounded-md bg-deep-charcoal px-3.5 py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
              >
                {t.openVoucher}
              </Link>
            )}
          </Card>

          {v.manage && (
            <Card className="flex flex-col gap-2.5 p-5">
              <h2 className="text-h5 text-deep-charcoal">{v.manage.title}</h2>
              {v.manage.actions.map((a) => {
                const inner = (
                  <>
                    <BrandIcon name={manageIcon[a.kind]} size={22} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
                      <span className="text-label-l text-deep-charcoal">{a.title}</span>
                      <span className="text-caption text-state-gray">{a.sub}</span>
                    </span>
                    <Icon name="chevron-left" size={16} flip className="shrink-0 text-state-gray" />
                  </>
                );
                const cls = "flex w-full items-center gap-2.5 rounded-[14px] border border-cool-gray px-3.5 py-3 hover:border-border-strong";
                const href = manageHref(a);
                return href ? (
                  <Link key={a.kind} href={href} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <button key={a.kind} type="button" className={cls} onClick={() => setContact(true)}>
                    {inner}
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      <ContactBranchPopup locale={locale} open={contact} onClose={() => setContact(false)} b={v.branch} />
      {v.rating && <RatingModal locale={locale} open={rating} onClose={closeRating} r={v.rating} />}
      {v.voucherFull && (
        <>
          <VoucherModal
            locale={locale}
            open={openVoucher}
            onClose={() => (window.history.length > 1 ? router.back() : router.push(routes.booking(id)))}
            v={v.voucherFull}
            onShare={() => setShare(true)}
            onDownload={download}
          />
          <ShareVoucherPopup
            locale={locale}
            open={share}
            onClose={() => setShare(false)}
            link={v.voucherFull.shareLink}
            onCopied={() => {
              setShare(false);
              showToast(d.toasts.copied, "copy");
            }}
          />
        </>
      )}
      {toast}
    </div>
  );
}
