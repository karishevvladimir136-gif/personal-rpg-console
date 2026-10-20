// 2D Live probes (docs/stages/LIVE2D_1.md «Measured, not assumed»): the budget
// guard and ledger shared by every paid script of the slice, one draw path over
// the OpenAI image adapter, and the vision calls of the production chain
// (src/lib/live2d/server/vision.ts) wrapped in reserve/settle. Keys come from the
// environment or .env.local through providerKey() and are never printed or
// written; errors carry only the provider's short, key-free reason.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { providerKey } from "../lib/keys.mjs";
import { FAL_SIZES, FalImageError, isContentRefusal, sniffImage, usd } from "../../../src/lib/visual-frame/fal-image.ts";
import { generateOpenAIImage, openAIImageReserveUsdMicros } from "../../../src/lib/visual-frame/openai-image.ts";
import { buildSheet, checkScene, locateScene, draftSeeds, CHECK_MODEL, LOCATOR_MODEL, SHEET_MODEL, PRICE_PER_MILLION } from "../../../src/lib/live2d/server/vision.ts";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const runsDir = join(root, "docs", "runs");
export const samplesDir = join(root, "docs", "samples", "live2d");
mkdirSync(samplesDir, { recursive: true });
export { usd };

// ---- the budget guard and the ledger (JSON + the Markdown twin the owner reads) ----------
const ledgerJson = join(runsDir, "live2d-1-ledger.json");
const ledgerMd = join(runsDir, "live2d-1-ledger.md");
/** The slice's cap (owner, 2026-10-20: $40); a run may set a lower one with --budget-usd. */
export const CAP_USD = Number(process.env.LIVE2D_CAP_USD ?? 40);
export const ledger = existsSync(ledgerJson) ? JSON.parse(readFileSync(ledgerJson, "utf8"))
  : { capUsd: CAP_USD, totalUsdMicros: 0, note: "Every paid call of the 2D Live slice: reserved at its upper bound before it is sent, settled afterwards (OpenAI and Anthropic from the reply's own usage, fal at list price).", entries: [] };
let runCapMicros = CAP_USD * 1_000_000;
let runSpentMicros = 0;
export function setRunBudget(usdValue) { runCapMicros = Math.round(usdValue * 1_000_000); }
export class BudgetError extends Error {}
function writeLedger() {
  writeFileSync(ledgerJson, JSON.stringify(ledger, null, 2) + "\n");
  const rows = ledger.entries.map((row) => `| ${row.at.replace("T", " ").slice(0, 16)} | ${row.note} | ${row.model} | ${usd(row.reservedUsdMicros)} | ${row.settled ? usd(row.usdMicros) : "…"} | ${row.outcome ?? (row.settled ? "ok" : "pending")} |`);
  writeFileSync(ledgerMd, [
    "# 2D Live, first slice — ledger of paid calls",
    "",
    `Cap **$${CAP_USD}** (owner, 2026-10-20; was $25). Every paid call is reserved at an upper bound before it is sent and settled`,
    "afterwards from the reply's own usage (OpenAI images, Anthropic) or fal's list price. The machine-readable twin is",
    "`docs/runs/live2d-1-ledger.json` (written by `scripts/eval/live2d/*.mjs`).",
    "",
    "| When (UTC) | What | Model | Reserved | Settled | Outcome |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    `**Spent so far: ${usd(ledger.totalUsdMicros)} of $${CAP_USD}** (${ledger.entries.length} calls).`,
    "",
  ].join("\n"));
}
export function reserve(kind, model, expectedMicros, note) {
  if (ledger.totalUsdMicros + expectedMicros > CAP_USD * 1_000_000)
    throw new BudgetError(`budget: ${note} (${usd(expectedMicros)}) would exceed the $${CAP_USD} cap (spent ${usd(ledger.totalUsdMicros)})`);
  if (runSpentMicros + expectedMicros > runCapMicros)
    throw new BudgetError(`budget: ${note} (${usd(expectedMicros)}) would exceed this run's budget (${usd(runCapMicros)}; spent ${usd(runSpentMicros)})`);
  const entry = { at: new Date().toISOString(), kind, model, note, reservedUsdMicros: expectedMicros, usdMicros: expectedMicros, settled: false };
  ledger.entries.push(entry);
  ledger.totalUsdMicros += expectedMicros;
  runSpentMicros += expectedMicros;
  writeLedger();
  return entry;
}
export function settle(entry, actualMicros, extra = {}) {
  ledger.totalUsdMicros += actualMicros - entry.usdMicros;
  runSpentMicros += actualMicros - entry.usdMicros;
  entry.usdMicros = actualMicros;
  entry.settled = true;
  Object.assign(entry, extra);
  writeLedger();
}
export const spentUsdMicros = () => ledger.totalUsdMicros;

