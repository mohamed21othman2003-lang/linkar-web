"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/lib/routes";
import { AxCloseButton, AxConfirm, AxDialog, useAxToast } from "./account-extra-dialog";
import { AxEmpty } from "./account-extra-ui";

export type CarView = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  color: string;
  size: string;
  plateLetters: string;
  plateNumbers: string;
  lastBooking: string;
  isDefault: boolean;
  upcomingBooking?: string;
};

export type CarsCopy = {
  addCar: string;
  emptyTitle: string;
  emptyText: string;
  lastBooking: string;
  lockNote: string;
  specs: { size: string; plate: string; color: string };
  edit: string;
  del: string;
  cancel: string;
  close: string;
  makeDefault: string;
  default: string;
  toastDefault: string;
  // P-04 / P-04b
  deleteTitle: string;
  deleteText: string;
  deleteConfirm: string;
  lockedTitle: string;
  lockedText: string;
  lockedCta: string;
  // W2-67b
  modalTitle: string;
  modalEditTitle: string;
  modalSubtitle: string;
  fields: { make: string; model: string; year: string; color: string; plateNumbers: string; plateLetters: string };
  sizeDetected: string;
  selectPlaceholder: string;
  sizeChange: string;
  makeDefaultCar: string;
  save: string;
};

export type CarOptions = {
  makes: { key: string; label: string; models: { key: string; label: string; size: string }[] }[];
  colors: { key: string; label: string }[];
  years: number[];
  sizes: { key: string; label: string }[];
  draft: { make: string; model: string; year: number; color: string; plateNumbers: string; plateLetters: string };
};

