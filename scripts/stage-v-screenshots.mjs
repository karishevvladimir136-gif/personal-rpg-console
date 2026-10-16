// Stage V screenshots: the game screen with its frames panel, the chronicle, the picture settings
// and the character sheet (the phone stat tiles), desktop (1440) and phone (390), both samples.
//   PREVIEW_URL=http://127.0.0.1:3105 node scripts/stage-v-screenshots.mjs [--only game,chronicle]
// Optional: PLAYWRIGHT_MODULE (path to a playwright package), BROWSER_PATH (a Chromium-family
// executable; defaults to the preinstalled Microsoft Edge on Windows).
// Previews read sample fixtures only. Port 3000 (the owner's app) is refused.
// Every phone shot must pass three width checks (the process exits with 1 otherwise):
// no document overflow, no element clipped past the right edge of the viewport, and a
// captured image no wider than the viewport (clipping by an ancestor hides the first two).
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requirePreviewBase } from "../tests/preview-target.mjs";

const base = requirePreviewBase();
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "screens", "stage-v");
mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const onlyArg = args[args.indexOf("--only") + 1];
const only = args.includes("--only") && onlyArg ? new Set(onlyArg.split(",")) : null;
const moduleSpec = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(moduleSpec ? pathToFileURL(join(moduleSpec, "index.mjs")).href : "playwright");
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const executablePath = process.env.BROWSER_PATH ?? (existsSync(edge) ? edge : undefined);

const shots = [
  ["game", ""], ["game-moment", "?moment=1"], ["chronicle", ""], ["settings", ""], ["character", ""],
  ["noir-game", "?world=noir"], ["noir-chronicle", "?world=noir"], ["noir-settings", "?world=noir"],
].filter(([name]) => !only || only.has(name));
const route = (name) => name.replace(/^noir-/, "").replace(/-(moment)$/, "");

/** Width of a baseline or progressive JPEG from its SOF segment. */
function jpegWidth(buffer) {
  let pos = 2;
  while (pos + 9 < buffer.length && buffer[pos] === 0xff) {
    const marker = buffer[pos + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return buffer.readUInt16BE(pos + 7);
    pos += 2 + buffer.readUInt16BE(pos + 2);
  }
  return null;
}

// Elements drawn past the right edge of the viewport (partly visible ones only; a drawer
// parked fully off-screen is not clipping). Returns the largest excess and a hint.
const clippedElements = () => {
  let worst = { px: 0, hint: "" };
  for (const element of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || style.position === "fixed") continue;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.left >= window.innerWidth) continue;
    const px = Math.round(rect.right - window.innerWidth);
    if (px > worst.px) worst = { px, hint: `${element.tagName.toLowerCase()}${element.className && typeof element.className === "string" ? "." + element.className.split(/\s+/)[0] : ""} “${(element.textContent ?? "").trim().slice(0, 40)}”` };
  }
  return worst;
};

const browser = await chromium.launch({ executablePath, headless: true });
const indexFile = join(out, "index.json");
const previous = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")).shots ?? [] : [];
const report = [];
let failed = 0;
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
      const clipped = await page.evaluate(clippedElements);
      const file = `${name}-${label}.jpg`;
      const image = await page.screenshot({ path: join(out, file), fullPage: true, type: "jpeg", quality: 82 });
      const imageWidth = jpegWidth(image);
      const row = { file, url: url.replace(base, ""), horizontalOverflowPx: Math.max(0, overflow), clippedPx: clipped.px, imageWidth, viewportWidth: width };
      if (clipped.px > 0) row.clippedBy = clipped.hint;
      const bad = label === "phone" && (row.horizontalOverflowPx > 1 || row.clippedPx > 1 || (imageWidth !== null && imageWidth > width));
      if (bad) failed += 1;
      report.push(row);
      console.log(`${file}${overflow > 1 ? `  ⚠ horizontal overflow ${overflow}px` : ""}${clipped.px > 1 ? `  ⚠ clipped ${clipped.px}px by ${clipped.hint}` : ""}${imageWidth !== null && imageWidth > width ? `  ⚠ image ${imageWidth}px wide` : ""}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const merged = [...previous.filter((row) => !report.some((fresh) => fresh.file === row.file)), ...report]
  .sort((a, b) => (a.file.endsWith("phone.jpg") === b.file.endsWith("phone.jpg") ? 0 : a.file.endsWith("phone.jpg") ? 1 : -1));
writeFileSync(indexFile, JSON.stringify({ base: "PREVIEW_URL", date: new Date().toISOString(), shots: merged }, null, 2) + "\n");
if (failed) {
  console.error(`${failed} phone shot(s) fail the width checks`);
  process.exit(1);
}
