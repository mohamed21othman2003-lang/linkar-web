import { PolicyPage, policyMetadata } from "@/components/policies/PolicyPage";

// W2-99 · الشروط والأحكام (762:14207)
export const generateMetadata = () => policyMetadata("terms");

export default function Page() {
  return <PolicyPage slug="terms" />;
}
