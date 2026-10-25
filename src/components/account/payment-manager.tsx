"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { AxCloseButton, AxConfirm, AxDialog, useAxToast } from "./account-extra-dialog";

export type CardView = { id: string; brand: string; last4: string; expiry: string; holder: string; isDefault: boolean };
export type MethodView = { id: string; name: string; text: string; linked: boolean };
export type InvoiceView = { id: string; title: string; date: string; amount: string };

export type PaymentCopy = {
  addCard: string;
  cardsTitle: string;
  otherTitle: string;
  otherSubtitle: string;
  invoicesTitle: string;
  invoicesSubtitle: string;
  del: string;
  cancel: string;
  close: string;
  makeDefault: string;
  default: string;
  unlink: string;
  downloadPdf: string;
  deleteTitle: string;
  deleteText: string;
  deleteDefaultText: string;
  deleteConfirm: string;
  toastDefault: string;
  toastUnlinked: string;
  toastDownload: string;
  // W2-68b
  modalTitle: string;
  modalSubtitle: string;
  fields: { number: string; expiry: string; cvv: string; name: string };
  makeDefaultCard: string;
  modalNote: string;
  save: string;
  draft: { number: string; expiry: string; cvv: string; name: string };
};

const inputCls =
  "h-[54px] w-full rounded-md border border-cool-gray bg-white px-3.5 text-body-m text-deep-charcoal outline-none placeholder:text-text-tertiary focus:border-[1.5px] focus:border-deep-charcoal focus-visible:shadow-none!";

const checkCls =
  "size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-cool-gray bg-white bg-center bg-no-repeat checked:border-deep-charcoal checked:bg-deep-charcoal checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23abf907%22 stroke-width=%223%22><path d=%22M5 12l5 5L20 7%22/></svg>')] checked:bg-[length:14px]";

const label = (c: CardView) => `${c.brand} •••• ${c.last4}`;

