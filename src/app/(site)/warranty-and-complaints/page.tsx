import { PolicyPage, policyMetadata } from "@/components/policies/PolicyPage";

// W2-99d · الضمان والشكاوى (762:15420)
export const generateMetadata = () => policyMetadata("warranty");

export default function Page() {
  return <PolicyPage slug="warranty" />;
}
