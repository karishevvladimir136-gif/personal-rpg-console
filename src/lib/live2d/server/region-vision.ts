// Fix S3-accept Д3: the region's model calls. No "server-only" marker (like vision.ts): keys and models are
// arguments, nothing here reads the environment, and the probe (scripts/eval/live2d/region-prep-probe.mjs) calls
// these from Node directly.
//   • the prep — the campaign's DM model designs the region (the server passes the DM's own model; the probe passes
//     the Messages API with the same model); one call, the reply's usage and cost reported, a failure fails soft;
//   • the check — the scenes' strong vision model (vision.ts CHECK_MODEL) reads the painted map against the prep and
//     locates every place on it, in the scenes' own JSON shape.
import type { SceneCheck } from "../contracts.ts";
import { parseRegionPrepReply, regionPrepRequest, type RegionPrepDraft, type RegionPrepSource } from "../region-prep.ts";
import { parseRegionCheck, regionCheckRequest, type RegionCheckItem } from "../region-marks.ts";
import { CHECK_MODEL, costUsdMicros, messages, type CallOptions, type Image, type Usage } from "./vision.ts";
import { dmModelSpec, dmUsageCost } from "../../model-runtime/dm-models.ts";

/** One text request to a model: the system and the user text in, the reply's text, usage and cost out. */
export type TextModel = (request: { system: string; user: string; maxOutputTokens: number }) => Promise<{ text: string; usage: Usage | null; costUsdMicros: number; model: string }>;

/** A TextModel over the Anthropic Messages API (the probe's path to the DM's model), priced by the DM models' table. */
export function anthropicTextModel(apiKey: string, model: string, options: CallOptions & { effort?: "low" | "medium" | "high" } = {}): TextModel {
  return async (request) => {
    const { text, usage } = await messages(apiKey, {
      model, max_tokens: request.maxOutputTokens, output_config: { effort: options.effort ?? "medium" }, system: request.system, messages: [{ role: "user", content: request.user }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 120_000);
    const spec = dmModelSpec("anthropic", model);
    const cost = spec ? Math.round(dmUsageCost(spec, { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null }) * 1_000_000) : costUsdMicros(model, usage);
    return { text, usage, costUsdMicros: cost, model };
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
    const draft = parseRegionPrepReply(reply.text, source.places.map((row) => row.id));
    return { draft, usage: reply.usage, costUsdMicros: reply.costUsdMicros, elapsedMs: Date.now() - started, model: reply.model, error: draft ? null : "unparsable", chars: reply.text.length };
  } catch (error) {
    return { draft: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, model: null, error: String((error as Error)?.message ?? error).slice(0, 120), chars: 0 };
  }
}

export type RegionCheckResult = { check: SceneCheck | null; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null; raw: string | null };
/** The painted map against the prep: every landmark found and located, the places inside a settlement located where
 * they are drawn, invented settlements listed — the scenes' check shape. */
export async function checkRegionMap(apiKey: string, items: readonly RegionCheckItem[], regionName: string, picture: Image, options: CallOptions = {}): Promise<RegionCheckResult> {
  const started = Date.now();
  if (!apiKey) return { check: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured", raw: null };
  if (!items.length) return { check: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "nothing to check", raw: null };
  const request = regionCheckRequest(items, regionName);
  try {
    const { text, usage } = await messages(apiKey, {
      model: CHECK_MODEL, max_tokens: 6000, output_config: { effort: "medium" }, system: request.system,
      messages: [{ role: "user", content: [{ type: "text", text: "The painted map to check:" }, { type: "image", source: { type: "base64", media_type: picture.contentType, data: Buffer.from(picture.bytes).toString("base64") } }, { type: "text", text: request.text }] }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 60_000);
    const cost = costUsdMicros(CHECK_MODEL, usage);
    const check = parseRegionCheck(text, items, CHECK_MODEL, cost, new Date().toISOString());
    return { check, usage, costUsdMicros: cost, elapsedMs: Date.now() - started, error: check ? null : "unparsable", raw: check ? null : text.slice(-600) };
  } catch (error) {
    return { check: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120), raw: null };
  }
}
