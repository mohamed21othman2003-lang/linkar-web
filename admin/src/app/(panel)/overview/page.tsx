import type { Metadata } from "next";
import { OverviewView } from "./_components/OverviewView";

export const metadata: Metadata = { title: "نظرة عامة" };

// CON5-01 · نظرة عامة (3114-65057) — الرئيسية بعد الدخول
export default function OverviewPage() {
  return <OverviewView />;
}
