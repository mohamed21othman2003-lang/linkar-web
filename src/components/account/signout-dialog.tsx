"use client";

import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { signOut } from "@/app/actions/session";
import { Popup, PopupActions, popupBtnClass } from "./account-dialog";

// P-06 · تسجيل الخروج؟ (833:19521) — من «تسجيل الخروج» في القائمة الجانبية للحساب
// اللغة بتتقري من <html lang> وقت الفتح (القائمة الجانبية مش بتستلم locale)
export function SignOutButton({ className, children }: { className?: string; children: ReactNode }) {
  const [locale, setLocale] = useState<Locale | null>(null);
  const d = locale ? getAccountDict(locale) : null;
  const close = () => setLocale(null);
  return (
    <>
      <button type="button" className={className} onClick={() => setLocale(document.documentElement.lang === "en" ? "en" : "ar")}>
        {children}
      </button>
      {d && (
        <Popup open onClose={close} title={d.popups.p06.title} closeLabel={d.close} icon="logout">
          <form action={signOut} className="flex flex-col gap-4">
            <p className="text-body-s text-state-gray">{d.popups.p06.body}</p>
            <PopupActions>
              <button type="button" onClick={close} className={popupBtnClass.outline}>
                {d.cancel}
              </button>
              <button type="submit" className={popupBtnClass.dark}>
                {d.popups.p06.confirm}
              </button>
            </PopupActions>
          </form>
        </Popup>
      )}
    </>
  );
}
