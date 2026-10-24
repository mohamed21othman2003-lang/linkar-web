#!/usr/bin/env node
// لقطة لعنصر واحد (كارت/نافذة) لمقارنته بريندر الكومبوننت في الفيجما
// node scripts/el-shot.mjs <url> <css-selector> <out.png> [session|-] [click-selector]
// click-selector: يضغط على عنصر الأول (يفتح قايمة/نافذة) وبعدين ياخد اللقطة
import { chromium } from "playwright";
const [url, sel, out, sessionArg, click] = process.argv.slice(2);
const session = sessionArg && sessionArg !== "-" ? sessionArg : "";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.addCookies([{ name: "locale", value: "ar", domain: "localhost", path: "/" }, ...(session ? [{ name: "linkar_session", value: session, domain: "localhost", path: "/" }] : [])]);
await c.addInitScript(() => { try { localStorage.setItem("linkar_location_prompt", "dismissed"); } catch {} });
const p = await c.newPage(); await p.goto(url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready);
if (click) { await p.locator(click).first().click(); await p.waitForTimeout(500); }
const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
const bb = await el.boundingBox(); await el.screenshot({ path: out }); console.log(JSON.stringify(bb)); await b.close();
