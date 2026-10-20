// 2D Live screenshots (docs/stages/LIVE2D_1.md «Done when»): the synthetic walk
// world → region → town → district → scene on the preview route, at 1920×1080,
// 2560×1440 and 390×844, into docs/runs/live2d-1-shots/.
//   PREVIEW_URL=http://127.0.0.1:3105 node scripts/live2d-screenshots.mjs [--only region,scene]
// Optional: PLAYWRIGHT_MODULE (path to a playwright package), BROWSER_PATH (a Chromium executable).
// Previews read sample fixtures only. Port 3000 (the owner's app) is refused.
// Every phone shot must pass the width checks of scripts/stage-v-screenshots.mjs: no document
// overflow, no element past the right edge, an image no wider than the viewport.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requirePreviewBase } from "../tests/preview-target.mjs";

const base = requirePreviewBase();
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "runs", "live2d-1-shots");
mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const onlyArg = args[args.indexOf("--only") + 1];
const only = args.includes("--only") && onlyArg ? new Set(onlyArg.split(",")) : null;
const moduleSpec = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(moduleSpec ? pathToFileURL(join(moduleSpec, "index.mjs")).href : "playwright");
const executablePath = process.env.BROWSER_PATH ?? undefined;

const shots = [
  ["world", "?level=world"], ["region", "?level=region"], ["region-travel", "?level=region&travel=1"],
  ["town", "?level=town"], ["district", "?level=district"], ["scene", "?level=scene"], ["scene-en", "?level=scene&lang=en"],
  // Part 2: the two probe fights round by round (the synthetic fixtures), the zones view once, the end card.
  ["battle-ford-r1", "/battle?fight=ford&round=1"], ["battle-ford-r2", "/battle?fight=ford&round=2"], ["battle-ford-r3", "/battle?fight=ford&round=3"], ["battle-ford-r4", "/battle?fight=ford&round=4"],
  ["battle-ford-zones", "/battle?fight=ford&round=2&view=zones"],
  ["battle-lair-r1", "/battle?fight=lair&round=1"], ["battle-lair-r2", "/battle?fight=lair&round=2"], ["battle-lair-r3", "/battle?fight=lair&round=3"],
].filter(([name]) => !only || only.has(name));

const clippedElements = () => {
  let worst = { px: 0, hint: "" };
  for (const element of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || style.position === "fixed") continue;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.left >= window.innerWidth) continue;
    // A horizontally scrolling region (the initiative ribbon on a phone) is meant to overflow its box: an element that
    // sits inside such a region and within its scroll width is reachable by scrolling, not clipped.
    let scroller = element.parentElement, inScroller = false;
    while (scroller && scroller !== document.body) {
      const overflowX = getComputedStyle(scroller).overflowX;
      if ((overflowX === "auto" || overflowX === "scroll") && scroller.scrollWidth > scroller.clientWidth) {
        const box = scroller.getBoundingClientRect();
        if (box.right <= window.innerWidth + 1) { inScroller = true; break; }
      }
      scroller = scroller.parentElement;
    }
    if (inScroller) continue;
    const px = Math.round(rect.right - window.innerWidth);
    if (px > worst.px) worst = { px, hint: `${element.tagName.toLowerCase()}${element.className && typeof element.className === "string" ? "." + element.className.split(/\s+/)[0] : ""} “${(element.textContent ?? "").trim().slice(0, 40)}”` };
  }
  return worst;
};

const browser = await chromium.launch({ executablePath, headless: true });
const report = [];
let failed = 0;
try {
  for (const [width, height, label] of [[1920, 1080, "1920"], [2560, 1440, "2560"], [390, 844, "phone"]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    for (const [name, query] of shots) {
      const url = `${base}/preview/live2d${query}`;
      // The 2560 pass keeps the walk and the last round of each fight (the rest is the same layout, wider).
      if (width === 2560 && /^battle-/.test(name) && !/-r4$|lair-r3$/.test(name)) continue;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(name === "region-travel" ? 1800 : 500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const clipped = await page.evaluate(clippedElements);
      const file = `${name}-${label}.jpg`;
      await page.screenshot({ path: join(out, file), fullPage: width >= 768 ? false : true, type: "jpeg", quality: 84 });
      const row = { file, url: url.replace(base, ""), horizontalOverflowPx: Math.max(0, overflow), clippedPx: clipped.px, viewportWidth: width };
      if (clipped.px > 0) row.clippedBy = clipped.hint;
      const bad = width < 768 && (row.horizontalOverflowPx > 0 || row.clippedPx > 0);
      if (bad) failed += 1;
      report.push(row);
      console.log(`${bad ? "FAIL" : "ok  "} ${file} overflow=${row.horizontalOverflowPx} clipped=${row.clippedPx}${row.clippedBy ? ` (${row.clippedBy})` : ""}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
writeFileSync(join(out, "index.json"), JSON.stringify({ takenAt: new Date().toISOString(), shots: report }, null, 2) + "\n");
if (failed) { console.error(`${failed} phone shot(s) failed the width checks`); process.exit(1); }
