"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { api, can, type Action } from "./api";

// بيانات المستخدم وصلاحياته — تتجلب مرة عند الدخول (القسم 2.5)
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: api.me.get, staleTime: Infinity });

const noop = () => () => {};
/** صلاحية لإخفاء الأزرار: false على الخادم وأثناء الـhydration (عشان ما يحصلش اختلاف في الـHTML) وبعدها حسب «me» */
export function useCan(module: string, action: Action) {
  const { data: me } = useMe();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return hydrated && can(me, module, action);
}
