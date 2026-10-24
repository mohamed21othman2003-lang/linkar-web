import { PolicyPage, policyMetadata } from "@/components/policies/PolicyPage";

// W2-99b · سياسة الخصوصية (762:14616)
export const generateMetadata = () => policyMetadata("privacy");

export default function Page() {
  return <PolicyPage slug="privacy" />;
}
