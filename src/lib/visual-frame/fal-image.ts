// fal.ai image adapter for subject pictures, anchors and live frames. Pure: the
// caller passes the key; nothing here reads the environment, logs, or returns
// provider URLs, prompts or keys to a client.
// Prices verified 2026-10-15 on fal.ai model pages (pro, flash):
//   fal-ai/flux-2-pro   — $0.03 for the first megapixel, $0.015 per extra megapixel (rounded up)
//   fal-ai/flux-2/flash — $0.005 per megapixel
// FLUX.2 [klein] list prices (Stage V, 2026-10-15): the fal model pages were not
// reachable from the cloud VM; the Black Forest Labs pricing guide lists 4B at
// $0.014 for the first megapixel + $0.001 per extra one and 9B at $0.015 + $0.002,
// and a third-party index lists fal at $0.016 per 1024×1024 image for klein 4B.
// The adapter counts the higher figure so a budget guard never under-counts.
// A megapixel here is 1024×1024 pixels (fal: "a 1024x1024 image costs $0.03").
// Endpoint IDs and request fields were confirmed on 2026-10-15 against the
// queue's own validation replies (empty bodies, rejected before any generation):
// text-to-image `fal-ai/flux-2/klein/4b`, `/9b`, `fal-ai/flux-2/flash`; with
// reference pictures (`image_urls`) `fal-ai/flux-2/klein/4b/edit`, `/9b/edit`,
// `fal-ai/flux-2/flash/edit`, `fal-ai/flux-2-pro/edit`.

export const FAL_IMAGE_MODELS = [
  {
    id: "fal-ai/flux-2-pro",
    label: "FLUX.2 [pro]",
    firstMegapixelUsdMicros: 30_000,
    extraMegapixelUsdMicros: 15_000,
    formats: ["jpeg", "png"],
    editEndpoint: "fal-ai/flux-2-pro/edit",
    maxReferences: 6,
    tier: "quality",
    note: { ru: "лучшее качество; портреты, места, имущество, ключевые кадры", en: "best quality; portraits, places, holdings, key frames" },
  },
  {
    id: "fal-ai/flux-2/flash",
    label: "FLUX.2 [flash]",
    firstMegapixelUsdMicros: 5_000,
    extraMegapixelUsdMicros: 5_000,
    formats: ["jpeg", "png", "webp"],
    editEndpoint: "fal-ai/flux-2/flash/edit",
    maxReferences: 4,
    tier: "fast",
    note: { ru: "быстро и дёшево; значки предметов, кадры", en: "fast and cheap; item icons, frames" },
  },
  {
    id: "fal-ai/flux-2/klein/4b",
    label: "FLUX.2 [klein] 4B",
    firstMegapixelUsdMicros: 16_000,
    extraMegapixelUsdMicros: 2_000,
    formats: ["jpeg", "png", "webp"],
    editEndpoint: "fal-ai/flux-2/klein/4b/edit",
    maxReferences: 4,
    tier: "fast",
    note: { ru: "самый быстрый; живые кадры", en: "fastest; live frames" },
  },
  {
    id: "fal-ai/flux-2/klein/9b",
    label: "FLUX.2 [klein] 9B",
    firstMegapixelUsdMicros: 17_000,
    extraMegapixelUsdMicros: 2_000,
    formats: ["jpeg", "png", "webp"],
    editEndpoint: "fal-ai/flux-2/klein/9b/edit",
    maxReferences: 4,
    tier: "fast",
    note: { ru: "быстрый, точнее держит референсы; живые кадры и анкеры", en: "fast, holds references better; live frames and anchors" },
  },
] as const;
export type FalImageModelId = (typeof FAL_IMAGE_MODELS)[number]["id"];
export const DEFAULT_FAL_IMAGE_MODEL: FalImageModelId = "fal-ai/flux-2-pro";
/** Picked in Stage V by measured speed, cost and consistency (docs/runs/stage-v). */
export const FAST_FAL_IMAGE_MODEL: FalImageModelId = "fal-ai/flux-2/klein/9b";

export type FalComposition = "portrait" | "item" | "location" | "holding" | "figure" | "atlas" | "frame";
export const FAL_SIZES = {
  square_hd: [1024, 1024],
  portrait_4_3: [768, 1024],
  portrait_16_9: [576, 1024],
  landscape_4_3: [1024, 768],
  landscape_16_9: [1024, 576],
} as const;
export type FalSizePreset = keyof typeof FAL_SIZES;
export const COMPOSITION_SIZE: Record<FalComposition, FalSizePreset> = {
  portrait: "square_hd",
  item: "square_hd",
  location: "landscape_16_9",
  holding: "landscape_16_9",
  figure: "portrait_16_9",
  atlas: "landscape_16_9",
  frame: "landscape_16_9",
};

