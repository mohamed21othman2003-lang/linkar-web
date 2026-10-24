#!/usr/bin/env node
// مقارنة بالبكسل بين ريندر الفيجما ولقطة الموقع (لازم نفس العرض، مثلاً 1440).
// node scripts/diff.mjs <figma.png> <site.png> <out-prefix> [--threshold 0.1] [--band 400]
// بيطلع:
//   <out-prefix>-diff.png   خريطة الاختلاف (الأحمر = بكسلات مختلفة)
//   <out-prefix>-side.png   الفيجما يمين والموقع شمال جنب بعض (بنفس الارتفاع) للمراجعة بالعين
//   JSON: نسبة الاختلاف الكلية + نسبة كل شريط أفقي (band) عشان تعرف أنهي قسم فيه مشكلة + فرق الارتفاع
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const args = process.argv.slice(2);
const [figPath, sitePath, prefix] = args;
if (!figPath || !sitePath || !prefix) {
  console.error("usage: node scripts/diff.mjs <figma.png> <site.png> <out-prefix> [--threshold 0.1] [--band 400]");
  process.exit(1);
}
const opt = (n, d) => (args.includes(`--${n}`) ? Number(args[args.indexOf(`--${n}`) + 1]) : d);
const threshold = opt("threshold", 0.1);
const band = opt("band", 400);

const fig = PNG.sync.read(readFileSync(figPath));
const site = PNG.sync.read(readFileSync(sitePath));
if (fig.width !== site.width) {
  console.error(`width mismatch: figma ${fig.width} vs site ${site.width} — render both at the same width (e.g. 1440)`);
  process.exit(1);
}
const w = fig.width;
const h = Math.min(fig.height, site.height);

const crop = (img) => {
  const out = new PNG({ width: w, height: h });
  img.data.copy(out.data, 0, 0, w * h * 4);
  return out;
};
const a = crop(fig);
const b = crop(site);
const diff = new PNG({ width: w, height: h });
const total = pixelmatch(a.data, b.data, diff.data, w, h, { threshold, includeAA: false, alpha: 0.25 });
writeFileSync(`${prefix}-diff.png`, PNG.sync.write(diff));

// نسبة الاختلاف لكل شريط أفقي
const bands = [];
for (let y0 = 0; y0 < h; y0 += band) {
  const y1 = Math.min(h, y0 + band);
  let n = 0;
  for (let y = y0; y < y1; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) n++;
    }
  bands.push({ y: `${y0}-${y1}`, pct: +((100 * n) / (w * (y1 - y0))).toFixed(2) });
}

// جنب بعض: الفيجما يمين (زي ترتيب RTL) والموقع شمال
const H = Math.max(fig.height, site.height);
const side = new PNG({ width: w * 2 + 16, height: H });
side.data.fill(255);
PNG.bitblt(site, side, 0, 0, w, site.height, 0, 0);
PNG.bitblt(fig, side, 0, 0, w, fig.height, w + 16, 0);
writeFileSync(`${prefix}-side.png`, PNG.sync.write(side));

console.log(
  JSON.stringify({
    width: w,
    figmaHeight: fig.height,
    siteHeight: site.height,
    heightDelta: site.height - fig.height,
    mismatchPct: +((100 * total) / (w * h)).toFixed(2),
    worstBands: [...bands].sort((x, y) => y.pct - x.pct).slice(0, 6),
  }),
);
