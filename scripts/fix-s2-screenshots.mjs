// Fix run after session 2: screenshots of the synthetic preview screens a stage changed, at 1920×1080, 2560×1440 and a
// 390×844 phone, into docs/runs/fix-s2-shots/ (FIX_S2_RUN.md). Previews read sample fixtures only; port 3000 is refused.
//   PREVIEW_URL=http://127.0.0.1:3105 node scripts/fix-s2-screenshots.mjs --stage A --shots owner,settings,game-recording
// Every phone shot passes the stage 5 width checks (no document overflow, nothing clipped past the right edge).
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requirePreviewBase } from "../tests/preview-target.mjs";

const base = requirePreviewBase();
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "runs", "fix-s2-shots");
mkdirSync(out, { recursive: true });
const arg = (name) => { const at = process.argv.indexOf(name); return at > 0 ? process.argv[at + 1] : null; };
const stage = arg("--stage") ?? "X";
const shots = (arg("--shots") ?? "owner").split(",").map((name) => name.trim()).filter(Boolean);
const playwright = process.env.PLAYWRIGHT_MODULE ?? (existsSync("/opt/node-tools/node_modules/playwright") ? "/opt/node-tools/node_modules/playwright" : null);
const { chromium } = await import(playwright ? pathToFileURL(join(playwright, "index.mjs")).href : "playwright");
// «game-recording» → /preview/stage-5/game?recording=1; «settings» → /preview/stage-5/settings.
const urlOf = (name) => {
  const [screen, ...flags] = name.split("-");
  const query = new URLSearchParams(flags.map((flag) => [flag, "1"])).toString();
  return `${base}/preview/stage-5/${screen}${query ? `?${query}` : ""}`;
};
const clippedElements = () => {
  let worst = { px: 0, hint: "" };
  for (const element of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || style.position === "fixed") continue;
    let scroller = element.parentElement, insideScroller = false;
    while (scroller) { const o = getComputedStyle(scroller).overflowX; if (o === "auto" || o === "scroll") { insideScroller = true; break; } scroller = scroller.parentElement; }
    if (insideScroller) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.left >= window.innerWidth) continue;
    const px = Math.round(rect.right - window.innerWidth);
    if (px > worst.px) worst = { px, hint: `${element.tagName.toLowerCase()}${typeof element.className === "string" && element.className ? "." + element.className.split(/\s+/)[0] : ""}` };
  }
  return worst;
};
const browser = await chromium.launch({ headless: true });
const indexFile = join(out, "index.json");
const previous = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")).shots ?? [] : [];
const report = [];
let failed = 0;
try {
  for (const [width, height, label] of [[1920, 1080, "1080p"], [2560, 1440, "1440p"], [390, 844, "phone"]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    for (const name of shots) {
      const url = urlOf(name);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const clipped = await page.evaluate(clippedElements);
      const file = `${stage}-${name}-${label}.jpg`;
      await page.screenshot({ path: join(out, file), fullPage: label === "phone", type: "jpeg", quality: 80 });
      const row = { stage, file, url: url.replace(base, ""), horizontalOverflowPx: Math.max(0, overflow), clippedPx: clipped.px, ...(clipped.px > 0 ? { clippedBy: clipped.hint } : {}) };
      if (label === "phone" && (row.horizontalOverflowPx > 1 || row.clippedPx > 1)) failed++;
      report.push(row);
      console.log(`${file}${overflow > 1 ? `  ⚠ overflow ${overflow}px` : ""}${clipped.px > 1 ? `  ⚠ clipped ${clipped.px}px by ${clipped.hint}` : ""}`);
    }
    await context.close();
  }
} finally { await browser.close(); }
const merged = [...previous.filter((row) => !report.some((fresh) => fresh.file === row.file)), ...report];
writeFileSync(indexFile, `${JSON.stringify({ base: "PREVIEW_URL", date: new Date().toISOString(), shots: merged }, null, 2)}\n`);
if (failed) { console.error(`${failed} phone shot(s) fail the width checks`); process.exit(1); }
