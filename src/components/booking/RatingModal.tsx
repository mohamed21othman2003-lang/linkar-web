"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { Icon } from "@/components/icons/Icon";
import { Modal, Toast } from "./Modal";
import { LogoTile } from "./LogoTile";

export type RatingCriterion = { key: string; label: string; value: number };

function Stars({ value, onChange, size, label }: { value: number; onChange: (v: number) => void; size: number; label: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-[3px]" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}/5`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="leading-none"
        >
          <Icon name={n <= shown ? "star-filled" : "star"} size={size} className={n <= shown ? "text-v3-rating-star" : "text-state-gray"} />
        </button>
      ))}
    </div>
  );
}

// W2-39 · تقييم الخدمة بعد اكتمالها مباشرة (من متابعة الحجز) — مكوّن قابل لإعادة الاستخدام
export function RatingModal({
  locale,
  open,
  onClose,
  onPublished,
  subtitle,
  provider,
  overall: initialOverall,
  criteria: initialCriteria,
  comment,
  publicName,
  points,
  complaintHref,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onPublished?: () => void;
  subtitle: string;
  provider: { slug: string; name: string; logo: string };
  overall: number;
  criteria: RatingCriterion[];
  comment: string;
  publicName: string;
  points: number;
  complaintHref: string;
}) {
  const t = getBookingDict(locale);
  const [overall, setOverall] = useState(initialOverall);
  const [criteria, setCriteria] = useState(initialCriteria);
  const [text, setText] = useState(comment);
  const [photos, setPhotos] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const toastDone = () => setToast(null);

  return (
    <>
      <Modal open={open} onClose={onClose} width={640} label={t.rateTitle} className="gap-5! sm:p-8!">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">{t.rateTitle}</h2>
            <p className="text-body-s text-text-secondary">{subtitle}</p>
          </div>
          <button type="button" aria-label={t.close} onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border-default hover:bg-tile">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-tile px-5 py-4">
          <div className="flex items-center gap-3">
            <LogoTile slug={provider.slug} src={provider.logo} alt={provider.name} size={44} />
            <div className="flex flex-col">
              <span className="text-caption text-text-secondary">{t.overall}</span>
              <span className="text-h5">{t.ratingWords[overall]}</span>
            </div>
          </div>
          <Stars value={overall} onChange={setOverall} size={30} label={t.overall} />
        </div>

        {criteria.map((c) => (
          <div key={c.key} className="flex items-center justify-between gap-3">
            <span className="text-body-m">{c.label}</span>
            <Stars value={c.value} size={20} label={c.label} onChange={(v) => setCriteria((list) => list.map((x) => (x.key === c.key ? { ...x, value: v } : x)))} />
          </div>
        ))}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.commentPh}
          rows={2}
          className="min-h-[83px] resize-none rounded-md border-[1.5px] border-deep-charcoal px-3.5 py-3 text-body-m outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => file.current?.click()}
            className="flex h-10 w-fit items-center gap-1.5 rounded-md border border-dashed border-nature-green px-3.5 text-label-m text-green-active hover:bg-tint-lime"
          >
            <Icon name="camera" size={16} className="text-nature-green" />
            {t.addPhotos}
          </button>
          {photos > 0 && <span className="text-caption text-text-secondary">+{photos}</span>}
          <input
            ref={file}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const n = e.target.files?.length ?? 0;
              if (n) {
                setPhotos((p) => p + n);
                setToast(t.photosAdded);
              }
            }}
          />
        </div>

        <p className="text-body-s leading-[22px] text-text-secondary">{t.fill(t.publicNote, { name: publicName, points })}</p>

        <div className="flex items-center justify-between gap-3 rounded-md bg-tile px-3.5 py-2.5">
          <span className="text-body-s">{t.haveNote}</span>
          <Link href={complaintHref} className="text-label-m text-green-active hover:underline">
            {t.openComplaint}
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setToast(t.published);
              onPublished?.();
            }}
            className="h-[46px] rounded-md bg-neon-green px-5 text-label-m transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
          >
            {t.publish}
          </button>
          <button type="button" onClick={onClose} className="h-12 rounded-md border border-border-default bg-white px-5 text-label-m hover:border-border-strong">
            {t.later}
          </button>
        </div>
      </Modal>
      <Toast message={toast} onDone={toastDone} />
    </>
  );
}
