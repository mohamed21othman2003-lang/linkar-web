#!/usr/bin/env node
// فحص الصور في متصفح حقيقي: بيفتح كل صفحة (عربي/إنجليزي × زائر/عميل)، ينزل لآخرها عشان الصور الـlazy تحمّل،
// وبيطبع أي طلب صورة رجع بخطأ وأي <img> اتحمّلت فاضية (naturalWidth = 0).
// node scripts/img-check.mjs [--base https://linkar-web.vercel.app] [--list urls.txt] [--mobile] [--ar-only] [paths...]
import { chromium } from "playwright";

const args = process.argv.slice(2);
const bi = args.indexOf("--base");
const base = bi >= 0 ? args[bi + 1] : "http://localhost:3000";
const li = args.indexOf("--list");
const { readFileSync } = await import("node:fs");
const paths = li >= 0 ? readFileSync(args[li + 1], "utf8").split(/\r?\n/).filter(Boolean) : args.filter((a, i) => !a.startsWith("--") && i !== bi + 1);
const mobile = args.includes("--mobile");
const pages = paths.length
  ? paths
  : ["/", "/services", "/offers", "/packages", "/providers", "/search?services=polish", "/providers/johnson", "/providers/johnson/nano-ceramic",
     "/packages/xpel-new-car", "/about", "/contact", "/help", "/faq", "/business/providers", "/business/dealers", "/business/affiliates",
     "/business/corporate", "/login", "/account", "/account/bookings", "/account/favorites", "/account/points", "/account/payments",
     "/account/cars", "/account/notifications", "/booking/branch", "/gift/BK-21414", "/v/LK-9F3K-7QPD"];

const browser = await chromium.launch();
const problems = [];
const locales = args.includes("--ar-only") ? ["ar"] : ["ar", "en"];
for (const locale of locales) {
  for (const session of ["", "user"]) {
    const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
    const host = new URL(base).hostname;
    await ctx.addCookies([
      { name: "locale", value: locale, domain: host, path: "/" },
      ...(session ? [{ name: "linkar_session", value: session, domain: host, path: "/" }] : []),
    ]);
    await ctx.addInitScript(() => localStorage.setItem("linkar_location_prompt", "dismissed"));
    const page = await ctx.newPage();
    let current = "";
    page.on("response", (r) => {
      if (r.request().resourceType() === "image" && r.status() >= 400) problems.push(`${r.status()} ${r.url().replace(base, "")}  ← ${current} [${locale}/${session || "guest"}]`);
    });
    page.on("requestfailed", (r) => {
      if (r.resourceType() === "image") problems.push(`FAILED ${r.url().replace(base, "")} (${r.failure()?.errorText})  ← ${current} [${locale}/${session || "guest"}]`);
    });
    for (const p of pages) {
      current = p;
      await page.goto(base + p, { waitUntil: "networkidle" }).catch(() => {});
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 120));
        }
      });
      await page.waitForLoadState("networkidle").catch(() => {});
      const broken = await page.evaluate(() =>
        [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src")),
      );
      for (const b of broken) problems.push(`EMPTY <img> ${b}  ← ${p} [${locale}/${session || "guest"}]`);
    }
    await ctx.close();
  }
}
await browser.close();
const uniq = [...new Set(problems)];
console.log(uniq.length ? `PROBLEMS (${uniq.length}):\n  ` + uniq.join("\n  ") : "OK — every image loaded");
