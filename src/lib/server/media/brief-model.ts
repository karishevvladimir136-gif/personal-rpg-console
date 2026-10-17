import "server-only";
import { BRIEF_MODEL, BRIEF_PRICE_PER_MILLION, briefRequest, parseBrief, type BriefRequestInput, type VisualBrief } from "../../visual-frame/brief.ts";

// The shot director's model calls (polish 2 §3): the visual brief from the whole
// turn, and the visual profile of a person or a place drafted once from the
// records' text and the approved anchor picture. Claude Sonnet 5.5 through the
// Messages API directly, like the shot model (shot-model.ts): no tools, adaptive
// thinking at low effort, one request, no retry; a failure falls back to the
// shot. Price per 1M tokens: input $2, output $10 (docs/MODELS.md; the bake-off's
// judge table). Every call reports its usage so the record can be re-costed.
export type BriefUsage = { inputTokens: number; outputTokens: number };
export const briefCostUsdMicros = (usage: BriefUsage) =>
  Math.round(usage.inputTokens * BRIEF_PRICE_PER_MILLION.input + usage.outputTokens * BRIEF_PRICE_PER_MILLION.output);
export type BriefResult = { brief: VisualBrief | null; usage: BriefUsage | null; costUsdMicros: number; elapsedMs: number; error: string | null; raw: string | null };

type Fetcher = typeof fetch;
type Content = { type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } };
async function messages(apiKey: string, body: unknown, fetcher: Fetcher, timeoutMs: number) {
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
  const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
  return { text, usage };
}

/** One request: the brief of a turn. Fails soft (the caller draws from the shot). */
export async function buildBrief(apiKey: string, input: BriefRequestInput, options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<BriefResult> {
  const started = Date.now();
  if (!apiKey) return { brief: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured", raw: null };
  const request = briefRequest(input);
  try {
    const { text, usage } = await messages(apiKey, {
      model: BRIEF_MODEL, max_tokens: 3000, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 25_000);
    const brief = parseBrief(text);
    return { brief, usage, costUsdMicros: briefCostUsdMicros(usage), elapsedMs: Date.now() - started, error: brief ? null : "unparsable", raw: brief ? null : text.slice(0, 400) };
  } catch (error) {
    return { brief: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120), raw: null };
  }
}

export type ProfileDraftInput = {
  kind: "person" | "place";
  name: string;
  /** The records' public text: details, the approved appearance text, worn items. */
  text: string;
  /** The approved anchor pictures (portrait, figure; a place's view), if any. */
  images: { bytes: Uint8Array; contentType: string; label: string }[];
  language: "ru" | "en";
};
export type ProfileDraftResult = { look: string | null; usage: BriefUsage | null; costUsdMicros: number; elapsedMs: number; error: string | null };

/** The profile request: a full look in plain English, from the text and the pictures, nothing invented beyond them. */
export function profileRequest(input: ProfileDraftInput) {
  const system = [
    "You write the visual profile of one subject of an illustrated role-playing campaign, for an illustrator who must draw this subject the same way in every picture.",
    input.kind === "person"
      ? "Write 60–140 words of plain English, present tense, one paragraph: face (shape, eyes, nose, jaw, skin tone), apparent age, hair (colour, length, style, facial hair), build and height, usual clothes with colours and materials, distinguishing marks (scars, tattoos, jewellery, glasses), bearing. Lead with what makes this person recognisable."
      : "Write 60–140 words of plain English, present tense, one paragraph: the materials and colours of the place, the light sources and their quality, the layout (what is where, the entrances, the size), the landmarks an illustrator would always show, what the weather or the sea does to it. Lead with what makes this place recognisable.",
    "Use the text and the pictures given; when they disagree, the pictures win for looks the owner approved. Never invent names, items or facts that are in neither. Do not describe the art style. Reply with the paragraph only, no title, no quotes.",
  ].join("\n");
  const content: Content[] = [];
  for (const image of input.images.slice(0, 3)) {
    content.push({ type: "text", text: `A picture of ${input.name}: ${image.label}.` });
    content.push({ type: "image", source: { type: "base64", media_type: image.contentType, data: Buffer.from(image.bytes).toString("base64") } });
  }
  content.push({ type: "text", text: [`The subject (${input.kind}): ${input.name}.`, `What the records say (${input.language === "ru" ? "Russian" : "English"}):`, input.text.replace(/\r/g, "").trim().slice(0, 4000) || "(nothing yet)"].join("\n") });
  return { system, content };
}

/** One request: the profile draft. Fails soft (no profile, nothing saved). */
export async function draftProfile(apiKey: string, input: ProfileDraftInput, options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<ProfileDraftResult> {
  const started = Date.now();
  if (!apiKey) return { look: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = profileRequest(input);
  try {
    const { text, usage } = await messages(apiKey, {
      model: BRIEF_MODEL, max_tokens: 2500, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.content }],
    }, options.fetcher ?? fetch, options.timeoutMs ?? 40_000);
    const look = text.replace(/\s+/g, " ").trim().slice(0, 2000);
    return { look: look.split(" ").length >= 15 ? look : null, usage, costUsdMicros: briefCostUsdMicros(usage), elapsedMs: Date.now() - started, error: look.split(" ").length >= 15 ? null : "too_short" };
  } catch (error) {
    return { look: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
