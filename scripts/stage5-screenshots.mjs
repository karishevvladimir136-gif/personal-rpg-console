// Stage 5 screenshots of every synthetic preview screen, desktop (1440) and phone (390).
//   PREVIEW_URL=http://127.0.0.1:3105 node scripts/stage5-screenshots.mjs
// Optional: PLAYWRIGHT_MODULE (path to a playwright package), BROWSER_PATH (a Chromium-family
// executable; defaults to the preinstalled Microsoft Edge on Windows).
// Previews read sample fixtures only. Port 3000 (the owner's app) is refused.
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requirePreviewBase } from "../tests/preview-target.mjs";

const base = requirePreviewBase();
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "screens", "stage-5");
mkdirSync(out, { recursive: true });
const moduleSpec = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(moduleSpec ? pathToFileURL(join(moduleSpec, "index.mjs")).href : "playwright");
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const executablePath = process.env.BROWSER_PATH ?? (existsSync(edge) ? edge : undefined);

const shots = [
  ["menu", ""], ["campaigns", ""], ["new-campaign", ""], ["new-campaign-dm", "?step=2"],
  ["game", ""], ["game-moment-dice", "?moment=1&dice=1"], ["game-combat", "?combat=1"],
  ["character", ""], ["inventory", ""], ["party", ""], ["party-talk", "?talk=1"], ["party-combat", "?combat=1"],
  ["journal", ""], ["codex", ""], ["map", ""], ["holdings", ""], ["settings", ""], ["adventures", ""],
  // The second sample: a narrative noir with no classes, levels, ability scores, spells or gold.
  ["noir-game", "?world=noir"], ["noir-character", "?world=noir"], ["noir-holdings", "?world=noir"], ["noir-party", "?world=noir"],
  ["noir-campaigns", "?world=noir"], ["noir-settings", "?world=noir"],
];
const route = (name) => name.replace(/^noir-/, "").replace(/-(moment-dice|combat|talk|dm)$/, "");
const browser = await chromium.launch({ executablePath, headless: true });
const report = [];
try {
  for (const [width, height, label] of [[1440, 1000, "desktop"], [390, 844, "phone"]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    for (const [name, query] of shots) {
      const url = `${base}/preview/stage-5/${route(name)}${query}`;
      await page.goto(url, { waitUntil: "networkidle" });
      const lang = name.startsWith("noir") ? "en" : "ru";
      await page.waitForFunction((expected) => document.documentElement.lang === expected, lang, { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = `${name}-${label}.jpg`;
      await page.screenshot({ path: join(out, file), fullPage: true, type: "jpeg", quality: 82 });
      report.push({ file, url: url.replace(base, ""), horizontalOverflowPx: Math.max(0, overflow) });
      console.log(`${file}${overflow > 1 ? `  ⚠ horizontal overflow ${overflow}px` : ""}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
writeFileSync(join(out, "index.json"), JSON.stringify({ base: "PREVIEW_URL", date: new Date().toISOString(), shots: report }, null, 2) + "\n");
