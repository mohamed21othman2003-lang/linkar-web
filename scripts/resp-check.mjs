#!/usr/bin/env node
// فحص الـresponsive: بيفتح كل قوالب الصفحات على مقاسات شاشات كتير ويطلّع:
//   overflow   — الصفحة أعرض من الشاشة (سكرول أفقي)
//   offscreen  — عنصر طالع برّه الشاشة (مش جوه حاوية سكرول/قص)
//   overlap    — نصّين راكبين على بعض
//   clipped    — نص متقصوص جوه عنصر overflow hidden (من غير ellipsis أو line-clamp)
// وبيحفظ لقطة كاملة لكل صفحة في .claude/figma-refs/resp/<width>/ للمراجعة بالعين.
// node scripts/resp-check.mjs [--base http://localhost:3000] [--widths 390,768] [--only /account] [--locale en] [--no-shots]
//   --browser webkit|firefox|chromium   محرّك المتصفح مع --widths (webkit = محرّك سفاري)
//   --devices "iPhone SE,Pixel 7,iPad Mini"   أجهزة Playwright الجاهزة (كل جهاز بمحرّكه: آيفون/آيباد = webkit، أندرويد = chromium)
//   --shots issues   لقطة بس للصفحات اللي فيها مشكلة · --out name   اسم ملف التقرير
import { chromium, webkit, firefox, devices } from "playwright";
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
const shotsIssuesOnly = opt("shots", "") === "issues";
const engines = { chromium, webkit, firefox };
const deviceNames = opt("devices", "").split(",").map((x) => x.trim()).filter(Boolean);
for (const d of deviceNames) if (!devices[d]) throw new Error(`unknown device: ${d}`);
const outName = opt("out", "report");

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
// --admin: صفحات لوحة التحكم (admin/ على 3200) بجلسة تجريبية
const admin = [
  "/login", "/reset-password?token=x", "/account", "/coming-soon?s=home",
  "/settings/users", "/settings/users?user=u-2", "/settings/roles", "/settings/roles/operations", "/settings/audit-log",
  "/providers", "/providers?provider=johnson", "/providers/new?step=1", "/providers/new?step=2", "/providers/new?step=3",
  "/providers/lk-jn-001?tab=bookings", "/providers/lk-jn-001?tab=quality", "/providers/lk-jn-001?tab=analytics", "/providers/lk-jn-001?tab=dues",
  "/branches", "/branches/LK-JN-ZH-001/performance",
  // المرحلة التانية
  "/overview", "/analytics", "/analytics?tab=behavior", "/reports",
  "/requests", "/requests?request=REQ-2026-0418", "/requests?tab=data",
  "/bookings", "/bookings?booking=BK-21473", "/bookings?tab=completed", "/bookings/new?step=1", "/bookings/new?step=2",
  "/customers", "/customers?customer=cu-ms", "/customers?tab=coupons", "/customers/cu-ms",
  "/partners/agencies", "/partners/agencies?agency=DL-014", "/partners/agencies/DL-014", "/partners/marketers", "/partners/marketers?marketer=SM123", "/partners/marketers/SM123", "/partners/marketers/rates",
  "/invoices", "/invoices?tab=provider", "/payments", "/payments?tab=refunds", "/dues", "/dues?tab=transfers", "/dues?tab=claims",
  "/field-evaluation", "/field-evaluation/centers", "/field-evaluation/centers/lk-dr-001", "/reviews", "/reviews?tab=reviews", "/reviews?complaint=CM-3352",
  "/messages", "/messages?message=MSG-0418", "/system/policies", "/system/paid-features",
  "/reference/service-categories", "/reference/car-sizes", "/reference/service-categories/ppf", "/reference/accreditation",
];
const isAdmin = args.includes("--admin");
const pages = (isAdmin
  ? admin.map((p) => ({ p, s: p.startsWith("/login") || p.startsWith("/reset") ? "" : "admin" }))
  : [...guest.map((p) => ({ p, s: "" })), ...user.map((p) => ({ p, s: "user" }))]
).filter(({ p }) => !only || p.startsWith(only));

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

// كل «بروفايل» = مقاس + محرّك + (جهاز اختياري)
const profiles = deviceNames.length
  ? deviceNames.map((d) => {
      const { defaultBrowserType, ...ctx } = devices[d];
      return { label: d, engine: defaultBrowserType, ctx };
    })
  : widths.map((w) => ({
      label: String(w),
      engine: opt("browser", "chromium"),
      ctx: { viewport: { width: w, height: 900 }, ...(w < 768 && opt("browser", "chromium") !== "firefox" ? { isMobile: true, hasTouch: true } : {}) },
    }));
