// fal.ai text-to-image adapter for subject visuals (items, portraits, places,
// holdings). Pure: the caller passes the key; nothing here reads the
// environment, logs, or returns provider URLs, prompts or keys to a client.
// Prices verified 2026-10-15 on fal.ai model pages:
//   fal-ai/flux-2-pro   — $0.03 for the first megapixel, $0.015 per extra megapixel (rounded up)
//   fal-ai/flux-2/flash — $0.005 per megapixel
// A megapixel here is 1024×1024 pixels (fal: "a 1024x1024 image costs $0.03").

export const FAL_IMAGE_MODELS = [
  {
    id: "fal-ai/flux-2-pro",
    label: "FLUX.2 [pro]",
    firstMegapixelUsdMicros: 30_000,
    extraMegapixelUsdMicros: 15_000,
    formats: ["jpeg", "png"],
    note: { ru: "лучшее качество; портреты, места, имущество", en: "best quality; portraits, places, holdings" },
  },
  {
    id: "fal-ai/flux-2/flash",
    label: "FLUX.2 [flash]",
    firstMegapixelUsdMicros: 5_000,
    extraMegapixelUsdMicros: 5_000,
    formats: ["jpeg", "png", "webp"],
    note: { ru: "быстро и дёшево; значки предметов", en: "fast and cheap; item icons" },
  },
] as const;
export type FalImageModelId = (typeof FAL_IMAGE_MODELS)[number]["id"];
export const DEFAULT_FAL_IMAGE_MODEL: FalImageModelId = "fal-ai/flux-2-pro";

export type FalComposition = "portrait" | "item" | "location" | "holding" | "figure" | "atlas";
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

export type FalImageInput = {
  model: FalImageModelId;
  prompt: string;
  size: FalSizePreset;
  format: "jpeg" | "png";
  seed?: number | null;
};
export function falRequestBody(input: FalImageInput) {
  const model = falModel(input.model);
  if (!model || !input.prompt.trim() || input.prompt.length > 8_000 || !(input.size in FAL_SIZES) ||
    !(model.formats as readonly string[]).includes(input.format))
    throw new FalImageError("validation");
  return {
    prompt: input.prompt,
    image_size: input.size,
    output_format: input.format,
    enable_safety_checker: true,
    ...(input.model === "fal-ai/flux-2-pro" ? { safety_tolerance: "2" } : { num_images: 1 }),
    ...(Number.isSafeInteger(input.seed) ? { seed: input.seed } : {}),
  };
}

/** fal's queue client reads status and results at owner/app, without endpoint subpaths. */
export function falQueueRoot(modelId: FalImageModelId) {
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
  priceUsdMicros: number;
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
  const submitted = await json("https://queue.fal.run/" + input.model, { method: "POST", body: JSON.stringify(body) });
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
  const image = Array.isArray(output?.images) ? output.images[0] : null;
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
  return { bytes, contentType, width, height, requestId, model: input.model, priceUsdMicros: falImagePriceUsdMicros(input.model, width, height) };
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
  };
  return [
    framing[input.composition],
    `Subject: ${input.name}.`,
    input.description.trim() ? `Description: ${input.description.trim().slice(0, 1200)}` : "",
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}` : "",
    "No text, letters, captions, watermarks or UI elements in the image.",
  ].filter(Boolean).join("\n");
}
