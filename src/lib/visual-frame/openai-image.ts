// OpenAI GPT Image adapter for anchors and frames, the same shape as the fal one
// (fal-image.ts): pure, the caller passes the key; nothing here reads the
// environment or logs, and no key, prompt or provider body reaches an error a
// client could see. One request per picture, never a retry (no double charge).
// Models and fields were confirmed on 2026-10-17 against the API itself: the key
// lists gpt-image-2, gpt-image-2.5-flare and gpt-image-2.5-sunburst; requests with
// one invalid value were refused before any generation and named the accepted
// values: quality low|medium|high|auto, size WIDTHxHEIGHT, moderation auto|low,
// output_format png|webp|jpeg; there is no seed and no input_fidelity.
// Billing is per token (OpenAI model pages as quoted by search results, the
// pages themselves are outside the VM's network list): text input $5, image input
// $8, image output $30 per million tokens on all three models. The response
// reports its own usage, so the price of a picture is exact, not estimated.
import { FalImageError, sniffImage, type FalReference } from "./fal-image.ts";

// medianSeconds: the bake-off's median from submit to the downloaded picture (one megapixel).
export const OPENAI_IMAGE_MODELS = [
  { id: "gpt-image-2", label: "GPT Image 2", maxReferences: 6, tier: "quality", medianSeconds: 69,
    note: { ru: "OpenAI; то же качество, что 2.5, втрое дороже и вчетверо дольше", en: "OpenAI; the quality of 2.5 at three times the price and four times the wait" } },
  { id: "gpt-image-2.5-sunburst", label: "GPT Image 2.5 Sunburst", maxReferences: 6, tier: "quality", medianSeconds: 27,
    note: { ru: "OpenAI; лучшее сходство и точность по слепому выбору владельца — анкеры, ключевые кадры, перерисовки", en: "OpenAI; best likeness and adherence in the owner's blind picks — anchors, key frames, redraws" } },
  { id: "gpt-image-2.5-flare", label: "GPT Image 2.5 Flare", maxReferences: 6, tier: "fast", medianSeconds: 16,
    note: { ru: "OpenAI; быстрая 2.5, то же сходство — живые кадры", en: "OpenAI; the fast 2.5 with the same likeness — live frames" } },
] as const;
export type OpenAIImageModelId = (typeof OPENAI_IMAGE_MODELS)[number]["id"];
export const openAIImageModel = (id: string) => OPENAI_IMAGE_MODELS.find((model) => model.id === id) ?? null;
/** USD micros per token (= USD per million tokens). */
export const OPENAI_IMAGE_PRICE = { textInput: 5, imageInput: 8, imageOutput: 30 } as const;

export type OpenAIImageUsage = { textInputTokens: number; imageInputTokens: number; outputTokens: number };
export const openAIImageCostUsdMicros = (usage: OpenAIImageUsage) =>
  usage.textInputTokens * OPENAI_IMAGE_PRICE.textInput + usage.imageInputTokens * OPENAI_IMAGE_PRICE.imageInput + usage.outputTokens * OPENAI_IMAGE_PRICE.imageOutput;

export type OpenAIImageInput = {
  model: OpenAIImageModelId;
  prompt: string;
  width: number;
  height: number;
  quality: "low" | "medium" | "high";
  format: "jpeg" | "png" | "webp";
  /** Reference pictures, in the order the prompt numbers them (Image 1, Image 2, …). */
  references?: FalReference[];
  moderation?: "auto" | "low";
};
const MAX_REFERENCE_BYTES = 20_000_000;

/** The JSON fields of one request; references go as `image[]` files of a multipart edit. */
export function openAIRequestFields(input: OpenAIImageInput) {
  const model = openAIImageModel(input.model);
  const references = input.references ?? [];
  if (!model || !input.prompt.trim() || input.prompt.length > 30_000 ||
    !Number.isSafeInteger(input.width) || !Number.isSafeInteger(input.height) || input.width % 16 || input.height % 16 ||
    input.width < 512 || input.height < 512 || input.width > 3840 || input.height > 3840 ||
    !["low", "medium", "high"].includes(input.quality) || !["jpeg", "png", "webp"].includes(input.format) ||
    (input.moderation !== undefined && !["auto", "low"].includes(input.moderation)) ||
    references.length > model.maxReferences || references.reduce((sum, row) => sum + row.bytes.byteLength, 0) > MAX_REFERENCE_BYTES)
    throw new FalImageError("validation");
  return {
    model: input.model, prompt: input.prompt, size: `${input.width}x${input.height}`, quality: input.quality, output_format: input.format, n: 1,
    ...(input.moderation ? { moderation: input.moderation } : {}),
  };
}
export const openAIEndpoint = (input: Pick<OpenAIImageInput, "references">) =>
  input.references?.length ? "https://api.openai.com/v1/images/edits" : "https://api.openai.com/v1/images/generations";

/** One request: JSON for a new picture, multipart with `image[]` files when references are attached. */
export function openAIRequest(input: OpenAIImageInput): { url: string; body: string | FormData; json: boolean } {
  const fields = openAIRequestFields(input);
  const references = input.references ?? [];
  if (!references.length) return { url: openAIEndpoint(input), body: JSON.stringify(fields), json: true };
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  references.forEach((reference, index) => {
    const extension = reference.contentType === "image/png" ? "png" : reference.contentType === "image/webp" ? "webp" : "jpg";
    form.append("image[]", new Blob([reference.bytes as BlobPart], { type: reference.contentType }), `reference-${index + 1}.${extension}`);
  });
  return { url: openAIEndpoint(input), body: form, json: false };
}