function Section({ id, title, subtitle, aside, children }: { id: string; title: string; subtitle?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id={id} className="text-h4 text-deep-charcoal">
            {title}
          </h2>
          {subtitle && <p className="text-body-s text-state-gray">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

// W2-68b · نافذة «أضف بطاقة» (Modal 751:9746)
function AddCardDialog({ c, demo, onClose, onSave }: { c: PaymentCopy; demo?: boolean; onClose: () => void; onSave: (card: CardView, makeDefault: boolean) => void }) {
  const id = useId();
  // النموذج بيبدأ فاضي؛ ‎?demo=w2-68b‎ بيعرض قيم الفيجما بالظبط للمقارنة
  const [number, setNumber] = useState(demo ? c.draft.number : "");
  const [expiry, setExpiry] = useState(demo ? c.draft.expiry : "");
  const [cvv, setCvv] = useState(demo ? "123" : "");
  const [name, setName] = useState(demo ? c.draft.name : "");
  const [makeDefault, setMakeDefault] = useState(false);
  const digits = number.replace(/\D/g, "");
  return (
    <AxDialog open onClose={onClose} labelledBy={id} width={560} animate={false} shadow="shadow-[0_12px_24px_0_#0000002e]" className="p-5 md:p-8">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            { id: `card-${Date.now()}`, brand: digits.startsWith("4") ? "VISA" : "mada", last4: digits.slice(-4), expiry: expiry.replace(/\s/g, ""), holder: name.toUpperCase(), isDefault: false },
            makeDefault,
          );
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={id} className="text-h4 text-deep-charcoal">
              {c.modalTitle}
            </h2>
            <p className="text-body-s text-state-gray">{c.modalSubtitle}</p>
          </div>
          <AxCloseButton onClick={onClose} label={c.close} variant="square" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-n`} className="text-label-m text-deep-charcoal">
            {c.fields.number}
          </label>
          <div dir="ltr" className="relative">
            <input
              id={`${id}-n`}
              dir="ltr"
              inputMode="numeric"
              autoComplete="cc-number"
              required
              minLength={19}
              data-autofocus
              placeholder={c.draft.number}
              value={number}
              onChange={(e) => setNumber((e.target.value.replace(/\D/g, "").slice(0, 16).match(/.{1,4}/g) ?? []).join(" "))}
              className={`${inputCls} ps-10 rtl:text-end`}
            />
            <Icon name="card" size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-e`} className="text-label-m text-deep-charcoal">
              {c.fields.expiry}
            </label>
            <input
              id={`${id}-e`}
              dir="ltr"
              inputMode="numeric"
              autoComplete="cc-exp"
              required
              pattern="\d{2} / \d{2}"
              placeholder={c.draft.expiry}
              value={expiry}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExpiry(d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d);
              }}
              className={`${inputCls} rtl:text-end`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-c`} className="text-label-m text-deep-charcoal">
              {c.fields.cvv}
            </label>
            <div dir="ltr" className="relative">
              <input
                id={`${id}-c`}
                dir="ltr"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                required
                minLength={3}
                placeholder={c.draft.cvv}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={`${inputCls} ps-10 rtl:text-end`}
              />
              <Icon name="lock" size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-h`} className="text-label-m text-deep-charcoal">
            {c.fields.name}
          </label>
          <input id={`${id}-h`} dir="ltr" autoComplete="cc-name" required value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} uppercase rtl:text-end`} />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 self-start text-body-s text-deep-charcoal">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className={checkCls} />
          {c.makeDefaultCard}
        </label>
        <p className="flex items-start gap-2.5 rounded-[20px] bg-tile px-3.5 py-3 text-caption text-deep-charcoal">
          <Icon name="lock" size={14} className="mt-1 shrink-0" />
          {c.modalNote}
        </p>
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

// W2-68 · طرق الدفع: البطاقات المحفوظة (حذف P-05/P-05b، افتراضية P-10k، إضافة W2-68b)،
// وسائل الدفع الأخرى (إلغاء الربط P-10l)، والفواتير الضريبية (P-10d)
export function PaymentManager({
  title,
  security,
  c,
  cards: initialCards,
  methods: initialMethods,
  invoices,
  demo = false,
}: {
  demo?: boolean;
  title: ReactNode;
  security: ReactNode;
  c: PaymentCopy;
  cards: CardView[];
  methods: MethodView[];
  invoices: InvoiceView[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [methods, setMethods] = useState(initialMethods);
  const [adding, setAdding] = useState(demo);
  const [confirm, setConfirm] = useState<CardView | null>(null);
  const { show, node } = useAxToast();
  const nextDefault = confirm && cards.find((x) => x.id !== confirm.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {title}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-[42px] items-center gap-1.5 rounded-md bg-neon-green px-[18px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
        >
          <Icon name="plus" size={16} />
          {c.addCard}
        </button>
      </div>

      <Section id="pay-cards" title={c.cardsTitle}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <li key={card.id} className="flex flex-col gap-3">
              <div dir="ltr" className="flex flex-col gap-[18px] rounded-[18px] bg-linear-to-br from-deep-charcoal to-slate-blue p-[22px] text-white">
                <div className="flex items-center justify-between">
                  <span className="h-6 w-[34px] rounded-[6px] bg-neon-green/85" aria-hidden />
                  <span className="text-h4">{card.brand}</span>
                </div>
                <p className="text-h5">•••• •••• •••• {card.last4}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-label-m">{card.expiry}</span>
                  <span className="truncate text-caption text-white/80">{card.holder}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                {card.isDefault ? (
                  <span className="inline-flex h-[30px] items-center rounded-full bg-deep-charcoal px-3 text-caption text-neon-green">{c.default}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => (setCards((cur) => cur.map((x) => ({ ...x, isDefault: x.id === card.id }))), show(c.toastDefault))}
                    className="py-1 text-label-m text-green-active hover:underline max-md:py-[9px]"
                  >
                    {c.makeDefault}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirm(card)}
                  aria-label={`${c.del} ${label(card)}`}
                  className="inline-flex h-control-sm items-center rounded-md border border-promotional-red max-md:h-10 bg-white px-3 text-label-m text-promotional-red hover:bg-bg-danger-subtle"
                >
                  {c.del}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="pay-other" title={c.otherTitle} subtitle={c.otherSubtitle}>
        <ul className="flex flex-col gap-4 rounded-lg border border-cool-gray bg-white p-4 md:p-6">
          {methods.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-cool-gray px-1 py-4 md:h-20 md:px-5 md:py-0">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-cool-gray/35">
                  <Icon name="card" size={20} className="text-deep-charcoal" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-label-l text-deep-charcoal">{m.name}</span>
                  <span className="text-body-s text-state-gray">{m.text}</span>
                </div>
              </div>
              {m.linked && (
                <button
                  type="button"
                  onClick={() => (setMethods((cur) => cur.map((x) => (x.id === m.id ? { ...x, linked: false } : x))), show(c.toastUnlinked.replace("{name}", m.name)))}
                  className="inline-flex h-control-sm items-center rounded-md border border-cool-gray bg-white px-3 text-label-m text-deep-charcoal hover:bg-tile max-md:h-10"
                >
                  {c.unlink}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {security}

      {invoices.length > 0 && (
        <Section id="pay-invoices" title={c.invoicesTitle} subtitle={c.invoicesSubtitle}>
          <ul className="flex flex-col gap-4 rounded-lg border border-cool-gray bg-white p-4 md:p-6">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-cool-gray px-1 py-3.5 last:border-b-0 md:px-5">
                <div className="flex flex-col">
                  <span className="text-label-m text-deep-charcoal">{inv.title}</span>
                  <span className="text-caption text-state-gray">{inv.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => show(c.toastDownload, "download")} className="inline-flex items-center gap-1.5 py-1 text-label-m text-green-active hover:underline">
                    <Icon name="download" size={16} className="text-nature-green" />
                    {c.downloadPdf}
                  </button>
                  <span className="text-label-l whitespace-nowrap text-deep-charcoal">{inv.amount}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {adding && (
        <AddCardDialog
          c={c}
          demo={demo}
          onClose={() => setAdding(false)}
          onSave={(card, makeDefault) => {
            setCards((cur) => {
              const list = [...cur, { ...card, isDefault: cur.length === 0 }];
              return makeDefault ? list.map((x) => ({ ...x, isDefault: x.id === card.id })) : list;
            });
            setAdding(false);
          }}
        />
      )}
      {confirm && (
        <AxConfirm
          open
          onClose={() => setConfirm(null)}
          icon="card"
          title={c.deleteTitle.replace("{card}", `⁦${label(confirm)}⁩`)}
          text={confirm.isDefault && nextDefault ? c.deleteDefaultText.replace("{next}", `⁦${label(nextDefault)}⁩`) : c.deleteText}
          closeLabel={c.close}
          primary={{
            label: c.deleteConfirm,
            tone: "danger",
            onClick: () => {
              setCards((cur) => {
                const rest = cur.filter((x) => x.id !== confirm.id);
                return confirm.isDefault && rest.length ? rest.map((x, i) => ({ ...x, isDefault: i === 0 })) : rest;
              });
              setConfirm(null);
            },
          }}
          secondary={{ label: c.cancel, onClick: () => setConfirm(null) }}
        />
      )}
      {node}
    </>
  );
}
