#!/usr/bin/env node
// قفل بسيط لمتصفح Playwright MCP المشترك: كل الـagents بيشتغلوا بالتوازي بس فيه متصفح MCP واحد،
// فكل agent ياخد القفل قبل ما يستخدمه ويسيبه بعد ما يخلص (دفعة قصيرة، أقل من 4 دقايق).
//   node scripts/mcp-lock.mjs acquire <agent-name>   → بيستنى لحد ما القفل يفضى (أقصى حاجة 10 دقايق) وياخده
//   node scripts/mcp-lock.mjs release <agent-name>   → يسيب القفل
//   node scripts/mcp-lock.mjs status
// القفل اللي عدّى عليه أكتر من 5 دقايق بيتعتبر متساب (agent وقع) وبيتشال.
import { mkdirSync, rmSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, ".claude", "locks", "playwright-mcp");
const [cmd, who = "unknown"] = process.argv.slice(2);
const STALE_MS = 5 * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function owner() {
  try {
    return readFileSync(join(dir, "owner"), "utf8");
  } catch {
    return "?";
  }
}

function tryTake() {
  try {
    mkdirSync(dir, { recursive: false });
    writeFileSync(join(dir, "owner"), `${who} @ ${new Date().toISOString()}`);
    return true;
  } catch {
    try {
      if (Date.now() - statSync(dir).mtimeMs > STALE_MS) {
        rmSync(dir, { recursive: true, force: true });
        console.error(`removed stale lock (${owner()})`);
      }
    } catch {}
    return false;
  }
}

if (cmd === "acquire") {
  mkdirSync(join(root, ".claude", "locks"), { recursive: true });
  const until = Date.now() + 10 * 60 * 1000;
  while (!tryTake()) {
    if (Date.now() > until) {
      console.log(JSON.stringify({ ok: false, heldBy: owner() }));
      process.exit(1);
    }
    await sleep(2000 + Math.random() * 2000);
  }
  console.log(JSON.stringify({ ok: true, owner: who }));
} else if (cmd === "release") {
  if (owner().startsWith(who)) rmSync(dir, { recursive: true, force: true });
  console.log(JSON.stringify({ ok: true }));
} else {
  console.log(JSON.stringify({ heldBy: owner() }));
}
