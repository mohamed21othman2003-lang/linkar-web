import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import type { Booking } from "@/lib/data/account/bookings";
import type { DemoUser } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import type { BookingDetailView, ManageView } from "@/components/account/booking-detail";

// رابط مشاركة القسيمة (P-08): linkarksa.com/v/LK-…  → صفحة W2-81
const SHARE_HOST = "linkarksa.com";

// تحويل الحجز (شكل الـAPI) لنصوص جاهزة باللغة الحالية لكومبوننت المتابعة
export function toDetailView(locale: Locale, b: Booking, user: DemoUser): BookingDetailView {
  const d = getAccountDict(locale);
  const det = b.detail!;
  const branchLine = `${tx(locale, b, "provider")} · ${tx(locale, b, "branch")}`;
  const provider = tx(locale, b, "provider");
  const manage = det.manage
    ? {
        title: tx(locale, det.manage, "title"),
        actions: det.manage.actions.map((a): ManageView => {
          if (typeof a !== "string") return { kind: "complaint", title: tx(locale, a, "title"), sub: tx(locale, a, "sub") };
          if (a === "branch") return { kind: a, title: d.booking.contactBranch, sub: branchLine };
          if (a === "rate") return { kind: a, title: d.booking.rate, sub: d.booking.rateSub(provider) };
          return { kind: "support", title: d.booking.contactSupport, sub: d.booking.supportSub };
        }),
      }
    : null;
  const paid = det.rows.find((r) => r.label_ar === "المدفوع");
  const vf = b.voucher_full;
  return {
    branch: { id: b.id, providerSlug: b.provider_slug, branchLine, address: tx(locale, b, "address"), mapsUrl: b.maps_url },
    statusLabel: tx(locale, det, "status_label"),
    statusTone: det.status_tone,
    tracker: det.tracker.map((s) => ({ label: tx(locale, s, "label"), note: tx(locale, s, "note"), state: s.state })),
    tip: tx(locale, det, "tip"),
    tipTone: det.tip_tone,
    voucher: { code: det.voucher.code, note: tx(locale, det.voucher, "note"), state: det.voucher.state },
    manage,
    rows: det.rows.map((r) => ({ label: tx(locale, r, "label"), value: tx(locale, r, "value"), tone: r.tone })),
    log: det.log.map((l) => ({ time: tx(locale, l, "time"), text: tx(locale, l, "text"), tone: l.tone })),
    rating: b.rating
      ? {
          bookingId: b.id,
          providerSlug: b.provider_slug,
          meta: tx(locale, b.rating, "title_meta"),
          criteria: [tx(locale, b.rating, "extra_criterion")],
          sample: b.rating.sample,
          comment: tx(locale, b.rating, "sample_comment"),
          // «محمد س.» — الاسم الأول + أول حرف من اسم العائلة
          reviewer: `${tx(locale, user, "first_name")} ${tx(locale, user, "name").split(" ").slice(-1)[0].charAt(0)}.`,
        }
      : undefined,
    // القسيمة كاملة (W2-37v) موجودة في الفيجما لـBK-21452 بس — للقسائم المستخدمة بنعرض المتاح و«—» للناقص
    voucherFull:
      det.voucher.state === "cancelled"
        ? undefined
        : {
            id: b.id,
            providerSlug: b.provider_slug,
            branchLine,
            address: tx(locale, b, "address"),
            code: det.voucher.code,
            validUntil: vf ? tx(locale, vf, "valid_until") : "—",
            car: tx(locale, b, "car"),
            services: vf ? tx(locale, vf, "services") : tx(locale, b, "services_short"),
            paid: vf ? tx(locale, vf, "paid") : paid ? tx(locale, paid, "value") : "—",
            paidAt: vf ? tx(locale, vf, "paid_at") : tx(locale, det.log[0], "time"),
            warranty: vf ? tx(locale, vf, "warranty") : "—",
            mapsUrl: b.maps_url,
            shareLink: `${SHARE_HOST}${routes.sharedVoucher(det.voucher.code)}`,
          },
  };
}
