#!/usr/bin/env node
// Generates src/components/icons/generated.ts from the SVGs exported from Figma.
// Usage: node scripts/build-icons.mjs
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "src", "components", "icons");
const outFile = join(iconsDir, "generated.ts");
// الأيقونات بتتنشر كـsprite خارجي (ملف واحد بيتكاش) بدل ما تتحط جوه كل صفحة وجوه الـJS
const spriteDir = join(root, "public", "icons");

const BRAND_COLOR = /(fill|stroke)="#152935"/gi;

// تصدير Figma بيجيب معاه طبقات الإطارات الأب (خلفية #F5F5F5 وحدود الصفحة)،
// فبناخد بس عناصر الأيقونة نفسها: المسارات الملوّنة بلون الأيقونة #152935 (مفيش transforms ولا masks).
function innerMarkup(svg, file) {
  if (!/<svg\b[^>]*>/i.test(svg)) throw new Error(`${file}: not a valid <svg> document`);
  const shapes = svg.match(/<(path|circle|rect|ellipse)\b[^>]*#152935[^>]*\/>/gi);
  if (!shapes) throw new Error(`${file}: no #152935 glyph shapes found`);
  return shapes
    .map((s) => s.replace(/\s+id="[^"]*"/g, "").replace(BRAND_COLOR, '$1="currentColor"'))
    .join("");
}

function readSet(folder) {
  const dir = join(iconsDir, folder);
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();
  const entries = files.map((f) => {
    const markup = innerMarkup(readFileSync(join(dir, f), "utf8"), `${folder}/${f}`);
    const leftover = markup.match(/(fill|stroke)="(?!none"|currentColor")[^"]*"/gi);
    if (leftover) {
      console.warn(`warn: ${folder}/${f} still has non-currentColor paint: ${[...new Set(leftover)].join(", ")}`);
    }
    return [basename(f, ".svg"), markup];
  });
  if (entries.length === 0) throw new Error(`No SVGs found in ${dir}`);
  return entries;
}

function emitType(typeName, entries) {
  return `export type ${typeName} =\n${entries.map(([k]) => `  | ${JSON.stringify(k)}`).join("\n")};\n`;
}

function sprite(entries, size) {
  const symbols = entries.map(([k, v]) => `<symbol id="${k}" viewBox="0 0 ${size} ${size}" fill="none">${v}</symbol>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>\n`;
}

const ui = readSet("ui");
const service = readSet("service");

const uiSprite = sprite(ui, 24);
const serviceSprite = sprite(service, 48);
mkdirSync(spriteDir, { recursive: true });
writeFileSync(join(spriteDir, "ui.svg"), uiSprite);
writeFileSync(join(spriteDir, "service.svg"), serviceSprite);
// نسخة الملف في اللينك (?v=) عشان المتصفح ياخد الجديد لما الأيقونات تتغيّر
const version = createHash("sha1").update(uiSprite + serviceSprite).digest("hex").slice(0, 8);

const header = `// Generated from Figma (UI icon set 665:3031 and v2 Service icon set 1308:420)
// by scripts/build-icons.mjs. Do not edit by hand; rerun \`node scripts/build-icons.mjs\`.
// The glyphs themselves live in the sprites public/icons/ui.svg and public/icons/service.svg.
`;

writeFileSync(
  outFile,
  `${header}\n${emitType("UiGlyph", ui)}\n${emitType("ServiceIcon", service)}\nexport const ICON_SPRITE_VERSION = ${JSON.stringify(version)};\n`,
);
console.log(`Wrote ${outFile} and public/icons/{ui,service}.svg (${ui.length} UI icons, ${service.length} service icons, v${version})`);
