#!/usr/bin/env node
// Generates src/components/icons/generated.ts from the SVGs exported from Figma.
// Usage: node scripts/build-icons.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "src", "components", "icons");
const outFile = join(iconsDir, "generated.ts");

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

function emit(typeName, constName, entries) {
  const union = entries.map(([k]) => `  | ${JSON.stringify(k)}`).join("\n");
  const body = entries.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
  return `export type ${typeName} =\n${union};\n\nexport const ${constName}: Record<${typeName}, string> = {\n${body}\n};\n`;
}

const ui = readSet("ui");
const service = readSet("service");

const header = `// Generated from Figma (UI icon set 665:3031 and v2 Service icon set 1308:420)
// by scripts/build-icons.mjs. Do not edit by hand; rerun \`node scripts/build-icons.mjs\`.
`;

writeFileSync(outFile, `${header}\n${emit("UiGlyph", "UI_ICONS", ui)}\n${emit("ServiceIcon", "SERVICE_ICONS", service)}`);
console.log(`Wrote ${outFile} (${ui.length} UI icons, ${service.length} service icons)`);