export type OpenAIImageResult = {
  bytes: Uint8Array;
  contentType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  model: OpenAIImageModelId;
  endpoint: string;
  usage: OpenAIImageUsage;
  priceUsdMicros: number;
  elapsedMs: number;
};

const errorDetail = (status: number, value: unknown) => {
  const error = (value as { error?: { code?: unknown; type?: unknown; message?: unknown } } | null)?.error;
  const parts = [`HTTP ${status}`];
  if (typeof error?.code === "string") parts.push(error.code);
  else if (typeof error?.type === "string") parts.push(error.type);
  // The provider's message names a field or a policy; it never carries the key, but cut anything key-like anyway.
  if (typeof error?.message === "string") parts.push(error.message.replace(/\b(?:sk|key)-[\w-]{6,}/gi, "[redacted]").slice(0, 200));
  return parts.join(": ");
};
function base64Bytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function generateOpenAIImage(apiKey: string, input: OpenAIImageInput, options: { fetcher?: typeof fetch; timeoutMs?: number } = {}): Promise<OpenAIImageResult> {
  if (!apiKey) throw new FalImageError("not_configured");
  const request = openAIRequest(input);
  const fetcher = options.fetcher ?? fetch;
  const started = Date.now();
  let response: Response;
  try {
    response = await fetcher(request.url, {
      method: "POST",
      redirect: "error",
      headers: { Authorization: "Bearer " + apiKey, ...(request.json ? { "Content-Type": "application/json" } : {}) },
      body: request.body,
      signal: AbortSignal.timeout(options.timeoutMs ?? 300_000),
    });
  } catch (error) {
    throw new FalImageError((error as { name?: string })?.name === "TimeoutError" ? "timeout" : "unavailable");
  }
  let value: unknown = null;
  try {
    value = await response.json();
  } catch {
    throw new FalImageError("unavailable", `HTTP ${response.status}`);
  }
  // A moderation block is a 400 with code moderation_blocked: a refusal, like fal's content checker.
  if (!response.ok) throw new FalImageError([400, 401, 403, 404, 422].includes(response.status) ? "validation" : "unavailable", errorDetail(response.status, value));
  const body = value as { data?: { b64_json?: unknown }[]; usage?: { input_tokens_details?: { text_tokens?: unknown; image_tokens?: unknown }; input_tokens?: unknown; output_tokens?: unknown } };
  const encoded = body.data?.[0]?.b64_json;
  if (typeof encoded !== "string" || !encoded) throw new FalImageError("failed", "no image in the reply");
  const bytes = base64Bytes(encoded);
  const contentType = sniffImage(bytes);
  if (!contentType) throw new FalImageError("unavailable", "not an image");
  const count = (v: unknown) => (typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : 0);
  const details = body.usage?.input_tokens_details;
  const imageInputTokens = count(details?.image_tokens);
  // Older replies carry only the total input; then all of it is counted at the higher image rate.
  const textInputTokens = details ? count(details.text_tokens) : 0;
  const usage = { textInputTokens, imageInputTokens: details ? imageInputTokens : count(body.usage?.input_tokens), outputTokens: count(body.usage?.output_tokens) };
  return { bytes, contentType, width: input.width, height: input.height, model: input.model, endpoint: request.url.replace("https://api.openai.com", ""),
    usage, priceUsdMicros: openAIImageCostUsdMicros(usage), elapsedMs: Date.now() - started };
}

/** The typical price of one picture, from the bake-off's measured usage (2026-10-17, one
 * megapixel, high quality: about 1,000 output tokens on 2.5 and 4,000 on GPT Image 2; about
 * 2,000 text tokens of prompt; about 1,000 image tokens per reference): what a price label
 * shows before the request. The row itself is settled to the exact usage afterwards. */
export function openAIImageTypicalUsdMicros(input: { model: string; width: number; height: number; quality: "low" | "medium" | "high"; references?: number }) {
  const pixels = Math.max(1, input.width * input.height) / (1024 * 1024);
  const perMegapixel = input.model === "gpt-image-2" ? 4_000 : 1_000;
  const quality = input.quality === "high" ? 1 : input.quality === "medium" ? 0.5 : 0.25;
  const outputTokens = Math.ceil(pixels * perMegapixel * quality);
  return openAIImageCostUsdMicros({ textInputTokens: 2_000, imageInputTokens: (input.references ?? 0) * 1_000, outputTokens });
}

/** What a budget guard reserves before a request, above the usage measured in the bake-off
 * (2026-10-17, one megapixel, high quality: GPT Image 2 about 4,000 output tokens, 2.5 about
 * 1,000; about 1,000 input tokens per reference). Settled to the exact usage afterwards. */
export function openAIImageReserveUsdMicros(input: Pick<OpenAIImageInput, "width" | "height" | "quality" | "references">) {
  const pixels = input.width * input.height;
  const outputPerMegapixel = input.quality === "high" ? 5_000 : input.quality === "medium" ? 1_500 : 500;
  const outputTokens = Math.ceil((pixels / (1024 * 1024)) * outputPerMegapixel);
  return openAIImageCostUsdMicros({ textInputTokens: 3_000, imageInputTokens: (input.references?.length ?? 0) * 2_000, outputTokens });
}
