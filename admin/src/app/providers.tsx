"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";

// TanStack Query لكل جلب البيانات (القسم 2.1) — دلوقتي من طبقة بيانات تجريبية بنفس شكل الـAPI
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
