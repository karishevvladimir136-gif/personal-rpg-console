import "server-only";
import { parseShot, shotRequest, type Shot, type ShotContext } from "../../visual-frame/shot.ts";

// The small fast model that turns one public paragraph into a shot, and the
// vision scorer the Stage V bench uses to measure consistency. Both call the
// Anthropic Messages API directly (no DM model, no tools, no thinking budget).
// Price per 1M tokens for prompts up to 100K (secondary sources, 2026-10-15;
// the official table was not reachable from the cloud VM): input $0.10,
// output $0.50. Every call reports its usage so the record can be re-costed.
export const SHOT_MODEL = "claude-haiku-5-5";
export const SHOT_PRICE_PER_MILLION = { input: 0.1, output: 0.5 };
export type ShotUsage = { inputTokens: number; outputTokens: number };
export type ShotResult = {
  shot: Shot | null;
  source: "model" | "fallback";
  usage: ShotUsage | null;
  costUsdMicros: number;
  elapsedMs: number;
  error: string | null;
};
export const shotCostUsdMicros = (usage: ShotUsage) =>
  Math.round((usage.inputTokens * SHOT_PRICE_PER_MILLION.input + usage.outputTokens * SHOT_PRICE_PER_MILLION.output));

type Fetcher = typeof fetch;
async function messages(apiKey: string, body: unknown, fetcher: Fetcher, timeoutMs: number) {
  const response = await fetcher("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
  if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
  const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
  const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
  return { text, usage };
}

/** One request, no retry: a failure falls back to the deterministic shot. */
export async function buildShot(apiKey: string, paragraph: string, context: ShotContext, options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<ShotResult> {
  const started = Date.now();
  if (!apiKey) return { shot: null, source: "fallback", usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = shotRequest(paragraph, context);
  try {
    const { text, usage } = await messages(apiKey, {
      model: SHOT_MODEL, max_tokens: 400, system: request.system, messages: [{ role: "user", content: request.user }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 20_000);
    const shot = parseShot(text);
    return { shot, source: shot ? "model" : "fallback", usage, costUsdMicros: shotCostUsdMicros(usage), elapsedMs: Date.now() - started, error: shot ? null : "unparsable" };
  } catch (error) {
    return { shot: null, source: "fallback", usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}

export type ConsistencyScore = { people: number; place: number; style: number; notes: string };
/** Bench only: the vision model compares a frame with the anchors it should match (0 = different, 10 = the same). */
export async function scoreConsistency(apiKey: string, input: {
  frame: { bytes: Uint8Array; contentType: string };
  anchors: { label: string; bytes: Uint8Array; contentType: string }[];
  shot: Shot;
}, options: { fetcher?: Fetcher } = {}): Promise<{ score: ConsistencyScore | null; usage: ShotUsage | null; costUsdMicros: number; raw: string }> {
  const image = (row: { bytes: Uint8Array; contentType: string }) => ({ type: "image", source: { type: "base64", media_type: row.contentType, data: Buffer.from(row.bytes).toString("base64") } });
  const content: unknown[] = [{ type: "text", text: "Image 1 is the FRAME to judge." }, image(input.frame)];
  input.anchors.forEach((anchor, index) => content.push({ type: "text", text: `Image ${index + 2} is a reference: ${anchor.label}.` }, image(anchor)));
  content.push({ type: "text", text: [
    `The frame should show: who ${JSON.stringify(input.shot.who)}, action ${JSON.stringify(input.shot.action)}, place ${JSON.stringify(input.shot.where)}.`,
    "Rate the frame against the references from 0 (nothing alike) to 10 (clearly the same): people — do the characters in the frame look like the reference portraits (face, hair, clothes)? place — does the setting match the reference place? style — same art style as the references?",
    "Reply with one JSON object only: {\"people\":n,\"place\":n,\"style\":n,\"notes\":\"one short sentence\"}. Use 0 for a category without a reference.",
  ].join("\n") });
  const { text, usage } = await messages(apiKey, { model: SHOT_MODEL, max_tokens: 200, messages: [{ role: "user", content }] }, options.fetcher ?? fetch, 60_000);
  let score: ConsistencyScore | null = null;
  try {
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    const v = JSON.parse(text.slice(start, end + 1));
    const n = (x: unknown) => (typeof x === "number" && x >= 0 && x <= 10 ? x : 0);
    score = { people: n(v.people), place: n(v.place), style: n(v.style), notes: String(v.notes ?? "").slice(0, 200) };
  } catch { /* unscored */ }
  return { score, usage, costUsdMicros: shotCostUsdMicros(usage), raw: text.slice(0, 400) };
}
