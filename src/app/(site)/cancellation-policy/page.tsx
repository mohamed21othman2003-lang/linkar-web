import { PolicyPage, policyMetadata } from "@/components/policies/PolicyPage";

// W2-99c · سياسة الإلغاء والاسترداد (762:15018) — مسودة، بانتظار اعتماد السياسة
export const generateMetadata = () => policyMetadata("cancellation");

export default function Page() {
  return <PolicyPage slug="cancellation" />;
}
