"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { routes } from "@/lib/routes";
import { signOut } from "@/app/actions/session";
import { Icon } from "@/components/icons/Icon";
import { Popup, PopupActions, popupBtnClass, useToast } from "./account-dialog";
import { Dropdown } from "./dropdown";

type Pref = { key: string; title: string; body: string; state: "on" | "off" | "locked" };
type AddressKind = "home" | "work" | "other";
// العنوان بمفاتيح؛ النص بييجي من addressOptions باللغة الحالية (تقرير QA #29)
type Address = { id: string; kind: AddressKind; name: string; city: string; district: string; selected: boolean };
type AddressOptions = {
  kinds: { key: AddressKind; label: string }[];
  cities: { key: string; label: string; districts: { key: string; label: string }[] }[];
};
export type SettingsView = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addresses: Address[];
  addressOptions: AddressOptions;
  alerts: Pref[];
  location: Pref;
  openBookings: string[];
  points: string;
};

// v2 · Toggle (854:6): 44×24 — شغّال: مسار كحلي ودائرة ليموني في نهاية السطر (يسار في العربي، يمين في الإنجليزي) ·
// مطفي: رمادي ودائرة بيضا في البداية. المقفول الشغّال (رسائل الحجز) = شكل «شغّال» باهت + قفل جوه الدائرة،
// عشان مايتلخبطش مع المطفي (كان رمادي ودائرته في البداية فشكله مطفي). الدائرة بـ inset-inline فبتنعكس صح مع الاتجاه.
function Toggle({ on, locked, label, lockedLabel, onChange }: { on: boolean; locked?: boolean; label: string; lockedLabel?: string; onChange?: (v: boolean) => void }) {
  const isOn = on || !!locked;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={locked && lockedLabel ? `${label} · ${lockedLabel}` : label}
      aria-disabled={locked || undefined}
      title={locked ? lockedLabel : undefined}
      onClick={() => !locked && onChange?.(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-figma-out ${isOn ? "bg-deep-charcoal" : "bg-cool-gray"} ${locked ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <span
        className={`absolute top-0.5 flex size-5 items-center justify-center rounded-full transition-[inset-inline-start,background-color] duration-150 ease-figma-out ${isOn ? "start-[calc(100%-22px)] bg-neon-green" : "start-0.5 bg-white"}`}
      >
        {locked && <Icon name="lock" size={11} className="text-deep-charcoal" />}
      </span>
    </button>
  );
}

function SettingsCard({ id, title, sub, children }: { id?: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-[18px] rounded-[20px] border border-v3-card-stroke bg-white p-5 md:p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-h5 text-deep-charcoal">{title}</h2>
        {sub && <p className="text-body-s text-v3-text-meta">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function PrefRow({ p, lockedLabel, onChange }: { p: Pref & { on: boolean }; lockedLabel?: string; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <span className="text-label-l text-deep-charcoal">{p.title}</span>
        <span className="text-body-s text-v3-text-meta">{p.body}</span>
      </div>
      <Toggle on={p.on} locked={p.state === "locked"} label={p.title} lockedLabel={lockedLabel} onChange={onChange} />
    </div>
  );
}

// نفس طريقة LangSwitch في الهيدر: كوكي locale + NEXT_LOCALE واتجاه الصفحة
function applyLocale(next: Locale) {
  document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
}

const field = "w-full rounded-md border border-cool-gray bg-white px-3.5 py-3 text-body-m text-deep-charcoal outline-none placeholder:text-v3-text-meta focus:border-deep-charcoal";

// W2-72 · الإعدادات (753:9822) + P-01/P-02 (تغيير الرقم) · P-03a/P-03b (حذف الحساب) · P-10e/P-10m
export function SettingsForm({ locale, v }: { locale: Locale; v: SettingsView }) {
  const d = getAccountDict(locale);
  const t = d.settings;
  const pp = d.popups;
  const router = useRouter();
  const [toast, showToast] = useToast();
  const [phone, setPhone] = useState(v.phone);
  const [addresses, setAddresses] = useState(v.addresses);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...v.alerts, v.location].map((p) => [p.key, p.state !== "off"])),
  );
  const [popup, setPopup] = useState<null | "p01" | "p02" | "p03a" | "p03b">(null);
  // P-31a (إضافة) / P-31b·c (تعديل): key بيجدّد حالة النموذج كل ما يتفتح
  const [addressDialog, setAddressDialog] = useState<{ key: number; address: Address | null } | null>(null);
  const opts = v.addressOptions;
  const kindLabel = (a: Address) => (a.kind === "other" && a.name.trim() ? a.name.trim() : (opts.kinds.find((k) => k.key === a.kind)?.label ?? ""));
  const areaLabel = (a: Address) => {
    const city = opts.cities.find((c) => c.key === a.city);
    return [city?.districts.find((d) => d.key === a.district)?.label, city?.label].filter(Boolean).join(locale === "ar" ? "، " : ", ");
  };
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [agree, setAgree] = useState(false);
  const digits = useRef<(HTMLInputElement | null)[]>([]);
  const agreeBox = useRef<HTMLInputElement>(null);
  const close = () => setPopup(null);

  useEffect(() => {
    if (popup !== "p02" || seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [popup, seconds]);

  const fullNew = `+966 ${newPhone.trim() || pp.p01.placeholder}`;
  const setLang = (next: Locale) => {
    if (next === locale) return;
    applyLocale(next);
    router.refresh();
  };
  const typeDigit = (i: number, val: string) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    setCode((c) => c.map((x, j) => (j === i ? ch : x)));
    if (ch && i < 3) digits.current[i + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h3 text-deep-charcoal">{t.title}</h1>
        <p className="text-body-m text-state-gray">{t.subtitle}</p>
      </div>

      {/* بياناتي */}
      <SettingsCard title={t.profile}>
        <form
          className="flex flex-col gap-[18px]"
          onSubmit={(e) => {
            e.preventDefault();
            showToast(d.toasts.saved);
          }}
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-m text-deep-charcoal">{t.firstName}</span>
              <input name="first_name" defaultValue={v.firstName} autoComplete="given-name" className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-m text-deep-charcoal">{t.lastName}</span>
              <input name="last_name" defaultValue={v.lastName} autoComplete="family-name" className={field} />
            </label>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-m text-deep-charcoal">{t.phone}</span>
              <div className="flex items-center justify-between gap-3 rounded-md border border-cool-gray bg-tile px-3.5 py-3">
                <span dir="ltr" className="text-body-m text-deep-charcoal">
                  {phone}
                </span>
                <button type="button" onClick={() => setPopup("p01")} className="text-label-m text-nature-green hover:underline">
                  {t.change}
                </button>
              </div>
              <p className="text-caption text-v3-text-meta">{t.phoneNote}</p>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-m text-deep-charcoal">{t.email}</span>
              <span className="flex items-center gap-2 rounded-md border border-cool-gray bg-white px-3.5 focus-within:border-deep-charcoal">
                <input
                  name="email"
                  type="email"
                  defaultValue={v.email}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent py-3 text-body-m text-deep-charcoal outline-none placeholder:text-v3-text-meta"
                />
                <Icon name="mail" size={16} className="shrink-0 text-state-gray" />
              </span>
            </label>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="rounded-md bg-neon-green px-[18px] py-2.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
              {t.save}
            </button>
          </div>
        </form>
      </SettingsCard>

      {/* عناويني */}
      <SettingsCard title={t.addresses} sub={t.addressesSub}>
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-[14px] px-4 py-3.5 ${a.selected ? "border-[1.5px] border-deep-charcoal" : "border border-cool-gray"}`}
          >
            <button
              type="button"
              aria-pressed={a.selected}
              onClick={() => setAddresses((list) => list.map((x) => ({ ...x, selected: x.id === a.id })))}
              className="flex items-center gap-3 text-start"
            >
              <Icon name="map-pin" size={20} className={a.selected ? "text-nature-green" : "text-state-gray"} />
              <span className="flex flex-col">
                <span className="text-label-l text-deep-charcoal">{kindLabel(a)}</span>
                <span className="text-body-s text-v3-text-meta">{areaLabel(a)}</span>
              </span>
            </button>
            <span className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setAddressDialog({ key: Date.now(), address: a })}
                className="flex items-center gap-1.5 py-0.5 text-label-m text-nature-green hover:underline"
              >
                <Icon name="edit" size={16} className="text-nature-green" />
                {t.edit}
              </button>
              {a.selected && <span className="rounded-full bg-deep-charcoal px-3 py-1 text-caption text-neon-green">{t.selected}</span>}
            </span>
          </div>
        ))}
        <div className="flex">
          <button
            type="button"
            onClick={() => setAddressDialog({ key: Date.now(), address: null })}
            className="flex items-center gap-1.5 rounded-md border border-cool-gray bg-white px-[18px] py-2.5 text-label-m text-deep-charcoal hover:border-border-strong"
          >
            <Icon name="plus" size={16} />
            {t.addAddress}
          </button>
        </div>
      </SettingsCard>

      {/* التنبيهات */}
      <SettingsCard id="alerts" title={t.alerts}>
        {v.alerts.map((p) => (
          <PrefRow key={p.key} p={{ ...p, on: prefs[p.key] }} lockedLabel={t.lockedOn} onChange={(on) => setPrefs((s) => ({ ...s, [p.key]: on }))} />
        ))}
      </SettingsCard>

      {/* اللغة */}
      <SettingsCard title={t.language}>
        <div role="radiogroup" aria-label={t.language} className="flex flex-wrap gap-3">
          {(["ar", "en"] as Locale[]).map((l) => {
            const on = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={on}
                lang={l}
                onClick={() => setLang(l)}
                className={`flex items-center gap-2.5 rounded-md px-4 py-3 text-label-l text-deep-charcoal ${on ? "border-[1.5px] border-deep-charcoal" : "border border-cool-gray hover:border-border-strong"}`}
              >
                <span className={`flex size-5 items-center justify-center rounded-full border ${on ? "border-deep-charcoal bg-deep-charcoal" : "border-cool-gray bg-white"}`}>
                  {on && <span className="size-2 rounded-full bg-neon-green" />}
                </span>
                {l === "ar" ? "العربية" : "English"}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      {/* الخصوصية والحساب */}
      <SettingsCard title={t.privacy}>
        <PrefRow p={{ ...v.location, on: prefs[v.location.key] }} onChange={(on) => setPrefs((s) => ({ ...s, [v.location.key]: on }))} />
        <div className="h-px bg-cool-gray" />
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => showToast(d.toasts.dataFile, "download")}
            className="flex items-center gap-1.5 rounded-md border border-cool-gray bg-white px-[18px] py-2.5 text-label-m text-deep-charcoal hover:border-border-strong"
          >
            <Icon name="download" size={16} />
            {t.downloadData}
          </button>
          <button
            type="button"
            onClick={() => {
              setAgree(false);
              setPopup(v.openBookings.length ? "p03a" : "p03b");
            }}
            className="rounded-md border border-promotional-red bg-white px-[18px] py-2.5 text-label-m text-promotional-red hover:bg-promotional-red/5"
          >
            {t.deleteAccount}
          </button>
        </div>
        <p className="flex items-center gap-2.5 rounded-[20px] bg-tint-danger px-4 py-3 text-body-s text-deep-charcoal">
          <Icon name="alert" size={16} className="shrink-0" />
          {/* Figma (Delete rule 202:19453): النص بيلف سطرين و«التراجع.» في السطر التاني — خطنا أضيق بـ1px فبنحدّه على 1440 */}
          <span className="min-[1440px]:max-w-[860px]">{t.deleteRule}</span>
        </p>
      </SettingsCard>

      {/* P-31a · إضافة عنوان · P-31b/c · تعديل العنوان — بيحفظ في نفس حالة القائمة (تجريبي) */}
      {addressDialog && (
        <AddressPopup
          key={addressDialog.key}
          locale={locale}
          initial={addressDialog.address}
          opts={opts}
          onClose={() => setAddressDialog(null)}
          onSave={(a) => {
            setAddresses((list) => {
              const exists = list.some((x) => x.id === a.id);
              const next = exists ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
              // أول عنوان أو «استخدم هذا العنوان» ← هو المختار، والباقي لا
              const selectedId = a.selected || !next.some((x) => x.selected) ? a.id : null;
              return selectedId ? next.map((x) => ({ ...x, selected: x.id === selectedId })) : next;
            });
            setAddressDialog(null);
            showToast(t.addressForm.saved);
          }}
        />
      )}

      {/* P-01 · تغيير رقم الجوال */}
      <Popup open={popup === "p01"} onClose={close} title={pp.p01.title} closeLabel={d.close}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setCode(["", "", "", ""]);
            setSeconds(45);
            setPopup("p02");
          }}
        >
          <p className="text-body-s text-state-gray">{pp.p01.body}</p>
          <div className="flex flex-col gap-2">
            <span className="text-label-m text-deep-charcoal">{pp.p01.current}</span>
            <span dir="ltr" className="rounded-md bg-tile px-3.5 py-[13px] text-start text-body-m text-deep-charcoal">
              {phone}
            </span>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-label-m text-deep-charcoal">{pp.p01.next}</span>
            <span dir="ltr" className="flex items-center gap-2.5 rounded-md border border-deep-charcoal bg-white px-3.5 py-[13px]">
              <span className="rounded-sm bg-tile px-2 py-[3px] text-label-m text-deep-charcoal">+966</span>
              <input
                type="tel"
                inputMode="tel"
                autoFocus
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/[^\d ]/g, ""))}
                placeholder={pp.p01.placeholder}
                className="min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-v3-text-meta focus-visible:shadow-none"
              />
            </span>
          </label>
          <PopupActions>
            <button type="button" onClick={close} className={popupBtnClass.outline}>
              {d.cancel}
            </button>
            <button type="submit" className={popupBtnClass.primary}>
              {pp.p01.send}
            </button>
          </PopupActions>
        </form>
      </Popup>

      {/* P-02 · أدخل رمز التحقق */}
      <Popup open={popup === "p02"} onClose={close} title={pp.p02.title} closeLabel={d.close}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const empty = code.findIndex((c) => !c);
            if (empty > -1) return digits.current[empty]?.focus();
            setPhone(fullNew);
            close();
            showToast(d.toasts.saved);
          }}
        >
          <p className="text-body-s text-state-gray">{pp.p02.body(fullNew)}</p>
          <div dir="ltr" className="flex justify-end gap-3">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  digits.current[i] = el;
                }}
                value={c}
                onChange={(e) => typeDigit(i, e.target.value)}
                onKeyDown={(e) => e.key === "Backspace" && !c && i > 0 && digits.current[i - 1]?.focus()}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                autoFocus={i === 0}
                maxLength={1}
                aria-label={pp.p02.digit(i + 1)}
                className="size-16 min-w-0 rounded-[14px] border border-cool-gray bg-white text-center text-h3 text-deep-charcoal outline-none focus:border-deep-charcoal focus-visible:shadow-none!"
              />
            ))}
          </div>
          {seconds > 0 ? (
            <p className="text-caption text-state-gray">{pp.p02.resendIn(`0:${String(seconds).padStart(2, "0")}`)}</p>
          ) : (
            <button type="button" onClick={() => setSeconds(45)} className="self-start text-label-m text-nature-green hover:underline">
              {pp.p02.resend}
            </button>
          )}
          <PopupActions>
            <button type="button" onClick={() => setPopup("p01")} className={popupBtnClass.outline}>
              {pp.p02.edit}
            </button>
            <button type="submit" className={popupBtnClass.primary}>
              {pp.p02.confirm}
            </button>
          </PopupActions>
        </form>
      </Popup>

      {/* P-03a · لا يمكن حذف الحساب الآن */}
      <Popup open={popup === "p03a"} onClose={close} title={pp.p03a.title} closeLabel={d.close} icon="alert" iconTone="red">
        <p className="text-body-s text-state-gray">{pp.p03a.body(v.openBookings)}</p>
        <PopupActions>
          <button type="button" onClick={close} className={popupBtnClass.outline}>
            {d.close}
          </button>
          <Link href={routes.bookings("upcoming")} className={popupBtnClass.dark}>
            {pp.p03a.viewBookings}
          </Link>
        </PopupActions>
      </Popup>

      {/* P-03b · حذف الحساب نهائياً؟ */}
      <Popup open={popup === "p03b"} onClose={close} title={pp.p03b.title} closeLabel={d.close} icon="trash" iconTone="red">
        <form
          action={signOut}
          onSubmit={(e) => {
            if (!agree) {
              e.preventDefault();
              agreeBox.current?.focus();
            }
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-body-s text-state-gray">{pp.p03b.body(v.points)}</p>
          <label className="flex cursor-pointer items-center gap-2 text-body-s text-deep-charcoal">
            {/* Box 18 · r6 · حد #d9dedb (الفيجما) — المختار أحمر بعلامة صح */}
            <input ref={agreeBox} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden
              className="flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border border-cool-gray bg-white text-white peer-checked:border-promotional-red peer-checked:bg-promotional-red peer-focus-visible:shadow-focus-ring"
            >
              {agree && <Icon name="check" size={12} />}
            </span>
            {pp.p03b.confirm}
          </label>
          <PopupActions>
            <button type="button" onClick={close} className={popupBtnClass.outline}>
              {d.cancel}
            </button>
            <button type="submit" className={popupBtnClass.danger}>
              {pp.p03b.delete}
            </button>
          </PopupActions>
        </form>
      </Popup>
      {toast}
    </div>
  );
}

// P-31a · إضافة عنوان · P-31b/c · تعديل العنوان: نوع العنوان + المدينة/الحي (W2-DD) + «استخدم هذا العنوان»
function AddressPopup({
  locale,
  initial,
  opts,
  onClose,
  onSave,
}: {
  locale: Locale;
  initial: Address | null;
  opts: AddressOptions;
  onClose: () => void;
  onSave: (a: Address) => void;
}) {
  const d = getAccountDict(locale);
  const f = d.settings.addressForm;
  const [kind, setKind] = useState<AddressKind>(initial?.kind ?? "home");
  const [name, setName] = useState(initial?.name ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [selected, setSelected] = useState(initial?.selected ?? false);
  const districts = opts.cities.find((c) => c.key === city)?.districts ?? [];
  const ids = { city: "address-city", district: "address-district", name: "address-name" };

  return (
    <Popup open onClose={onClose} title={initial ? f.editTitle : f.addTitle} closeLabel={d.close}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ id: initial?.id ?? `addr-${Date.now()}`, kind, name: kind === "other" ? name.trim() : "", city, district, selected });
        }}
      >
        <div className="flex flex-col gap-2">
          <span className="text-label-m text-deep-charcoal">{f.kind}</span>
          <div role="radiogroup" aria-label={f.kind} className="flex flex-wrap gap-2">
            {opts.kinds.map((k) => (
              <button
                key={k.key}
                type="button"
                role="radio"
                aria-checked={kind === k.key}
                onClick={() => setKind(k.key)}
                className={`h-11 rounded-full px-4 text-label-m ${kind === k.key ? "bg-deep-charcoal text-neon-green" : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"}`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
        {kind === "other" && (
          <label htmlFor={ids.name} className="flex flex-col gap-1.5">
            <span className="text-label-m text-deep-charcoal">{f.name}</span>
            <input id={ids.name} value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={f.namePlaceholder} required className={field} />
          </label>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={ids.city} className="text-label-m text-deep-charcoal">
              {f.city}
            </label>
            <Dropdown
              id={ids.city}
              required
              placeholder={f.choose}
              searchPlaceholder={f.search}
              emptyLabel={f.noResults}
              value={city}
              options={opts.cities}
              onChange={(k) => {
                setCity(k);
                setDistrict("");
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={ids.district} className="text-label-m text-deep-charcoal">
              {f.district}
            </label>
            <Dropdown
              id={ids.district}
              required
              disabled={!city}
              placeholder={f.choose}
              searchPlaceholder={f.search}
              emptyLabel={f.noResults}
              value={district}
              options={districts}
              onChange={setDistrict}
            />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-body-s text-deep-charcoal">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
            className="size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-cool-gray bg-white bg-center bg-no-repeat checked:border-deep-charcoal checked:bg-deep-charcoal checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23abf907%22 stroke-width=%223%22><path d=%22M5 12l5 5L20 7%22/></svg>')] checked:bg-[length:14px]"
          />
          {f.makeSelected}
        </label>
        <PopupActions>
          <button type="button" onClick={onClose} className={popupBtnClass.outline}>
            {d.cancel}
          </button>
          <button type="submit" className={popupBtnClass.primary}>
            {f.save}
          </button>
        </PopupActions>
      </form>
    </Popup>
  );
}
