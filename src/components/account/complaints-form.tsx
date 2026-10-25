"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/lib/routes";
import { useAxToast } from "./account-extra-dialog";

export type PickerBookingView = { id: string; title: string; meta: string; note?: string; disabled?: boolean; logo: string; logoAlt: string };

export type ComplaintFormCopy = {
  step1Title: string;
  step1Text: string;
  otherBooking: string;
  bookingsNote: string;
  step2Title: string;
  step3Title: string;
  step3Text: string;
  step4Title: string;
  step4Text: string;
  submit: string;
  footer: string;
  photo: string;
  addPhoto: string;
  removePhoto: string;
  toastPhotoAdded: string;
  toastPhotoRemoved: string;
  draft: string;
  maxLength: number;
  charCount: string; // «{n} / {max}»
};

function Card({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-[20px] border border-cool-gray bg-white p-4 md:p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-h5 text-deep-charcoal">{title}</h2>
        {text && <p className="text-body-s text-state-gray">{text}</p>}
      </div>
      {children}
    </section>
  );
}

// دائرة الاختيار: كحلي بنقطة ليموني عند الاختيار (Box · 20)
function RadioDot({ on }: { on: boolean }) {
  return (
    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ease-figma-out ${on ? "border-deep-charcoal bg-deep-charcoal" : "border-cool-gray bg-white"}`}>
      {on && <span className="size-2 rounded-full bg-neon-green" />}
    </span>
  );
}

type Photo = { key: string; url?: string };

// «3. اشرح ما حدث» / «1. اكتب اقتراحك»: خانة وصف بعدّاد 500 + صور (إضافة P-10n / حذف P-10r)
function DescribeStep({ title, text, c }: { title: string; text: string; c: ComplaintFormCopy }) {
  const [value, setValue] = useState(c.draft);
  const [photos, setPhotos] = useState<Photo[]>([{ key: "p1" }, { key: "p2" }]);
  const file = useRef<HTMLInputElement>(null);
  const { show, node } = useAxToast();
  useEffect(() => () => photos.forEach((p) => p.url && URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Card title={title} text={text}>
      <div className="flex min-h-[120px] flex-col justify-between gap-2 rounded-md border-[1.5px] border-deep-charcoal bg-white px-4 py-3.5 focus-within:shadow-focus-ring">
        <textarea
          name="description"
          aria-label={title}
          required
          value={value}
          maxLength={c.maxLength}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="w-full resize-none bg-transparent text-body-m text-deep-charcoal outline-none focus-visible:shadow-none"
        />
        <span dir="ltr" className="self-end text-caption text-state-gray" aria-live="polite">
          {c.charCount.replace("{n}", String(value.length)).replace("{max}", String(c.maxLength))}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <span key={p.key} className="group relative flex size-[72px] items-center justify-center overflow-hidden rounded-md bg-cool-gray/50">
            {p.url ? <Image src={p.url} alt="" fill unoptimized className="object-cover" /> : <Icon name="camera" size={20} className="text-state-gray" />}
            <button
              type="button"
              aria-label={c.removePhoto}
              onClick={() => {
                if (p.url) URL.revokeObjectURL(p.url);
                setPhotos((cur) => cur.filter((x) => x.key !== p.key));
                show(c.toastPhotoRemoved);
              }}
              className="absolute top-1 end-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-deep-charcoal opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => file.current?.click()}
          aria-label={c.addPhoto}
          className="flex size-[72px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-nature-green text-caption text-green-active hover:bg-tint-lime"
        >
          <Icon name="plus" size={18} className="text-nature-green" />
          {c.photo}
        </button>
        <input
          ref={file}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            setPhotos((cur) => [...cur, ...files.map((f, i) => ({ key: `${Date.now()}-${i}`, url: URL.createObjectURL(f) }))]);
            show(c.toastPhotoAdded);
            e.target.value = "";
          }}
        />
      </div>
      {node}
    </Card>
  );
}

function Footer({ note, submit }: { note: string; submit: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-caption text-state-gray">{note}</p>
      <button type="submit" className="h-[50px] shrink-0 rounded-md bg-neon-green px-6 text-label-l text-deep-charcoal hover:bg-bg-brand-hover">
        {submit}
      </button>
    </div>
  );
}

// W2-69b · شكوى على حجز: الحجز (v2 · Complaint booking picker) → نوع المشكلة → الوصف والصور → الحل المفضّل
export function ComplaintForm({
  c,
  bookings,
  problems,
  resolutions,
}: {
  c: ComplaintFormCopy;
  bookings: PickerBookingView[];
  problems: { key: string; label: string }[];
  resolutions: { key: string; label: string }[];
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(bookings[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [problem, setProblem] = useState(problems[0]?.key ?? "");
  const [resolution, setResolution] = useState(resolutions[0]?.key ?? "");
  const q = query.trim().toLowerCase();
  const shown = q ? bookings.filter((b) => `${b.id} ${b.title}`.toLowerCase().includes(q)) : bookings;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(routes.complaints());
      }}
    >
      <Card title={c.step1Title} text={c.step1Text}>
        <div role="radiogroup" aria-label={c.step1Title} className="flex flex-col gap-3.5">
          {shown.map((b) => {
            const on = b.id === booking;
            return (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-disabled={b.disabled}
                onClick={() => !b.disabled && setBooking(b.id)}
                className={`flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 text-start transition-colors duration-150 ease-figma-out ${
                  on ? "border-[1.5px] border-deep-charcoal bg-tint-lime" : "border border-v3-card-stroke bg-white"
                } ${b.disabled ? "cursor-not-allowed opacity-60" : "hover:border-deep-charcoal"}`}
              >
                <RadioDot on={on} />
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cool-gray bg-white p-1">
                  <Image src={b.logo} alt={b.logoAlt} width={80} height={80} sizes="80px" className="size-full object-contain" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={`text-label-l ${b.disabled ? "text-v3-text-meta" : "text-deep-charcoal"}`}>{b.title}</span>
                  <span className="text-caption text-v3-text-meta">{b.meta}</span>
                  {b.note && <span className={`text-caption ${b.disabled ? "text-v3-text-meta" : "text-green-active"}`}>{b.note}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.otherBooking}
            aria-label={c.otherBooking}
            className="h-[54px] w-full rounded-md border border-cool-gray bg-white ps-3.5 pe-10 text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus:border-deep-charcoal focus-visible:shadow-none"
          />
          <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
        </div>
        <p className="text-caption text-state-gray">{c.bookingsNote}</p>
      </Card>

      <Card title={c.step2Title}>
        <div role="radiogroup" aria-label={c.step2Title} className="flex flex-wrap gap-2">
          {problems.map((p) => {
            const on = p.key === problem;
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setProblem(p.key)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-label-m transition-colors duration-150 ease-figma-out ${
                  on ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
                }`}
              >
                {on && <Icon name="check" size={14} />}
                {p.label}
              </button>
            );
          })}
        </div>
      </Card>

      <DescribeStep title={c.step3Title} text={c.step3Text} c={c} />

      <Card title={c.step4Title} text={c.step4Text}>
        <div role="radiogroup" aria-label={c.step4Title} className="flex flex-col gap-3.5 max-md:gap-0.5">
          {resolutions.map((r) => (
            <button
              key={r.key}
              type="button"
              role="radio"
              aria-checked={r.key === resolution}
              onClick={() => setResolution(r.key)}
              className="flex items-center gap-2.5 self-start text-body-m text-deep-charcoal max-md:min-h-10"
            >
              <RadioDot on={r.key === resolution} />
              {r.label}
            </button>
          ))}
        </div>
      </Card>

      <Footer note={c.footer} submit={c.submit} />
    </form>
  );
}

// W2-69c · اقتراح لتحسين لينكار: خطوة واحدة (الوصف والصور)
export function SuggestionForm({ c, stepTitle, stepText }: { c: ComplaintFormCopy; stepTitle: string; stepText: string }) {
  const router = useRouter();
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(routes.complaints("suggestions"));
      }}
    >
      <DescribeStep title={stepTitle} text={stepText} c={c} />
      <Footer note={c.footer} submit={c.submit} />
    </form>
  );
}
