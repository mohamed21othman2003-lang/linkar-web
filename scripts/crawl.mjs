#!/usr/bin/env node
// Crawl لكل الروابط الداخلية (القسم 7 · 5 في الـbrief): بيبدأ من الرئيسية وبيتبع كل <a href> داخلي
// بالعربي والإنجليزي، كزائر وعميل حالي وعميل جديد، وبيطبع أي رابط مش بيرجّع 200.
// node scripts/crawl.mjs [--base http://localhost:3000] [--list urls.txt]
const args = process.argv.slice(2);
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "http://localhost:3000";

const combos = [];
for (const locale of ["ar", "en"]) for (const session of ["", "user", "new"]) combos.push({ locale, session });

const seeds = ["/", "/services", "/account", "/booking/branch", "/gift/BK-21414", "/v/LK-9F3K-7QPD", "/does-not-exist-404"];
const bad = new Map(); // url -> {status, from}
const assets = new Map(); // image path -> أول صفحة ظهرت فيها
const allUrls = new Set(); // كل الصفحات اللي اتزارت (--list بيكتبها في ملف لـ img-check)
let total = 0;

for (const { locale, session } of combos) {
  const cookie = `locale=${locale}` + (session ? `; linkar_session=${session}` : "");
  const seen = new Set();
  const queue = seeds.map((u) => ({ url: u, from: "(seed)" }));
  while (queue.length) {
    const { url, from } = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    let res;
    try {
      res = await fetch(base + url, { headers: { cookie }, redirect: "manual" });
    } catch (e) {
      bad.set(`${url} [${locale}/${session || "guest"}]`, { status: String(e), from });
      continue;
    }
    total++;
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (loc) {
        const u = new URL(loc, base);
        if (u.origin === new URL(base).origin) queue.push({ url: u.pathname + u.search, from: url });
      }
      continue;
    }
    const expected404 = url === "/does-not-exist-404";
    if (res.status !== 200 && !(expected404 && res.status === 404)) {
      bad.set(`${url} [${locale}/${session || "guest"}]`, { status: res.status, from });
      continue;
    }
    const html = await res.text();
    // الصور: src وsrcset وbackground-image: url(...) (بعد فك &quot;) — كل صورة بتتختبر مرة واحدة
    const decoded = html.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const found = [
      ...[...decoded.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]),
      ...[...decoded.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0])),
      ...[...decoded.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]),
    ];
    for (const a of found) if (a.startsWith("/") && !a.startsWith("//") && !a.startsWith("/_next/static")) assets.set(a, assets.get(a) ?? url);
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      let href = m[1].replace(/&amp;/g, "&");
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      href = href.split("#")[0];
      if (!href || href.startsWith("/_next") || /\.(png|jpe?g|svg|pdf|webp)$/i.test(href)) continue;
      if (!seen.has(href)) queue.push({ url: href, from: url });
    }
  }
  console.log(`${locale}/${session || "guest"}: ${seen.size} URLs`);
  for (const u of seen) allUrls.add(u);
}

for (const [a, from] of assets) {
  const r = await fetch(base + a).catch((e) => ({ status: String(e) }));
  if (r.status !== 200) bad.set(`[image] ${a}`, { status: r.status, from });
}
console.log(`images checked: ${assets.size}`);
if (args.includes("--list")) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(args[args.indexOf("--list") + 1], [...allUrls].filter((u) => !u.includes("does-not-exist")).join("\n"));
}
console.log(`requests: ${total}`);
if (bad.size === 0) console.log("OK — no broken internal links");
else {
  console.log(`BROKEN (${bad.size}):`);
  for (const [u, v] of bad) console.log(`  ${v.status}  ${u}   ← from ${v.from}`);
  process.exitCode = 1;
}
