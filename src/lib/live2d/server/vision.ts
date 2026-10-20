// No "server-only" marker: the key is an argument, nothing here reads the environment, and the
// probe script (scripts/eval/live2d) calls these helpers from Node directly.
import type { SceneCheck, SceneSheet } from "../contracts.ts";
import { checkRequest, locatorRequest, parseCheckReply, parseLocatorReply, parseSheetReply, sheetRequest, type Located, type PoiCandidate, type SheetSource } from "../scene.ts";

// The 2D layer's model calls, all through the Anthropic Messages API directly
// (no DM, no tools; the pattern of src/lib/server/media/brief-model.ts):
//   • the scene sheet — Claude Sonnet 5.5 from the records and the public narration;
//   • the check — a strong vision model (Sonnet 5.5; it runs once per place): every
//     must-show item visible and locatable, no contradicting object, no named people;
//   • the locator — the cheap vision model (Haiku 5.5): positions for the records' POIs only;
//   • the region's seeds — Sonnet 5.5: a few latent hooks, stored privately.
// Every call reports its usage and cost; a failure fails soft (the caller falls back).
export const SHEET_MODEL = "claude-sonnet-5-5";
export const CHECK_MODEL = "claude-sonnet-5-5";
export const LOCATOR_MODEL = "claude-haiku-5-5";
/** Price per 1M tokens (docs/MODELS.md; image input counts as input tokens). */
export const PRICE_PER_MILLION: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};
export type Usage = { inputTokens: number; outputTokens: number };
export const costUsdMicros = (model: string, usage: Usage | null) => {
  const price = PRICE_PER_MILLION[model] ?? PRICE_PER_MILLION["claude-sonnet-5-5"];
  return usage ? Math.round(usage.inputTokens * price.input + usage.outputTokens * price.output) : 0;
};

type Fetcher = typeof fetch;
type Content = { type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } };
export type Image = { bytes: Uint8Array; contentType: string };
const image = (row: Image): Content => ({ type: "image", source: { type: "base64", media_type: row.contentType, data: Buffer.from(row.bytes).toString("base64") } });

