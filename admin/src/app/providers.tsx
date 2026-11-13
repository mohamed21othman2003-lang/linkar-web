"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { isApiError } from "@/lib/api";

// TanStack Query لكل جلب البيانات (القسم 2.1) — دلوقتي من طبقة بيانات تجريبية بنفس شكل الـAPI
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // 4xx (مش موجود، مش مسموح) مابيتعادش — الرسالة تظهر على طول. أخطاء الشبكة/الخادم بتتعاد مرتين.
            retry: (count, err) => !(isApiError(err) && err.status >= 400 && err.status < 500) && count < 2,
          },
        }, }),
  );
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
