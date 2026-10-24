import { cookies } from "next/headers";
import { demoUser, newUser } from "@/lib/data/user";
import type { DemoUser } from "@/lib/data/types";

// جلسة تجريبية لحد ما يتربط الـOTP الحقيقي في المرحلة 3:
// كوكي linkar_session = "user" (عميل حالي) أو "new" (عميل جديد بحالات فاضية)
export const SESSION_COOKIE = "linkar_session";

export async function getSession(): Promise<DemoUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (value === "user") return demoUser;
  if (value === "new") return newUser;
  return null;
}