export async function messages(apiKey: string, body: unknown, fetcher: Fetcher, timeoutMs: number): Promise<{ text: string; usage: Usage }> {
  const response = await fetcher("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string }; stop_reason?: string } | null;
  if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
  if (value.stop_reason === "refusal") throw new Error("refusal");
  const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
  return { text, usage: { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 } };
}

export type CallOptions = { fetcher?: Fetcher; timeoutMs?: number };
export type SheetResult = { sheet: SceneSheet | null; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null };
export async function buildSheet(apiKey: string, source: SheetSource, options: CallOptions = {}): Promise<SheetResult> {
  const started = Date.now();
  if (!apiKey) return { sheet: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = sheetRequest(source);
  try {
    const { text, usage } = await messages(apiKey, {
      model: SHEET_MODEL, max_tokens: 3000, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 40_000);
    const sheet = parseSheetReply(text);
    return { sheet, usage, costUsdMicros: costUsdMicros(SHEET_MODEL, usage), elapsedMs: Date.now() - started, error: sheet ? null : "unparsable" };
  } catch (error) {
    return { sheet: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}

export type CheckResult = { check: SceneCheck | null; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null; raw: string | null };
export async function checkScene(apiKey: string, sheet: SceneSheet, placeName: string, picture: Image, options: CallOptions = {}): Promise<CheckResult> {
  const started = Date.now();
  if (!apiKey) return { check: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured", raw: null };
  const request = checkRequest(sheet, placeName);
  try {
    // Room for the answer after any reasoning the model writes out; the JSON is the last object in the text.
    const { text, usage } = await messages(apiKey, {
      model: CHECK_MODEL, max_tokens: 6000, output_config: { effort: "medium" }, system: request.system,
      messages: [{ role: "user", content: [{ type: "text", text: "The illustration to check:" }, image(picture), { type: "text", text: request.text }] }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 60_000);
    const cost = costUsdMicros(CHECK_MODEL, usage);
    const check = parseCheckReply(text, request.keys, CHECK_MODEL, cost, new Date().toISOString());
    return { check, usage, costUsdMicros: cost, elapsedMs: Date.now() - started, error: check ? null : "unparsable", raw: check ? null : text.slice(-600) };
  } catch (error) {
    return { check: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120), raw: null };
  }
}

export type LocateResult = { located: Located[]; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null };
export async function locateScene(apiKey: string, candidates: readonly PoiCandidate[], placeName: string, picture: Image, options: CallOptions = {}): Promise<LocateResult> {
  const started = Date.now();
  const request = locatorRequest(candidates, placeName);
  if (!apiKey) return { located: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  if (!request.keys.length) return { located: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: null };
  try {
    const { text, usage } = await messages(apiKey, {
      model: LOCATOR_MODEL, max_tokens: 1500, output_config: { effort: "low" }, system: request.system,
      messages: [{ role: "user", content: [{ type: "text", text: "The illustration:" }, image(picture), { type: "text", text: request.text }] }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 40_000);
    return { located: parseLocatorReply(text, request.keys), usage, costUsdMicros: costUsdMicros(LOCATOR_MODEL, usage), elapsedMs: Date.now() - started, error: null };
  } catch (error) {
    return { located: [], usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}

/** Latent hooks of an area (the direction doc's «POIs make freedom interesting»): 3–5 private
 * seeds — a theme and a premise each — from the public description alone. Never shown to the player. */
export type SeedDraft = { theme: string; premise: string };
export function seedsRequest(input: { areaName: string; description: string; canon: string; places: string[]; language: "ru" | "en" }) {
  const system = [
    "You are the game master's private notebook for a role-playing campaign. Write 3–5 latent adventure hooks for one area: places, rumours, people, activities, mysteries or dangers that would make exploring it interesting — an old cemetery, a sealed mine, a strange house, a travelling collector. Each is a seed, not a quest: some become scenes, some treasures, some nothing.",
    "Reply with one JSON object only: {\"seeds\":[{\"theme\":\"...\",\"premise\":\"...\"}]}. theme: 2–6 words naming the hook. premise: 2–4 sentences of the private truth behind it (what it really is, who is involved, what a curious party could find), in the campaign's language. Do not reveal how the party learns of it; do not tie every seed to the same place; no modern references; keep to what the setting allows.",
  ].join("\n");
  const user = [
    `The area: ${input.areaName}.`,
    input.description ? `The records say: ${input.description.slice(0, 1200)}` : "",
    input.canon ? `The world's canon about it: ${input.canon.slice(0, 1500)}` : "",
    input.places.length ? `Known places in it: ${input.places.join(", ")}.` : "",
    `Campaign language: ${input.language === "ru" ? "Russian" : "English"}.`,
  ].filter(Boolean).join("\n");
  return { system, user };
}
export function parseSeedsReply(text: string): SeedDraft[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as { seeds?: unknown };
    return (Array.isArray(raw.seeds) ? raw.seeds : []).flatMap((row) => {
      const r = row as Record<string, unknown>;
      const theme = typeof r?.theme === "string" ? r.theme.replace(/\s+/g, " ").trim().slice(0, 80) : "";
      const premise = typeof r?.premise === "string" ? r.premise.replace(/\s+/g, " ").trim().slice(0, 2000) : "";
      return theme && premise ? [{ theme, premise }] : [];
    }).slice(0, 5);
  } catch {
    return [];
  }
}
export type SeedsResult = { seeds: SeedDraft[]; usage: Usage | null; costUsdMicros: number; elapsedMs: number; error: string | null };
export async function draftSeeds(apiKey: string, input: Parameters<typeof seedsRequest>[0], options: CallOptions = {}): Promise<SeedsResult> {
  const started = Date.now();
  if (!apiKey) return { seeds: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = seedsRequest(input);
  try {
    const { text, usage } = await messages(apiKey, {
      model: SHEET_MODEL, max_tokens: 2500, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 40_000);
    const seeds = parseSeedsReply(text);
    return { seeds, usage, costUsdMicros: costUsdMicros(SHEET_MODEL, usage), elapsedMs: Date.now() - started, error: seeds.length ? null : "unparsable" };
  } catch (error) {
    return { seeds: [], usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
