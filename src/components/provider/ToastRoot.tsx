"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./Modal";

// غلاف صفحات مقدّم الخدمة: بيوفّر الرسائل السريعة P-10 لكل الأجزاء التفاعلية
export function ToastRoot({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