export type FalImageErrorCode = "not_configured" | "validation" | "unavailable" | "failed" | "timeout";
export class FalImageError extends Error {
  code: FalImageErrorCode;
  /** Provider status and a short, key-free reason for diagnostics (never shown to a player). */
  detail: string | null;
  constructor(code: FalImageErrorCode, detail: string | null = null) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}
/** fal's prompt-side content checker refused this prompt (HTTP 422 on the pro model);
 * a transport problem looks different. The caller may re-submit a softened prompt once. */
export function isContentRefusal(error: unknown) {
  return error instanceof FalImageError && error.code === "validation" && /content checker|could not be processed|flagged/i.test(error.detail ?? "");
}

const MEGAPIXEL = 1024 * 1024;
export function falModel(id: string) {
  return FAL_IMAGE_MODELS.find((model) => model.id === id) ?? null;
}
/** Expected price in USD micros for one image of the given size. */
export function falImagePriceUsdMicros(modelId: FalImageModelId, width: number, height: number) {
  const model = falModel(modelId);
  if (!model || !Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 64 || height < 64)
    throw new FalImageError("validation");
  const megapixels = Math.max(1, Math.ceil((width * height) / MEGAPIXEL));
  return model.firstMegapixelUsdMicros + (megapixels - 1) * model.extraMegapixelUsdMicros;
}
export const usd = (micros: number) => `$${(micros / 1_000_000).toFixed(3)}`;

export type FalReference = { bytes: Uint8Array; contentType: "image/png" | "image/jpeg" | "image/webp" };
export type FalImageInput = {
  model: FalImageModelId;
  prompt: string;
  size: FalSizePreset;
  format: "jpeg" | "png" | "webp";
  seed?: number | null;
  /** Reference pictures (style image, the place, the people in the shot), sent as data URIs
   * to the model's edit endpoint. At most the model's limit; nothing else changes. */
  references?: FalReference[];
  /** klein and flash only: fal's own speed/quality trade-off. */
  acceleration?: "none" | "regular" | "high";
  /** pro only: content-checker strictness, 1 strict … 5 permissive (fal default 2). */
  safetyTolerance?: "1" | "2" | "3" | "4" | "5";
};
const MAX_REFERENCE_BYTES = 6_000_000;

function base64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
export const referenceDataUrl = (reference: FalReference) => `data:${reference.contentType};base64,${base64(reference.bytes)}`;

/** The endpoint a request goes to: the edit endpoint when references are attached. */
export function falEndpoint(input: Pick<FalImageInput, "model" | "references">) {
  const model = falModel(input.model);
  if (!model) throw new FalImageError("validation");
  return input.references?.length ? model.editEndpoint : model.id;
}
export function falRequestBody(input: FalImageInput) {
  const model = falModel(input.model);
  const references = input.references ?? [];
  if (!model || !input.prompt.trim() || input.prompt.length > 8_000 || !(input.size in FAL_SIZES) ||
    !(model.formats as readonly string[]).includes(input.format) ||
    references.length > model.maxReferences ||
    references.reduce((sum, reference) => sum + reference.bytes.byteLength, 0) > MAX_REFERENCE_BYTES ||
    (input.acceleration !== undefined && (input.model === "fal-ai/flux-2-pro" || !["none", "regular", "high"].includes(input.acceleration))) ||
    (input.safetyTolerance !== undefined && (input.model !== "fal-ai/flux-2-pro" || !["1", "2", "3", "4", "5"].includes(input.safetyTolerance))))
    throw new FalImageError("validation");
  return {
    prompt: input.prompt,
    image_size: input.size,
    output_format: input.format,
    enable_safety_checker: true,
    ...(input.model === "fal-ai/flux-2-pro" ? { safety_tolerance: input.safetyTolerance ?? "2" } : { num_images: 1 }),
    ...(input.acceleration ? { acceleration: input.acceleration } : {}),
    ...(Number.isSafeInteger(input.seed) ? { seed: input.seed } : {}),
    ...(references.length ? { image_urls: references.map(referenceDataUrl) } : {}),
  };
}

