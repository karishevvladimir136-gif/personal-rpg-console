// Picture bake-off plumbing: the candidate models, the budget guard and ledger,
// one call path over the fal and OpenAI adapters, image files, the vision judge.
// Keys come from the environment or .env.local through providerKey() and are
// never printed, logged or written; errors carry only the provider's short,
// key-free reason.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerKey } from "../lib/keys.mjs";
import { FAL_SIZES, FalImageError, falImagePriceUsdMicros, falModel, generateFalImage, isContentRefusal, sniffImage, usd } from "../../../src/lib/visual-frame/fal-image.ts";
import { generateOpenAIImage, openAIImageReserveUsdMicros } from "../../../src/lib/visual-frame/openai-image.ts";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const runsDir = join(root, "docs", "runs");
export const samplesDir = join(root, "docs", "samples", "pictures");
export const imagesDir = join(samplesDir, "img");
export const anchorsDir = join(samplesDir, "anchors");
for (const dir of [runsDir, samplesDir, imagesDir, anchorsDir]) mkdirSync(dir, { recursive: true });
export { usd };

/** The candidates. `seeds`: the model takes a seed (else three samples are three plain requests). */
export const MODELS = {
  "nb-pro": { provider: "fal", id: "fal-ai/nano-banana-pro", label: "Nano Banana Pro", seeds: true },
  "nb2": { provider: "fal", id: "fal-ai/nano-banana-2", label: "Nano Banana 2", seeds: true },
  "seedream5": { provider: "fal", id: "bytedance/seedream/v5/pro/text-to-image", label: "Seedream 5.0 Pro", seeds: false },
  "flux3": { provider: "fal", id: "blackforestlabs/flux-3/text-to-image", label: "FLUX 3", seeds: false },
  "flux2-pro": { provider: "fal", id: "fal-ai/flux-2-pro", label: "FLUX.2 [pro]", seeds: true },
  "klein9b": { provider: "fal", id: "fal-ai/flux-2/klein/9b", label: "FLUX.2 [klein] 9B", seeds: true },
  "qwen3": { provider: "fal", id: "fal-ai/qwen-image-3/text-to-image", label: "Qwen-Image 3", seeds: true },
  "gpt2": { provider: "openai", id: "gpt-image-2", label: "GPT Image 2", quality: "high" },
  "gpt25s": { provider: "openai", id: "gpt-image-2.5-sunburst", label: "GPT Image 2.5 Sunburst", quality: "high" },
  "gpt25f": { provider: "openai", id: "gpt-image-2.5-flare", label: "GPT Image 2.5 Flare", quality: "high" },
};
export const SIZES = { frame: "landscape_16_9_hd", figure: "portrait_16_9_hd", portrait: "square_hd" };
export const SEED_VALUES = [101, 202, 303];

// ---- budget guard and ledger -------------------------------------------------
const ledgerFile = join(runsDir, "pictures-ledger.json");
export const CAP_USD = Number(process.env.PICTURES_CAP_USD ?? 20);
export const ledger = existsSync(ledgerFile) ? JSON.parse(readFileSync(ledgerFile, "utf8"))
  : { capUsd: CAP_USD, totalUsdMicros: 0, note: "Every paid call of the picture bake-off: reserved at its upper bound before it is sent, settled afterwards (fal at list price, OpenAI and Anthropic from the reply's own usage).", entries: [] };
const saveLedger = () => writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + "\n");
export class BudgetError extends Error {}
export function reserve(kind, model, expectedMicros, note) {
  if (ledger.totalUsdMicros + expectedMicros > CAP_USD * 1_000_000)
    throw new BudgetError(`budget: ${note} (${usd(expectedMicros)}) would exceed the $${CAP_USD} cap (spent ${usd(ledger.totalUsdMicros)})`);
  const entry = { at: new Date().toISOString(), kind, model, note, reservedUsdMicros: expectedMicros, usdMicros: expectedMicros, settled: false };
  ledger.entries.push(entry);
  ledger.totalUsdMicros += expectedMicros;
  saveLedger();
  return entry;
}
export function settle(entry, actualMicros, extra = {}) {
  ledger.totalUsdMicros += actualMicros - entry.usdMicros;
  entry.usdMicros = actualMicros;
  entry.settled = true;
  Object.assign(entry, extra);
  saveLedger();
}

