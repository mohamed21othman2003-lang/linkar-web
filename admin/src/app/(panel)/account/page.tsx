import type { Metadata } from "next";
import { PageHead } from "@/components/panel/PageHead";
import { AccountView } from "./AccountView";

export const metadata: Metadata = { title: "حسابي" };

// CON5-24 · حسابي (3114-28658) — بتتفتح من قائمة المستخدم في الشريط العلوي
export default function AccountPage() {
  return (
    <>
      <PageHead title="حسابي" description="بياناتك وأمان حسابك في لوحة تحكم لينكار." />
      <AccountView />
    </>
  );
}
