// Fix S3-accept Д3: the region's model calls. No "server-only" marker (like vision.ts): keys and models are
// arguments, nothing here reads the environment, and the probe (scripts/eval/live2d/region-prep-probe.mjs) calls
// these from Node directly.
//   • the prep — the campaign's DM model designs the region (the server passes the DM's own model; the probe passes
//     the Messages API with the same model); one call, the reply's usage and cost reported, a failure fails soft;
//   • the check — the scenes' strong vision model (vision.ts CHECK_MODEL) reads the painted map against the prep and
//     locates every place on it, in the scenes' own JSON shape.
import type { SceneCheck } from "../contracts.ts";
import { parseRegionPrepReply, regionPrepRequest, type RegionPrepDraft, type RegionPrepSource } from "../region-prep.ts";
import { parseRegionCheck, regionCheckRequest, type PictureSize, type RegionCheckItem } from "../region-marks.ts";
import { CHECK_MODEL, costUsdMicros, messages, type CallOptions, type Image, type Usage } from "./vision.ts";
import { dmModelSpec, dmUsageCost } from "../../model-runtime/dm-models.ts";

/** One text request to a model: the system and the user text in, the reply's text, usage and cost out. */
export type TextModel = (request: { system: string; user: string; maxOutputTokens: number }) => Promise<{ text: string; usage: Usage | null; costUsdMicros: number; model: string;
  /** «refusal: <category>» when the provider declined (no text; the input may still be billed). */ refusal?: string | null }>;

/** A TextModel over the Anthropic Messages API (the probe's path to the DM's model), priced by the DM models' table, or by
 * `price` (USD per 1M tokens) for a model that table does not list (a probe's override). */
export function anthropicTextModel(apiKey: string, model: string, options: CallOptions & { effort?: "low" | "medium" | "high"; price?: { input: number; output: number } } = {}): TextModel {
  const price = (usage: Usage) => {
    const spec = dmModelSpec("anthropic", model);
    return options.price ? Math.round(usage.inputTokens * options.price.input + usage.outputTokens * options.price.output)
      : spec ? Math.round(dmUsageCost(spec, { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null }) * 1_000_000) : costUsdMicros(model, usage);
  };
  return async (request) => {
    // The Messages API directly (not vision.ts's helper, which throws a refusal away with its usage and category).
    const response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: request.maxOutputTokens, output_config: { effort: options.effort ?? "medium" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 120_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string };
      stop_reason?: string; stop_details?: { category?: string | null } | null } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    return { text, usage, costUsdMicros: price(usage), model, refusal: value.stop_reason === "refusal" ? `refusal: ${value.stop_details?.category ?? "unknown"}` : null };
  };
}

export const REGION_PREP_OUTPUT_TOKENS = 8000;
export type RegionPrepResult = { draft: RegionPrepDraft | null; usage: Usage | null; costUsdMicros: number; elapsedMs: number; model: string | null; error: string | null; chars: number };
/** The DM designs the region (or the places new to it): the public part and the hidden part, or null on a failure. */
export async function draftRegionPrep(model: TextModel, source: RegionPrepSource): Promise<RegionPrepResult> {
  const started = Date.now();
  const request = regionPrepRequest(source);
  try {
    const reply = await model({ system: request.system, user: request.user, maxOutputTokens: REGION_PREP_OUTPUT_TOKENS });
    const draft = reply.refusal ? null : parseRegionPrepReply(reply.text, source.places.map((row) => row.id));
    return { draft, usage: reply.usage, costUsdMicros: reply.costUsdMicros, elapsedMs: Date.now() - started, model: reply.model, error: reply.refusal ?? (draft ? null : "unparsable"), chars: reply.text.length };
  } catch (error) {
    return { draft: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, model: null, error: String((error as Error)?.message ?? error).slice(0, 120), chars: 0 };
  }
}

/** A PNG's, JPEG's or WebP's size in pixels from its header, or null. */
export function imageSize(bytes: Uint8Array): PictureSize | null {
  const u16 = (at: number) => (bytes[at] << 8) | bytes[at + 1];
  const u32 = (at: number) => ((bytes[at] << 24) >>> 0) + (bytes[at + 1] << 16) + (bytes[at + 2] << 8) + bytes[at + 3];
  const le16 = (at: number) => bytes[at] | (bytes[at + 1] << 8);
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes[1] === 0x50) return { width: u32(16), height: u32(20) };
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    for (let at = 2; at + 9 < bytes.length;) {
      if (bytes[at] !== 0xff) { at += 1; continue; }
      const marker = bytes[at + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: u16(at + 7), height: u16(at + 5) };
      at += 2 + u16(at + 2);
    }
    return null;
  }
  if (bytes.length > 30 && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    const kind = String.fromCharCode(...bytes.slice(12, 16));
    if (kind === "VP8X") return { width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)), height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) };
    if (kind === "VP8 ") return { width: le16(26) & 0x3fff, height: le16(28) & 0x3fff };
    if (kind === "VP8L") { const b = bytes.slice(21, 25); return { width: 1 + (((b[1] & 0x3f) << 8) | b[0]), height: 1 + (((b[3] & 0xf) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6)) }; }
  }
  return null;
}

export type RegionCheckResult = { check: SceneCheck | null; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null; raw: string | null };
/** The painted map against the prep: every landmark found and located, the places inside a settlement located where
 * they are drawn, invented settlements listed — the scenes' check shape. */
export async function checkRegionMap(apiKey: string, items: readonly RegionCheckItem[], regionName: string, picture: Image,
  options: CallOptions & { /** A probe's override only; the app always checks with CHECK_MODEL. */ model?: string; price?: { input: number; output: number };
    /** Pixels of the stated size (the default when the size can be read), or the scenes' fractions. */ coordinates?: "pixel" | "fraction" } = {}): Promise<RegionCheckResult> {
  const model = options.model ?? CHECK_MODEL;
  const started = Date.now();
  if (!apiKey) return { check: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured", raw: null };
  if (!items.length) return { check: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "nothing to check", raw: null };
  const size = options.coordinates === "fraction" ? null : imageSize(picture.bytes);
  const request = regionCheckRequest(items, regionName, size);
  try {
    const { text, usage } = await messages(apiKey, {
      model, max_tokens: 6000, output_config: { effort: "medium" }, system: request.system,
      messages: [{ role: "user", content: [{ type: "text", text: "The painted map to check:" }, { type: "image", source: { type: "base64", media_type: picture.contentType, data: Buffer.from(picture.bytes).toString("base64") } }, { type: "text", text: request.text }] }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 60_000);
    const cost = options.price ? Math.round(usage.inputTokens * options.price.input + usage.outputTokens * options.price.output) : costUsdMicros(model, usage);
    const check = parseRegionCheck(text, items, model, cost, new Date().toISOString(), size);
    return { check, usage, costUsdMicros: cost, elapsedMs: Date.now() - started, error: check ? null : "unparsable", raw: check ? null : text.slice(-600) };
  } catch (error) {
    return { check: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120), raw: null };
  }
}