// ---- results (one row per paid picture; the resume point) -------------------------
const resultsFile = join(runsDir, "pictures-results.json");
export const results = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, "utf8")) : { rows: [] };
export const saveResults = () => writeFileSync(resultsFile, JSON.stringify(results, null, 2) + "\n");
export const rowOf = (key) => results.rows.find((row) => row.key === key) ?? null;
export function putRow(row) {
  const at = results.rows.findIndex((r) => r.key === row.key);
  if (at >= 0) results.rows[at] = row; else results.rows.push(row);
  saveResults();
}

// ---- files ----------------------------------------------------------------------
export const readImage = (file) => { const bytes = new Uint8Array(readFileSync(join(samplesDir, file))); return { bytes, contentType: sniffImage(bytes) }; };
/** Saves a picture under a random name (nothing in it names the model); re-encoded as JPEG
 * quality 88 when ImageMagick is present, to keep the repository small. */
export function saveImage(bytes, dir = "img") {
  const file = `${dir}/${randomBytes(6).toString("hex")}.jpg`;
  const out = join(samplesDir, file);
  const converted = spawnSync("convert", ["-", "-strip", "-quality", "88", `jpg:${out}`], { input: Buffer.from(bytes) });
  if (converted.status !== 0 || !existsSync(out)) writeFileSync(out, bytes);
  return file;
}

// ---- one picture ------------------------------------------------------------------
const keys = { fal: () => providerKey("FAL_KEY"), openai: () => providerKey("OPENAI_API_KEY") };
/** One paid picture through the guard. Never retries; a content refusal is recorded as such. */
export async function draw(modelKey, { prompt, size, references = [], seed = null, note }) {
  const model = MODELS[modelKey];
  if (!model) throw new Error(`unknown model ${modelKey}`);
  const [width, height] = FAL_SIZES[size];
  const apiKey = keys[model.provider]();
  if (!apiKey) throw new Error(`${model.provider} key missing`);
  if (model.provider === "fal") {
    // The guard reserves for a picture up to 10% larger than asked (some models round the size up) and,
    // for the per-megapixel models, one extra megapixel per reference (fal may bill an edit's inputs).
    const catalogue = falModel(model.id);
    const inputs = catalogue.pricing === "megapixel" ? references.length * catalogue.extraMegapixelUsdMicros : 0;
    const expected = inputs + Math.max(falImagePriceUsdMicros(model.id, width, height, references.length),
      falImagePriceUsdMicros(model.id, Math.ceil(width * 1.1), Math.ceil(height * 1.1), references.length));
    const entry = reserve("fal", model.id, expected, note);
    try {
      const result = await generateFalImage(apiKey, { model: model.id, prompt, size, format: "jpeg", references, ...(model.seeds && seed ? { seed } : {}) }, { timeoutMs: 300_000 });
      const billed = result.priceUsdMicros + inputs;
      settle(entry, billed, { requestId: result.requestId });
      return { ok: true, bytes: result.bytes, width: result.width, height: result.height, endpoint: result.endpoint, requestId: result.requestId, ms: result.elapsedMs, usdMicros: billed };
    } catch (error) {
      if (!(error instanceof FalImageError)) { settle(entry, expected, { outcome: "error" }); throw error; }
      // fal does not bill a refused or failed request as far as its docs say; counted anyway, so the guard never under-counts.
      settle(entry, expected, { outcome: error.code, detail: error.detail });
      return { ok: false, refusal: isContentRefusal(error), code: error.code, detail: error.detail, usdMicros: expected };
    }
  }
  const input = { model: model.id, prompt, width, height, quality: model.quality, format: "jpeg", references };
  const expected = openAIImageReserveUsdMicros(input);
  const entry = reserve("openai", model.id, expected, note);
  try {
    const result = await generateOpenAIImage(apiKey, input);
    settle(entry, result.priceUsdMicros, { usage: result.usage });
    return { ok: true, bytes: result.bytes, width: result.width, height: result.height, endpoint: result.endpoint, requestId: null, ms: result.elapsedMs, usdMicros: result.priceUsdMicros, usage: result.usage };
  } catch (error) {
    if (!(error instanceof FalImageError)) { settle(entry, expected, { outcome: "error" }); throw error; }
    // OpenAI bills nothing for a request refused before generation (HTTP 400); anything else is counted in full.
    const billed = /^HTTP 400\b/.test(error.detail ?? "") ? 0 : expected;
    settle(entry, billed, { outcome: error.code, detail: error.detail });
    return { ok: false, refusal: isContentRefusal(error), code: error.code, detail: error.detail, usdMicros: billed };
  }
}