// ---- files -------------------------------------------------------------------------------
export const readImage = (file) => { const bytes = new Uint8Array(readFileSync(join(samplesDir, file))); return { bytes, contentType: sniffImage(bytes) }; };
/** Saves a picture under a random name, re-encoded as JPEG quality 86 when ImageMagick is present. */
export function saveImage(bytes, prefix = "scene") {
  const file = `${prefix}-${randomBytes(4).toString("hex")}.jpg`;
  const out = join(samplesDir, file);
  const converted = spawnSync("convert", ["-", "-strip", "-quality", "86", `jpg:${out}`], { input: Buffer.from(bytes) });
  if (converted.status !== 0 || !existsSync(out)) writeFileSync(out, bytes);
  return file;
}

// ---- one picture (OpenAI GPT Image 2.5 Sunburst, the quality tier's default) -----------------
export const SCENE_MODEL = "gpt-image-2.5-sunburst";
export async function drawScene(prompt, { size = "landscape_16_9_hd", note, references = [] } = {}) {
  const apiKey = providerKey("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const [width, height] = FAL_SIZES[size];
  const input = { model: SCENE_MODEL, prompt, width, height, quality: "high", format: "jpeg", references, moderation: "low" };
  const expected = openAIImageReserveUsdMicros(input);
  const entry = reserve("openai", SCENE_MODEL, expected, note);
  try {
    const result = await generateOpenAIImage(apiKey, input, { timeoutMs: 300_000 });
    settle(entry, result.priceUsdMicros, { usage: result.usage });
    return { ok: true, bytes: result.bytes, contentType: result.contentType, width: result.width, height: result.height, ms: result.elapsedMs, usdMicros: result.priceUsdMicros };
  } catch (error) {
    if (!(error instanceof FalImageError)) { settle(entry, expected, { outcome: "error" }); throw error; }
    const billed = /^HTTP 400\b/.test(error.detail ?? "") ? 0 : expected;
    settle(entry, billed, { outcome: error.code, detail: error.detail });
    return { ok: false, refusal: isContentRefusal(error), code: error.code, detail: error.detail, usdMicros: billed };
  }
}

// ---- the vision calls of the production chain, through the guard ----------------------------
const price = (model) => PRICE_PER_MILLION[model];
const anthropicKey = () => { const key = providerKey("ANTHROPIC_API_KEY"); if (!key) throw new Error("ANTHROPIC_API_KEY missing"); return key; };
/** An upper bound before the call: text tokens in, about 1,800 per picture, the answer. */
const textReserve = (model, inTokens, outTokens, pictures = 0) => Math.round((inTokens + pictures * 1_800) * price(model).input + outTokens * price(model).output);

export async function sheetFor(source, note) {
  const entry = reserve("anthropic", SHEET_MODEL, textReserve(SHEET_MODEL, 3_000, 3_000), note);
  const result = await buildSheet(anthropicKey(), source);
  settle(entry, result.costUsdMicros, { usage: result.usage, outcome: result.error ?? "ok" });
  return result;
}
export async function checkFor(sheet, placeName, picture, note) {
  const entry = reserve("anthropic", CHECK_MODEL, textReserve(CHECK_MODEL, 1_500, 2_500, 1), note);
  const result = await checkScene(anthropicKey(), sheet, placeName, picture);
  settle(entry, result.costUsdMicros, { usage: result.usage, outcome: result.error ?? "ok" });
  return result;
}
export async function locateFor(candidates, placeName, picture, note) {
  const entry = reserve("anthropic", LOCATOR_MODEL, textReserve(LOCATOR_MODEL, 1_000, 1_500, 1), note);
  const result = await locateScene(anthropicKey(), candidates, placeName, picture);
  settle(entry, result.costUsdMicros, { usage: result.usage, outcome: result.error ?? "ok" });
  return result;
}
export async function seedsFor(input, note) {
  const entry = reserve("anthropic", SHEET_MODEL, textReserve(SHEET_MODEL, 2_000, 2_500), note);
  const result = await draftSeeds(anthropicKey(), input);
  settle(entry, result.costUsdMicros, { usage: result.usage, outcome: result.error ?? "ok" });
  return result;
}

// ---- results (one row per place; the resume point) ------------------------------------------
const resultsFile = join(runsDir, "live2d-1-probe-results.json");
export const results = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, "utf8")) : { rows: [] };
export const saveResults = () => writeFileSync(resultsFile, JSON.stringify(results, null, 2) + "\n");
export const rowOf = (key) => results.rows.find((row) => row.key === key) ?? null;
export function putRow(row) {
  const at = results.rows.findIndex((r) => r.key === row.key);
  if (at >= 0) results.rows[at] = row; else results.rows.push(row);
  saveResults();
}
export const mean = (list) => { const values = list.filter((v) => typeof v === "number"); return values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3)) : null; };