const inputCls =
  "h-[54px] w-full rounded-md border border-cool-gray bg-white px-3.5 text-body-m text-deep-charcoal outline-none focus:border-[1.5px] focus:border-deep-charcoal focus-visible:shadow-none!";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  placeholder,
  required = true,
  autoFocus = false,
  children,
}: {
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  autoFocus?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value || ""}
        required={required}
        data-autofocus={autoFocus || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pe-10 invalid:text-text-tertiary`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
    </div>
  );
}

// «Popup · Btn · تغيير» داخل صندوق الحجم: قائمة صغيرة بالأحجام الثلاثة
function SizeMenu({ label, sizes, value, onChange }: { label: string; sizes: { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={wrap} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="py-0.5 text-label-m text-green-active hover:underline">
        {label}
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 top-full z-20 mt-2 flex w-48 flex-col gap-0.5 rounded-lg border border-cool-gray bg-white p-2 shadow-dialog">
          {sizes.map((s) => (
            <li key={s.key} role="option" aria-selected={s.key === value}>
              <button
                type="button"
                onClick={() => (onChange(s.key), setOpen(false))}
                className={`flex h-11 w-full items-center justify-between rounded-[10px] px-3 text-start hover:bg-tile ${s.key === value ? "bg-tile text-label-l" : "text-body-m"}`}
              >
                {s.label}
                {s.key === value && <Icon name="check" size={16} className="text-nature-green" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// W2-67b · نافذة «أضف سيارة» (Modal 751:10517) — وبنفس الشكل للتعديل
function CarDialog({
  open,
  onClose,
  onSave,
  c,
  o,
  initial,
  demo = false,
}: {
  open: boolean;
  onClose: () => void;
  demo?: boolean;
  onSave: (v: { make: string; model: string; year: number; color: string; size: string; plateNumbers: string; plateLetters: string; makeDefault: boolean }) => void;
  c: CarsCopy;
  o: CarOptions;
  initial: (CarOptions["draft"] & { size?: string; isDefault?: boolean; editing: boolean }) | null;
}) {
  const id = useId();
  // نموذج الإضافة بيبدأ فاضي؛ ‎?demo=w2-67b‎ بيعرض قيم الفيجما بالظبط للمقارنة
  const d = initial ?? (demo ? { ...o.draft, editing: false } : { make: "", model: "", year: 0, color: "", plateNumbers: "", plateLetters: "", editing: false });
  const [make, setMake] = useState(d.make);
  const [model, setModel] = useState(d.model);
  const [year, setYear] = useState(d.year);
  const [color, setColor] = useState(d.color);
  const [numbers, setNumbers] = useState(d.plateNumbers);
  const [letters, setLetters] = useState(d.plateLetters);
  const models = o.makes.find((m) => m.key === make)?.models ?? [];
  const autoSize = models.find((m) => m.key === model)?.size ?? "";
  const [size, setSize] = useState(d.size ?? autoSize);
  const [makeDefault, setMakeDefault] = useState(!!d.isDefault);
  const sizeLabel = o.sizes.find((s) => s.key === size)?.label ?? "";

  return (
    <AxDialog open={open} onClose={onClose} labelledBy={id} width={600} animate={false} shadow="shadow-[0_12px_24px_0_#0000002e]" className="p-5 md:p-8">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ make, model, year, color, size, plateNumbers: numbers.trim(), plateLetters: letters.trim(), makeDefault });
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={id} className="text-h4 text-deep-charcoal">
              {d.editing ? c.modalEditTitle : c.modalTitle}
            </h2>
            <p className="text-body-s text-state-gray">{c.modalSubtitle}</p>
          </div>
          <AxCloseButton onClick={onClose} label={c.close} variant="square" />
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field label={c.fields.make} htmlFor={`${id}-make`}>
            <Select
              id={`${id}-make`}
              placeholder={c.selectPlaceholder}
              value={make}
              onChange={(v) => {
                setMake(v);
                const first = o.makes.find((m) => m.key === v)?.models[0];
                if (first) {
                  setModel(first.key);
                  setSize(first.size);
                }
              }}
            >
              {o.makes.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.fields.model} htmlFor={`${id}-model`}>
            <Select
              id={`${id}-model`}
              placeholder={c.selectPlaceholder}
              autoFocus={demo}
              value={model}
              onChange={(v) => (setModel(v), setSize(models.find((m) => m.key === v)?.size ?? size))}
            >
              {models.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.fields.year} htmlFor={`${id}-year`}>
            <Select id={`${id}-year`} placeholder={c.selectPlaceholder} value={year} onChange={(v) => setYear(Number(v))}>
              {o.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.fields.color} htmlFor={`${id}-color`}>
            <Select id={`${id}-color`} placeholder={c.selectPlaceholder} required={false} value={color} onChange={setColor}>
              {o.colors.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.fields.plateNumbers} htmlFor={`${id}-num`}>
            <input
              id={`${id}-num`}
              value={numbers}
              onChange={(e) => setNumbers(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              required
              className={inputCls}
            />
          </Field>
          <Field label={c.fields.plateLetters} htmlFor={`${id}-let`}>
            <input id={`${id}-let`} value={letters} onChange={(e) => setLetters(e.target.value.slice(0, 7))} required className={inputCls} />
          </Field>
        </div>
        {size && (
        <div className="flex items-center justify-between gap-2.5 rounded-[20px] border border-neon-green/60 bg-tint-lime px-4 py-3">
          <p className="flex items-center gap-2 text-label-m text-green-active">
            <Icon name="car" size={18} className="shrink-0 text-nature-green" />
            {c.sizeDetected.replace("{size}", sizeLabel)}
          </p>
          <SizeMenu label={c.sizeChange} sizes={o.sizes} value={size} onChange={setSize} />
        </div>
        )}
        <label className="flex cursor-pointer items-center gap-2.5 self-start text-body-s text-deep-charcoal">
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
            className="size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-cool-gray bg-white bg-center bg-no-repeat checked:border-deep-charcoal checked:bg-deep-charcoal checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23abf907%22 stroke-width=%223%22><path d=%22M5 12l5 5L20 7%22/></svg>')] checked:bg-[length:14px]"
          />
          {c.makeDefaultCar}
        </label>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button type="submit" className="h-[46px] rounded-md bg-neon-green px-[22px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
            {c.save}
          </button>
          <button type="button" onClick={onClose} className="h-12 rounded-md border border-cool-gray bg-white px-[22px] text-label-m text-deep-charcoal hover:bg-tile">
            {c.cancel}
          </button>
        </div>
      </form>
    </AxDialog>
  );
}

// W2-67 · سياراتي: الكروت + «أضف سيارة» (W2-67b) + تعديل + حذف (P-04 / P-04b) + «اجعلها الافتراضية» (P-10k)
export function CarsManager({
  title,
  initial,
  c,
  o,
  demo = false,
  children,
}: {
  title: ReactNode;
  initial: CarView[];
  c: CarsCopy;
  o: CarOptions;
  demo?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [cars, setCars] = useState(initial);
  const [dialog, setDialog] = useState<{ key: number; car: CarView | null; demo?: boolean } | null>(demo ? { key: 0, car: null, demo: true } : null);
  const [confirm, setConfirm] = useState<CarView | null>(null);
  const { show, node } = useAxToast();

  const label = (kind: "makes" | "colors", key: string) => (kind === "makes" ? o.makes.find((m) => m.key === key)?.label : o.colors.find((m) => m.key === key)?.label) ?? key;
  const modelLabel = (make: string, model: string) => o.makes.find((m) => m.key === make)?.models.find((m) => m.key === model)?.label ?? model;
  const sizeLabel = (k: string) => o.sizes.find((s) => s.key === k)?.label ?? k;
  const setDefault = (id: string) => (setCars((cur) => cur.map((x) => ({ ...x, isDefault: x.id === id }))), show(c.toastDefault));
  const locked = (car: CarView) => car.isDefault && !!car.upcomingBooking;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {title}
        <button
          type="button"
          onClick={() => setDialog({ key: Date.now(), car: null })}
          className="inline-flex h-[42px] items-center gap-1.5 rounded-md bg-neon-green px-[18px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
        >
          <Icon name="plus" size={16} />
          {c.addCar}
        </button>
      </div>

      {/* W2-67-0 (85:44968): من غير سيارات — كارت فاضي بس، و«أضف سيارة» بيفتح W2-67b */}
      {cars.length === 0 ? (
        <AxEmpty icon="car" title={c.emptyTitle} text={c.emptyText} cta={{ label: c.addCar, onClick: () => setDialog({ key: Date.now(), car: null }) }} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cars.map((car) => (
            <li key={car.id} className="flex flex-col gap-3 rounded-[20px] border border-cool-gray bg-white p-[22px]">
              <div className="flex items-center justify-between gap-3">
                <span className={`flex size-12 items-center justify-center rounded-[14px] ${car.isDefault ? "bg-neon-green" : "bg-cool-gray/40"}`}>
                  <Icon name="car" size={24} className={car.isDefault ? "text-deep-charcoal" : "text-state-gray"} />
                </span>
                {car.isDefault ? (
                  <span className="inline-flex h-[30px] items-center rounded-full bg-deep-charcoal px-3 text-caption text-neon-green">{c.default}</span>
                ) : (
                  <button type="button" onClick={() => setDefault(car.id)} className="py-1 text-label-m text-green-active hover:underline max-md:py-[9px]">
                    {c.makeDefault}
                  </button>
                )}
              </div>
              <h2 className="text-h4 text-deep-charcoal">{car.name}</h2>
              <dl className="flex flex-wrap gap-2">
                {[
                  [c.specs.size, sizeLabel(car.size)],
                  [c.specs.plate, `${car.plateLetters} · ${car.plateNumbers}`],
                  [c.specs.color, label("colors", car.color)],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col rounded-md bg-cool-gray/30 px-3 py-2">
                    <dt className="text-caption text-state-gray">{k}</dt>
                    <dd className="text-label-m text-deep-charcoal">{v}</dd>
                  </div>
                ))}
              </dl>
              {car.lastBooking && (
                <p className="text-body-s text-state-gray">
                  {c.lastBooking} {car.lastBooking}
                </p>
              )}
              <span className="h-px bg-cool-gray" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDialog({ key: Date.now(), car })}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-cool-gray bg-white px-3.5 text-label-m text-deep-charcoal hover:bg-tile"
                >
                  <Icon name="edit" size={16} />
                  {c.edit}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(car)}
                  aria-disabled={locked(car)}
                  className={`inline-flex h-10 items-center rounded-md px-3.5 text-label-m ${
                    locked(car) ? "bg-icon-tile text-state-gray" : "border border-promotional-red bg-white text-promotional-red hover:bg-bg-danger-subtle"
                  }`}
                >
                  {c.del}
                </button>
              </div>
              {locked(car) && (
                <p className="flex items-center gap-1.5 text-caption text-state-gray">
                  <Icon name="lock" size={14} className="shrink-0" />
                  {c.lockNote}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {cars.length > 0 && children}

      {dialog && (
        <CarDialog
          key={dialog.key}
          open
          demo={dialog.demo}
          c={c}
          o={o}
          onClose={() => setDialog(null)}
          initial={
            dialog.car
              ? {
                  make: dialog.car.make,
                  model: dialog.car.model,
                  year: dialog.car.year,
                  color: dialog.car.color,
                  plateNumbers: dialog.car.plateNumbers,
                  plateLetters: dialog.car.plateLetters,
                  size: dialog.car.size,
                  isDefault: dialog.car.isDefault,
                  editing: true,
                }
              : null
          }
          onSave={(v) => {
            const name = `${label("makes", v.make)} ${modelLabel(v.make, v.model)} ${v.year}`;
            setCars((cur) => {
              const editing = dialog.car;
              const base: CarView = editing
                ? { ...editing, ...v, name }
                : { id: `car-${Date.now()}`, name, ...v, lastBooking: "", isDefault: false };
              const list = editing ? cur.map((x) => (x.id === editing.id ? base : x)) : [...cur, base];
              return v.makeDefault ? list.map((x) => ({ ...x, isDefault: x.id === base.id })) : list;
            });
            setDialog(null);
          }}
        />
      )}

      {confirm && !locked(confirm) && (
        <AxConfirm
          open
          onClose={() => setConfirm(null)}
          icon="car"
          title={c.deleteTitle.replace("{car}", confirm.name)}
          text={c.deleteText}
          closeLabel={c.close}
          primary={{ label: c.deleteConfirm, tone: "danger", onClick: () => (setCars((cur) => cur.filter((x) => x.id !== confirm.id)), setConfirm(null)) }}
          secondary={{ label: c.cancel, onClick: () => setConfirm(null) }}
        />
      )}
      {confirm && locked(confirm) && (
        <AxConfirm
          open
          onClose={() => setConfirm(null)}
          icon="alert"
          title={c.lockedTitle}
          text={(() => {
            const [before, after = ""] = c.lockedText.replace("{car}", confirm.name).split("{booking}");
            return (
              <>
                {before}
                <span className="whitespace-nowrap">
                  (<bdi>{confirm.upcomingBooking}</bdi>)
                </span>
                {after}
              </>
            );
          })()}
          closeLabel={c.close}
          primary={{ label: c.lockedCta, tone: "dark", onClick: () => router.push(routes.bookings()) }}
          secondary={{ label: c.close, onClick: () => setConfirm(null) }}
        />
      )}
      {node}
    </>
  );
}
