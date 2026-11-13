"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

// بيانات المستخدم وصلاحياته — تتجلب مرة عند الدخول (القسم 2.5)
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: api.me.get, staleTime: Infinity });