/** fal's queue client reads status and results at owner/app, without endpoint subpaths. */
export function falQueueRoot(modelId: string) {
  return "https://queue.fal.run/" + modelId.split("/").slice(0, 2).join("/");
}
export function permittedFalMediaUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === "fal.media" || url.hostname.endsWith(".fal.media") ||
        (url.hostname === "storage.googleapis.com" && url.pathname.startsWith("/falserverless/")));
  } catch {
    return false;
  }
}
export function sniffImage(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export type FalImageResult = {
  bytes: Uint8Array;
  contentType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  requestId: string;
  model: FalImageModelId;
  endpoint: string;
  priceUsdMicros: number;
  /** Wall-clock milliseconds from submit to the downloaded picture. */
  elapsedMs: number;
};
const MAX_IMAGE_BYTES = 12_000_000;

async function readLimited(response: Response, limit: number) {
  if (Number(response.headers.get("content-length")) > limit || !response.body) throw new FalImageError("unavailable");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new FalImageError("unavailable");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Submit → poll → fetch one image. Never retries a submit (no double charge). */
export async function generateFalImage(
  apiKey: string,
  input: FalImageInput,
  options: { fetcher?: typeof fetch; pollMs?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<FalImageResult> {
  if (!apiKey) throw new FalImageError("not_configured");
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const body = falRequestBody(input);
  const endpoint = falEndpoint(input);
  const started = Date.now();
  const json = async (url: string, init: RequestInit = {}) => {
    let response: Response;
    try {
      response = await fetcher(url, {
        ...init,
        redirect: "error",
        headers: { Authorization: "Key " + apiKey, "Content-Type": "application/json", "X-Fal-No-Retry": "1", ...init.headers },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new FalImageError("unavailable");
    }
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const value = JSON.parse(new TextDecoder().decode(await readLimited(response, 20_000)));
        const reason = Array.isArray(value?.detail) ? value.detail.map((row: { msg?: unknown; type?: unknown }) => row?.msg ?? row?.type).join("; ") : value?.detail ?? value?.error;
        if (typeof reason === "string") detail += `: ${reason.slice(0, 200)}`;
      } catch {
        /* The status alone is enough. */
      }
      throw new FalImageError([400, 401, 403, 404, 422].includes(response.status) ? "validation" : "unavailable", detail);
    }
    try {
      return JSON.parse(new TextDecoder().decode(await readLimited(response, 400_000)));
    } catch {
      throw new FalImageError("unavailable");
    }
  };
  const submitted = await json("https://queue.fal.run/" + endpoint, { method: "POST", body: JSON.stringify(body) });
  const requestId = submitted?.request_id;
  if (typeof requestId !== "string" || !/^[\w-]{8,80}$/.test(requestId)) throw new FalImageError("unavailable");
  const root = falQueueRoot(input.model) + "/requests/" + requestId;
  const deadline = Date.now() + (options.timeoutMs ?? 180_000);
  for (;;) {
    const status = await json(root + "/status?logs=0");
    if (status?.status === "COMPLETED") {
      if (status.error !== undefined || status.error_type !== undefined) throw new FalImageError("failed");
      break;
    }
    if (status?.status !== "IN_QUEUE" && status?.status !== "IN_PROGRESS") throw new FalImageError("unavailable");
    if (Date.now() > deadline) throw new FalImageError("timeout");
    await sleep(options.pollMs ?? 1_500);
  }
  const output = await json(root);
  // A request the worker rejected (schema or content) completes with a `detail` body and no images.
  if (!Array.isArray(output?.images)) {
    const reason = Array.isArray(output?.detail) ? output.detail.map((row: { msg?: unknown }) => row?.msg).join("; ") : output?.detail;
    throw new FalImageError("validation", `completed without images${typeof reason === "string" ? `: ${reason.slice(0, 200)}` : ""}`);
  }
  const image = output.images[0];
  if (!image || !permittedFalMediaUrl(image.url) || output.has_nsfw_concepts?.[0] === true) throw new FalImageError("failed");
  let response: Response;
  try {
    // Provider credentials never accompany the media CDN download.
    response = await fetcher(image.url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  } catch {
    throw new FalImageError("unavailable");
  }
  if (!response.ok) throw new FalImageError("unavailable");
  const bytes = await readLimited(response, MAX_IMAGE_BYTES);
  const contentType = sniffImage(bytes);
  if (!contentType) throw new FalImageError("unavailable");
  const [fallbackWidth, fallbackHeight] = FAL_SIZES[input.size];
  const width = Number.isSafeInteger(image.width) ? image.width : fallbackWidth;
  const height = Number.isSafeInteger(image.height) ? image.height : fallbackHeight;
  return { bytes, contentType, width, height, requestId, model: input.model, endpoint,
    priceUsdMicros: falImagePriceUsdMicros(input.model, width, height), elapsedMs: Date.now() - started };
}

/** Prompt for one subject image in the campaign's style (its Visual Bible / visual style text). */
export function falSubjectPrompt(input: {
  composition: FalComposition;
  name: string;
  description: string;
  style: string;
}) {
  const framing: Record<FalComposition, string> = {
    portrait: "Head-and-shoulders character portrait, three-quarter view, expressive face, plain dark background.",
    figure: "Full-body character illustration standing, whole figure visible from head to boots, neutral dark backdrop.",
    item: "A single object on dark velvet, three-quarter view, soft shadow, centered, nothing else in frame.",
    location: "Wide establishing illustration of the place, atmospheric light, no people in the foreground.",
    holding: "Wide illustration of the vehicle or base as a whole, clear silhouette, atmospheric light.",
    atlas: "Top-down illustrated map background, parchment and ink, soft terrain, no labels.",
    frame: "A cinematic story frame of the moment described, one clear focal action.",
  };
  return [
    framing[input.composition],
    `Subject: ${input.name}.`,
    input.description.trim() ? `Description: ${input.description.trim().slice(0, 1200)}` : "",
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}` : "",
    "No text, letters, captions, watermarks or UI elements in the image.",
  ].filter(Boolean).join("\n");
}

// A presentation-side rewrite for the one allowed re-submit after a content-checker
// refusal: age, nationality, injury and weapon words leave the description; the
// record itself is never changed. Bounded word lists in both interface languages.
const SOFTEN_PATTERNS: RegExp[] = [
  /\b(?:in (?:his|her|their) )?(?:\d{1,2}s|teens|twenties|thirties|forties|fifties|sixties|seventies)\b/gi,
  /\b\d{1,3}[- ]?(?:years?[- ]old|y\.?o\.?)\b/gi,
  /\b(?:teenage[rd]?|child|boy|girl|kid|elderly|old man|old woman|young)\b/gi,
  /\b(?:german|french|english|british|russian|american|chinese|japanese|portuguese|spanish|italian|arab\w*|african|asian|european|indian|turkish|polish|irish|scottish|dutch|greek|persian|nordic|slavic)\b/gi,
  /\b(?:scar\w*|wound\w*|blood\w*|bleeding|bruise\w*|burn\w*|burnt|maimed|severed|corpse|injur\w*|amputat\w*)\b/gi,
  /\b(?:guns?|revolvers?|pistols?|rifles?|firearms?|shotguns?|blades?|swords?|knife|knives|daggers?|axes?|spears?|crossbows?|bows?|grenades?|bombs?|explosives?|holster\w*|ammunition|bullets?)\b/gi,
  /(?:лет|года?)(?!\p{L})/giu,
  /(?<!\p{L})(?:подрост\p{L}*|ребён\p{L}*|мальчик\p{L}*|девочк\p{L}*|старик\p{L}*|старух\p{L}*|юн\p{L}+)(?!\p{L})/giu,
  /(?<!\p{L})(?:немец\p{L}*|немк\p{L}*|француз\p{L}*|англича\p{L}*|русск\p{L}*|американ\p{L}*|китае\p{L}*|япон\p{L}*|португал\p{L}*|испан\p{L}*|итальян\p{L}*|араб\p{L}*|африкан\p{L}*|азиат\p{L}*|европе\p{L}*|инди\p{L}*|турец\p{L}*|поля\p{L}*|ирланд\p{L}*|шотланд\p{L}*)(?!\p{L})/giu,
  /(?<!\p{L})(?:шрам\p{L}*|ран\p{L}*|кров\p{L}*|ожог\p{L}*|синяк\p{L}*|увеч\p{L}*|труп\p{L}*|изувеч\p{L}*)(?!\p{L})/giu,
  /(?<!\p{L})(?:револьвер\p{L}*|пистолет\p{L}*|винтовк\p{L}*|ружь\p{L}*|оружи\p{L}*|клин\p{L}*|меч\p{L}*|нож\p{L}*|кинжал\p{L}*|топор\p{L}*|копь\p{L}*|арбалет\p{L}*|лук\p{L}*|гранат\p{L}*|бомб\p{L}*|взрывчат\p{L}*|кобур\p{L}*|патрон\p{L}*|пул\p{L}*)(?!\p{L})/giu,
];
export function softenPrompt(prompt: string) {
  let text = prompt;
  for (const pattern of SOFTEN_PATTERNS) text = text.replace(pattern, "");
  return text.replace(/[ \t]+([,.;:])/g, "$1").replace(/,\s*(?=[,.;])/g, "").replace(/ {2,}/g, " ").replace(/\(\s*\)/g, "").trim();
}