// ---- the vision judge ---------------------------------------------------------------
export const JUDGES = { haiku: { id: "claude-haiku-5-5", input: 0.1, output: 0.5 }, sonnet: { id: "claude-sonnet-5-5", input: 2, output: 10 } };
const image = (row) => ({ type: "image", source: { type: "base64", media_type: row.contentType, data: Buffer.from(row.bytes).toString("base64") } });
/** Rough upper bound before the call: about 1,600 tokens per picture, the text, and the answer. */
const judgeReserve = (judge, pictures) => Math.round((pictures * 1_800 + 1_500) * judge.input + 3_000 * judge.output);

/** Scores one frame (or anchor) against the hero's anchors. Returns the parsed JSON or null. */
export async function judgeFrame(judgeKey, { frame, refs, description, expectedPeople, clothingQuestion, kind = "frame" }) {
  const judge = JUDGES[judgeKey];
  const apiKey = providerKey("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const content = [{ type: "text", text: kind === "figure" ? "Image 1 is a full-figure character picture to judge." : "Image 1 is the FRAME to judge." }, image(frame)];
  refs.forEach((ref, index) => content.push({ type: "text", text: `Image ${index + 2} is a reference: ${ref.label}.` }, image(ref)));
  const heroRefs = refs.length ? `Images 2–${refs.length + 1}` : null;
  content.push({ type: "text", text: [
    `What Image 1 should show: ${description}`,
    expectedPeople !== null ? `Expected number of people: ${expectedPeople}.` : "",
    "Answer about Image 1 only.",
    heroRefs
      ? `identity (0–10 or null): is the man from ${heroRefs} in Image 1 with his face visible? If so, how clearly is it the same person — face shape, hair, stubble, apparent age, build? 10 = unmistakably the same man, 5 = a similar type with a different face, 0 = clearly someone else. null if he is not in the picture or his face is hidden (for example by a diving helmet).`
      : "identity: null.",
    clothingQuestion ? `clothing (true/false/null): ${clothingQuestion} null only if it cannot be seen at all.` : "clothing: null.",
    "people: how many people are visible (count everyone, also in the background).",
    "anatomy: look at every person and every hand. List each anatomy error: an extra or missing arm, hand or finger, a hand with no arm, merged or duplicated bodies, an extra face, a twisted or broken limb. ok is true only when there is none.",
    "adherence (0–10): how well Image 1 shows what it should (action, place, time and light, the right people and objects).",
    "text: true if there is any readable or pseudo text, letters, numbers, a logo or a watermark anywhere.",
    "Reply with one JSON object only: {\"identity\":n|null,\"clothing\":true|false|null,\"people\":n,\"anatomy\":{\"ok\":true|false,\"issues\":\"...\"},\"adherence\":n,\"text\":true|false,\"notes\":\"at most 25 words\"}",
  ].filter(Boolean).join("\n") });
  const entry = reserve("vision", judge.id, judgeReserve(judge, 1 + refs.length), `judge ${kind}`);
  let response, value;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: judge.id, max_tokens: 4_000, output_config: { effort: "medium" }, messages: [{ role: "user", content }] }),
      signal: AbortSignal.timeout(120_000),
    });
    value = await response.json().catch(() => null);
  } catch (error) {
    settle(entry, 0, { outcome: "transport" });
    return { score: null, error: String(error?.name ?? "transport") };
  }
  const usage = { input: value?.usage?.input_tokens ?? 0, output: value?.usage?.output_tokens ?? 0 };
  const cost = Math.round(usage.input * judge.input + usage.output * judge.output);
  settle(entry, cost, { usage });
  if (!response.ok) return { score: null, error: `HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`, usdMicros: cost };
  if (value?.stop_reason === "refusal") return { score: null, error: "judge refusal", usdMicros: cost };
  const text = (value?.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n");
  try {
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const num = (x) => (typeof x === "number" && x >= 0 && x <= 10 ? x : null);
    return { score: {
      identity: num(parsed.identity), clothing: typeof parsed.clothing === "boolean" ? parsed.clothing : null,
      people: Number.isInteger(parsed.people) ? parsed.people : null,
      anatomyOk: parsed.anatomy?.ok === true, anatomyIssues: String(parsed.anatomy?.issues ?? "").slice(0, 300),
      adherence: num(parsed.adherence), text: parsed.text === true, notes: String(parsed.notes ?? "").slice(0, 300),
    }, usdMicros: cost, usage };
  } catch {
    return { score: null, error: "unparsable", raw: text.slice(0, 300), usdMicros: cost };
  }
}

export const median = (list) => { const sorted = list.filter((v) => typeof v === "number").sort((a, b) => a - b); return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : null; };
export const mean = (list) => { const values = list.filter((v) => typeof v === "number"); return values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : null; };
