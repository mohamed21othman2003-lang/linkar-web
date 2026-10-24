#!/usr/bin/env node
// Crawl لكل الروابط الداخلية (القسم 7 · 5 في الـbrief): بيبدأ من الرئيسية وبيتبع كل <a href> داخلي
// بالعربي والإنجليزي، كزائر وعميل حالي وعميل جديد، وبيطبع أي رابط مش بيرجّع 200.
// node scripts/crawl.mjs [--base http://localhost:3000]
const args = process.argv.slice(2);
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "http://localhost:3000";

const combos = [];
for (const locale of ["ar", "en"]) for (const session of ["", "user", "new"]) combos.push({ locale, session });

const seeds = ["/", "/services", "/account", "/booking/branch", "/gift/BK-21414", "/v/LK-9F3K-7QPD", "/does-not-exist-404"];
const bad = new Map(); // url -> {status, from}
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
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      let href = m[1].replace(/&amp;/g, "&");
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      href = href.split("#")[0];
      if (!href || href.startsWith("/_next") || /\.(png|jpe?g|svg|pdf|webp)$/i.test(href)) continue;
      if (!seen.has(href)) queue.push({ url: href, from: url });
    }
  }
  console.log(`${locale}/${session || "guest"}: ${seen.size} URLs`);
}

console.log(`requests: ${total}`);
if (bad.size === 0) console.log("OK — no broken internal links");
else {
  console.log(`BROKEN (${bad.size}):`);
  for (const [u, v] of bad) console.log(`  ${v.status}  ${u}   ← from ${v.from}`);
  process.exitCode = 1;
}
