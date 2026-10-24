#!/usr/bin/env node
// لقطة شاشة لصفحة من السيرفر المحلي للمقارنة مع الفيجما (القسم 7 في الـbrief).
// node scripts/shot.mjs <path> <out.png> [--width 1440] [--locale ar|en] [--session user|new] [--viewport] [--freeze <ms>] [--base http://localhost:3000]
// الافتراضي: لقطة للصفحة كاملة بعرض 1440، عربي، زائر.
import { chromium } from "playwright";

const args = process.argv.slice(2);
const [rawPath, out] = args;
// Git Bash بيحوّل "/services" لـ "C:/Program Files/Git/services" — نرجّعه زي ما كان، ونقبل المسار من غير "/" في الأول
const path = rawPath ? "/" + rawPath.replace(/^[A-Za-z]:\/.*?\/Git\//, "").replace(/^\/+/, "") : rawPath;
if (!path || !out) {
  console.error("usage: node scripts/shot.mjs <path> <out.png> [--width 1440] [--locale ar|en] [--session user|new] [--viewport]");
  process.exit(1);
}
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : def;
};
const width = Number(opt("width", "1440"));
const locale = opt("locale", "ar");
const session = opt("session", "");
const base = opt("base", "http://localhost:3000");
const fullPage = !args.includes("--viewport");

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height: width <= 500 ? 844 : 900 }, deviceScaleFactor: 1 });
const url = new URL(base);
const cookies = [{ name: "locale", value: locale, domain: url.hostname, path: "/" }];
if (session) cookies.push({ name: "linkar_session", value: session, domain: url.hostname, path: "/" });
await context.addCookies(cookies);
// --first-visit: يسيب نافذة السماح بالموقع تظهر (أول زيارة)؛ الافتراضي نخفيها عشان ماتغطّيش الصفحة
if (!args.includes("--first-visit")) {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("linkar_location_prompt", "dismissed");
    } catch {}
  });
}
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
// الفريمات في الفيجما ثابتة: نثبّت الهيدر والعناصر اللازقة في مكانها الطبيعي عشان اللقطة الكاملة تبقى زيها
await page.addStyleTag({ content: ".sticky{position:relative!important;top:auto!important}" });
// نمرّ على الصفحة كلها عشان الصور اللي بتتحمّل عند الوصول ليها (loading="lazy") تظهر في اللقطة
if (fullPage) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForLoadState("networkidle");
}
await page.waitForTimeout(300);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
// --freeze: يوقّف كل الحركات (CSS + Web Animations اللي motion بيستخدمها) عند لحظة معيّنة بالمللي ثانية
// عشان اللقطة تبقى ثابتة وقابلة للمقارنة (الافتراضي 0 = أول الدورة)
if (args.includes("--freeze")) {
  const at = Number(opt("freeze", "0")) || 0;
  await page.evaluate((t) => {
    for (const a of document.getAnimations()) {
      try {
        a.pause();
        a.currentTime = t;
      } catch {}
    }
  }, at);
  await page.waitForTimeout(100);
}
await page.screenshot({ path: out, fullPage });
console.log(JSON.stringify({ status: res?.status(), url: page.url(), overflowX: overflow, consoleErrors: errors }));
await browser.close();
