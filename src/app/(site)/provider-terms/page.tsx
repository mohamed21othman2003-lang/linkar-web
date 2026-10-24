import { PolicyPage, policyMetadata } from "@/components/policies/PolicyPage";

// W2-99e · شروط مقدّمي الخدمة (762:15822)
export const generateMetadata = () => policyMetadata("provider-terms");

export default function Page() {
  return <PolicyPage slug="provider-terms" />;
}
