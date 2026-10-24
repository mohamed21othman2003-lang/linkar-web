import { NextResponse } from "next/server";
import { getSearchPanelData } from "@/lib/server/search";

// بيانات لوحة البحث في الهيدر (W2-29) — بتتجاب أول ما اللوحة تتفتح
export async function GET() {
  return NextResponse.json(await getSearchPanelData());
}