const launched = {};
const report = {};
let issues = 0;
const sessions = [...new Set(pages.map((x) => x.s))];
for (const prof of profiles) {
  launched[prof.engine] ??= await engines[prof.engine].launch();
  const dir = `.claude/figma-refs/resp/${prof.label.replace(/[^\w.-]+/g, "_")}`;
  if (shots) mkdirSync(dir, { recursive: true });
  for (const s of sessions) {
    const list = pages.filter((x) => x.s === s);
    if (!list.length) continue;
    const host = new URL(base).hostname;
    const bad = [];
    let ctx, page;
    // سياق جديد — ولو المتصفح نفسه وقع (WebKit على ويندوز بيقع أحيانًا مع الرام القليلة) نشغّله تاني
    const fresh = async () => {
      await ctx?.close().catch(() => {});
      let browser = launched[prof.engine];
      if (!browser.isConnected()) browser = launched[prof.engine] = await engines[prof.engine].launch();
      ctx = await browser.newContext(prof.ctx);
      await ctx.addCookies([
        { name: "locale", value: locale, domain: host, path: "/" },
        ...(s === "admin" ? [{ name: "linkar_admin_session", value: "demo", domain: host, path: "/" }] : s ? [{ name: "linkar_session", value: s, domain: host, path: "/" }] : []),
      ]);
      await ctx.addInitScript(() => {
        localStorage.setItem("linkar_location_prompt", "dismissed");
        // نافذة «قيّم خدمتك» بتفتح لوحدها للعميل المسجّل (W2-39) — نعلّمها إنها اتعرضت عشان ماتتحسبش تداخل
        for (const id of ["BK-21388", "BK-21280", "BK-21431", "BK-21452"]) localStorage.setItem(`linkar_rate_prompted_${id}`, "1");
      });
      page = await ctx.newPage();
      page.on("response", (res) => { if (res.status() >= 400 && !res.url().includes("/does-not-exist")) bad.push(`${res.status()} ${res.url()}`); });
    };
    const check = async (p) => {
      bad.length = 0;
      await page.goto(base + p, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => { if (/crash|closed/i.test(e.message)) throw e; });
      await page.waitForLoadState("networkidle").catch(() => {});
      // صفحات بتحوّل لوحدها بعد التحميل (redirect) بتكسر evaluate — نستنى ونجرّب تاني بدل ما الفحص كله يقع
      const scroll = () => page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await scroll().catch(async () => {
        await page.waitForLoadState("networkidle").catch(() => {});
        await scroll().catch(() => {});
      });
      await page.waitForTimeout(250);
      const r = await page.evaluate(detect).catch(async () => {
        await page.waitForLoadState("networkidle").catch(() => {});
        return page.evaluate(detect);
      });
      r.bad = [...new Set(bad)];
      return r;
    };
    await fresh();
    for (const { p } of list) {
      let r;
      for (let attempt = 0; attempt < 3 && !r; attempt++) {
        try { r = await check(p); } catch (e) {
          if (process.env.RESP_DEBUG) console.log("retry", p, prof.label, e.message.split(String.fromCharCode(10))[0]);
          await fresh().catch(() => {});
        }
      }
      r ??= { overflow: 0, offscreen: [], overlap: [], clipped: [], bad: ["page crashed 3 times"] };
      if (process.env.RESP_DEBUG) console.log(p, prof.label, JSON.stringify(r).slice(0, 200));
      const key = `${p}${s ? ` [${s}]` : ""}`;
      const n = (r.overflow ? 1 : 0) + r.offscreen.length + r.overlap.length + r.clipped.length + r.bad.length;
      if (n) {
        report[key] ??= {};
        report[key][prof.label] = r;
        issues += n;
      }
      if (shots && (!shotsIssuesOnly || n)) {
        const file = `${dir}/${(s ? s[0] : "g")}${p.replace(/[/?&=,]+/g, "_") || "_home"}.png`;
        await page.screenshot({ path: file, fullPage: true }).catch(() => {});
      }
    }
    await ctx.close().catch(() => {});
  }
  console.log(`${prof.label} (${prof.engine}): done`);
}
for (const b of Object.values(launched)) await b.close().catch(() => {});
mkdirSync(".claude/figma-refs/resp", { recursive: true });
writeFileSync(`.claude/figma-refs/resp/${outName}.json`, JSON.stringify(report, null, 1));
console.log(`pages with issues: ${Object.keys(report).length} · total findings: ${issues}`);
for (const [k, v] of Object.entries(report)) {
  console.log(`\n${k}`);
  for (const [w, r] of Object.entries(v)) {
    const parts = [];
    if (r.overflow) parts.push(`overflow +${r.overflow}px`);
    if (r.offscreen.length) parts.push(`offscreen ${r.offscreen.length}`);
    if (r.overlap.length) parts.push(`overlap ${r.overlap.length}`);
    if (r.clipped.length) parts.push(`clipped ${r.clipped.length}`);
    if (r.bad?.length) parts.push(`http ${r.bad.join(" ")}`);
    console.log(`  ${w}: ${parts.join(" · ")}`);
  }
}
