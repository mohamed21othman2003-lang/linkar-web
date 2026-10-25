#!/usr/bin/env node
// فحص الـresponsive: بيفتح كل قوالب الصفحات على مقاسات شاشات كتير ويطلّع:
//   overflow   — الصفحة أعرض من الشاشة (سكرول أفقي)
//   offscreen  — عنصر طالع برّه الشاشة (مش جوه حاوية سكرول/قص)
//   overlap    — نصّين راكبين على بعض
//   clipped    — نص متقصوص جوه عنصر overflow hidden (من غير ellipsis أو line-clamp)
// وبيحفظ لقطة كاملة لكل صفحة في .claude/figma-refs/resp/<width>/ للمراجعة بالعين.
// node scripts/resp-check.mjs [--base http://localhost:3000] [--widths 390,768] [--only /account] [--locale en] [--no-shots]
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const base = opt("base", "http://localhost:3000");
const widths = opt("widths", "360,390,768,1024,1150,1280,1440,1920").split(",").map(Number);
// Git Bash بيحوّل "/account" لـ "C:/Program Files/Git/account" — نرجّعه زي ما كان
const rawOnly = opt("only", "");
const only = rawOnly ? "/" + rawOnly.replace(/^[A-Za-z]:\/.*?\/Git\//, "").replace(/^\/+/, "") : "";
const locale = opt("locale", "ar");
const shots = !args.includes("--no-shots");

const guest = [
  "/", "/services", "/search?services=polish", "/search?services=polish,nano-ceramic", "/search?services=polish&view=map",
  "/providers", "/providers?view=map", "/providers/johnson", "/providers/johnson?tab=packages", "/providers/johnson/nano-ceramic",
  "/offers", "/packages", "/packages/xpel-new-car", "/about", "/contact", "/help", "/faq", "/terms", "/cancellation-policy",
  "/business/providers", "/business/providers/join", "/business/dealers", "/business/dealers/join", "/business/join/sent",
  "/business/corporate", "/business/affiliates", "/business/affiliates/join", "/business/affiliates/join/sent",
  "/login", "/login/verify?phone=551234567", "/login/email", "/forgot-password", "/forgot-password/sent", "/reset-password",
  "/gift/BK-21414", "/v/LK-9F3K-7QPD", "/booking/branch", "/does-not-exist",
];
const user = [
  "/", "/account", "/account/bookings", "/account/bookings/BK-21452", "/account/bookings/BK-21388", "/account/bookings/BK-21452/voucher",
  "/account/favorites", "/account/points", "/account/dealer-packages", "/account/cars", "/account/payment-methods",
  "/account/complaints", "/account/complaints/new", "/account/reviews", "/account/settings", "/account/notifications",
  "/booking/branch", "/booking/details", "/booking/payment", "/booking/confirmed",
];
const pages = [...guest.map((p) => ({ p, s: "" })), ...user.map((p) => ({ p, s: "user" }))].filter(({ p }) => !only || p.startsWith(only));

const detect = () => {
  const vw = window.innerWidth;
  const out = { overflow: 0, offscreen: [], overlap: [], clipped: [] };
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) out.overflow = sw - vw;
  const name = (el) => {
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
    const txt = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `<${el.tagName.toLowerCase()}${cls ? "." + cls : ""}> "${txt}"`;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05;
  };
  const hiddenTree = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      if (a.getAttribute("aria-hidden") === "true" || a.hasAttribute("inert")) return true;
      const cs = getComputedStyle(a);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return true;
      if (cs.position === "fixed" && a.getBoundingClientRect().right <= 0) return true;
    }
    return false;
  };
  const clippedBy = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) return a;
    }
    return null;
  };
  // offscreen: أبعد عنصر طالع برّه الشاشة ومش جوه حاوية بتقصّه
  const reported = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    if ([...reported].some((p) => p.contains(el))) continue;
    if (hiddenTree(el) || clippedBy(el)) continue;
    reported.add(el);
    out.offscreen.push(`${name(el)} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
  }
  // نصوص: مستطيل كل text node ظاهر
  const boxes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION", "TEXTAREA"].includes(el.tagName)) continue;
    if (!visible(el) || hiddenTree(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 3 || r.height < 3) continue;
      boxes.push({ el, r, clip: clippedBy(el) });
    }
  }
  const seen = new Set();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w < 4 || h < 4) continue;
      const area = w * h, minA = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (area < minA * 0.25) continue;
      // النص المقصوص جوه حاوية مش ظاهر — نتأكد إن التقاطع جوه حدود الحاوية
      const inClip = (x) => !x.clip || (() => { const c = x.clip.getBoundingClientRect(); return !(c.right < Math.max(a.r.left, b.r.left) || c.left > Math.min(a.r.right, b.r.right) || c.bottom < Math.max(a.r.top, b.r.top) || c.top > Math.min(a.r.bottom, b.r.bottom)); })();
      if (!inClip(a) || !inClip(b)) continue;
      const key = name(a.el) + "|" + name(b.el);
      if (seen.has(key)) continue;
      seen.add(key);
      out.overlap.push(`${name(a.el)} × ${name(b.el)} @y=${Math.round(a.r.top + scrollY)}`);
    }
  }
  // نص متقصوص
  for (const el of document.body.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (!/(hidden|clip)/.test(cs.overflowX) && !/(hidden|clip)/.test(cs.overflow)) continue;
    if (cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none" || cs.lineClamp && cs.lineClamp !== "none") continue;
    if (!el.innerText || !el.innerText.trim() || hiddenTree(el)) continue;
    if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0 && getComputedStyle(el).overflowX !== "auto") {
      // بس لو النص نفسه هو اللي طالع (مش صورة/زينة)
      const texts = [...el.querySelectorAll("*"), el].filter((x) => [...x.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()));
      const er = el.getBoundingClientRect();
      const out1 = texts.some((x) => { const r = x.getBoundingClientRect(); return r.right > er.right + 2 || r.left < er.left - 2; });
      if (out1) out.clipped.push(`${name(el)} scroll=${el.scrollWidth} client=${el.clientWidth}`);
    }
  }
  return out;
};

const browser = await chromium.launch();
const report = {};
let issues = 0;
for (const w of widths) {
  const dir = `.claude/figma-refs/resp/${w}`;
  if (shots) mkdirSync(dir, { recursive: true });
  for (const s of ["", "user"]) {
    const list = pages.filter((x) => x.s === s);
    if (!list.length) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, ...(w < 768 ? { isMobile: true, hasTouch: true } : {}) });
    const host = new URL(base).hostname;
    await ctx.addCookies([
      { name: "locale", value: locale, domain: host, path: "/" },
      ...(s ? [{ name: "linkar_session", value: s, domain: host, path: "/" }] : []),
    ]);
    await ctx.addInitScript(() => localStorage.setItem("linkar_location_prompt", "dismissed"));
    const page = await ctx.newPage();
    for (const { p } of list) {
      await page.goto(base + p, { waitUntil: "networkidle" }).catch(() => {});
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(250);
      const r = await page.evaluate(detect);
      if (process.env.RESP_DEBUG) console.log(p, w, JSON.stringify(r).slice(0, 200));
      const key = `${p}${s ? " [user]" : ""}`;
      const n = (r.overflow ? 1 : 0) + r.offscreen.length + r.overlap.length + r.clipped.length;
      if (n) {
        report[key] ??= {};
        report[key][w] = r;
        issues += n;
      }
      if (shots) {
        const file = `${dir}/${(s ? "u" : "g")}${p.replace(/[/?&=,]+/g, "_") || "_home"}.png`;
        await page.screenshot({ path: file, fullPage: true }).catch(() => {});
      }
    }
    await ctx.close();
  }
  console.log(`width ${w}: done`);
}
await browser.close();
writeFileSync(".claude/figma-refs/resp/report.json", JSON.stringify(report, null, 1));
console.log(`pages with issues: ${Object.keys(report).length} · total findings: ${issues}`);
for (const [k, v] of Object.entries(report)) {
  console.log(`\n${k}`);
  for (const [w, r] of Object.entries(v)) {
    const parts = [];
    if (r.overflow) parts.push(`overflow +${r.overflow}px`);
    if (r.offscreen.length) parts.push(`offscreen ${r.offscreen.length}`);
    if (r.overlap.length) parts.push(`overlap ${r.overlap.length}`);
    if (r.clipped.length) parts.push(`clipped ${r.clipped.length}`);
    console.log(`  ${w}: ${parts.join(" · ")}`);
  }
}
