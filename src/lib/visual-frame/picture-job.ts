// The paid work of one Stage V picture, over an injected context (rows through
// the rpg_pictures RPC, pixels through the private bucket): references, one
// request to the model's provider (fal's queue or OpenAI's images API, polish 2),
// at most one softened re-submit after a content refusal and one bounded fallback
// model, storage, the row's result. Errors end in the row, never in a retry loop.
// No environment access: the server passes the keys, tests pass fakes.
import { isUuid } from "../persistence/validation.ts";
import { FAL_SIZES, FAST_FAL_IMAGE_MODEL, generateFalImage, isContentRefusal, softenPrompt, type FalImageModelId, type FalReference } from "./fal-image.ts";
import { generateOpenAIImage, type OpenAIImageModelId } from "./openai-image.ts";
import { isOpenAIPictureModel, maxReferencesFor, parsePicture, pictureSizeFor, type PictureComposition, type PictureSubjectKind, type PictureTier, type PictureTrigger, type PublicPicture } from "./pictures.ts";

export type PictureRpcAction = "read" | "settings.save" | "style.save" | "style.activate" | "style.clear" | "picture.create" | "picture.update" | "picture.hide" | "picture.private" | "style.private";
export type PictureJobContext = {
  campaignId: string;
  rpc: (action: PictureRpcAction, payload?: unknown) => Promise<unknown>;
  storage: {
    put: (path: string, bytes: Uint8Array, contentType: string) => Promise<void>;
    get: (path: string) => Promise<FalReference | null>;
  };
  sha256: (bytes: Uint8Array) => string;
  log?: (event: string, data: Record<string, unknown>) => void;
};
export class PictureJobError extends Error {
  code: "validation" | "conflict" | "not_found" | "unavailable";
  constructor(code: PictureJobError["code"]) { super(code); this.code = code; }
}

const extension = (contentType: string) => (contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg");
export const pictureStoragePath = (campaignId: string, pictureId: string, contentType: string) => `${campaignId}/pictures/${pictureId}.${extension(contentType)}`;
export const styleStoragePath = (styleId: string, contentType: string) => `styles/${styleId}/reference.${extension(contentType)}`;

export type PrivatePicture = PublicPicture & { prompt: string; shot: unknown; storagePath: string | null; contentType: string | null; sha256: string | null; referenceIds: string[]; requestId: string | null };
export async function privatePicture(ctx: PictureJobContext, id: string): Promise<PrivatePicture> {
  const raw = await ctx.rpc("picture.private", { id }) as Record<string, unknown>;
  const picture = parsePicture(raw);
  if (!picture || typeof raw.prompt !== "string") throw new PictureJobError("unavailable");
  return { ...picture, prompt: raw.prompt, shot: raw.shot ?? null, storagePath: typeof raw.storagePath === "string" ? raw.storagePath : null,
    contentType: typeof raw.contentType === "string" ? raw.contentType : null, sha256: typeof raw.sha256 === "string" ? raw.sha256 : null,
    referenceIds: Array.isArray(raw.referenceIds) ? raw.referenceIds.filter((v): v is string => isUuid(v)) : [], requestId: typeof raw.requestId === "string" ? raw.requestId : null };
}
export type CreatePictureInput = {
  id: string; kind: "frame" | "anchor"; subjectKind: PictureSubjectKind; subjectId: string; composition: PictureComposition;
  timeline: { timelineId: string; epoch: number }; tier: PictureTier; trigger: PictureTrigger; model: string; styleVersionId: string | null;
  shot: unknown; prompt: string; referenceIds: string[];
};
export async function createPictureRow(ctx: PictureJobContext, input: CreatePictureInput) {
  const picture = parsePicture(await ctx.rpc("picture.create", input));
  if (!picture) throw new PictureJobError("unavailable");
  return picture;
}
export async function updatePictureRow(ctx: PictureJobContext, payload: Record<string, unknown>) {
  return parsePicture(await ctx.rpc("picture.update", payload));
}

/** The pixels of reference pictures (ready pictures or style references of this campaign), in order; a missing object is skipped. */
export async function loadReferences(ctx: PictureJobContext, ids: string[]): Promise<FalReference[]> {
  const references: FalReference[] = [];
  for (const id of ids) {
    let path: string | null = null;
    try {
      const picture = await privatePicture(ctx, id);
      path = picture.status === "ready" ? picture.storagePath : null;
    } catch (error) {
      if ((error as { code?: string })?.code !== "not_found") throw error;
      try {
        const style = await ctx.rpc("style.private", { styleId: id }) as Record<string, unknown>;
        path = typeof style.referencePath === "string" ? style.referencePath : null;
      } catch (inner) {
        if ((inner as { code?: string })?.code !== "not_found") throw inner;
      }
    }
    if (!path) continue;
    const object = await ctx.storage.get(path);
    if (object) references.push(object);
  }
  return references;
}

export type PictureJobOptions = {
  /** The server's fal key (fal models). */
  apiKey: string;
  /** The server's OpenAI key (GPT Image models); the same presence check as fal's: empty means «not configured». */
  openAIApiKey?: string;
  extraCostUsdMicros?: number;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};
type Drawn = { bytes: Uint8Array; contentType: "image/png" | "image/jpeg" | "image/webp"; width: number; height: number; model: string; endpoint: string; requestId: string | null; priceUsdMicros: number; elapsedMs: number };

/** One request to whichever provider serves the model: fal's queue or OpenAI's images API. The
 * price comes back with the picture (fal at its list price, OpenAI from the reply's usage), so the
 * ledger and the daily cap see both the same way. */
async function draw(model: string, prompt: string, composition: PictureComposition, references: FalReference[], options: PictureJobOptions): Promise<Drawn> {
  const size = pictureSizeFor(model, composition);
  if (isOpenAIPictureModel(model)) {
    const [width, height] = FAL_SIZES[size];
    const result = await generateOpenAIImage(options.openAIApiKey ?? "", {
      model: model as OpenAIImageModelId, prompt, width, height, quality: "high", format: "jpeg", references: references.slice(0, maxReferencesFor(model)),
      // The app draws fights and wounds: the permissive moderation level the API offers; a block is still a refusal.
      moderation: "low",
    }, { fetcher: options.fetcher });
    return { ...result, requestId: null };
  }
  const result = await generateFalImage(options.apiKey, {
    model: model as FalImageModelId, prompt, size, format: "jpeg", references: references.slice(0, maxReferencesFor(model)),
    ...(model === "fal-ai/flux-2-pro" && (composition === "portrait" || composition === "figure") ? { safetyTolerance: "4" as const } : {}),
  }, { fetcher: options.fetcher, sleep: options.sleep });
  return result;
}

/** The ladder after a content refusal: one softened re-submit on the same model, then — bounded, a third
 * and last request — another model without that checker: FLUX.2 [pro] hands the picture to the fast
 * [klein] (Stage V bench), GPT Image 2.5 Flare to Sunburst (polish 2: Flare refused the cut-forearm shot
 * twice in three, Sunburst never). Nothing else retries. */
export const refusalFallbackModel = (model: string): string | null =>
  model === "fal-ai/flux-2-pro" ? FAST_FAL_IMAGE_MODEL : model === "gpt-image-2.5-flare" ? "gpt-image-2.5-sunburst" : null;

export async function runPictureJob(ctx: PictureJobContext, pictureId: string, options: PictureJobOptions) {
  const started = Date.now();
  const log = ctx.log ?? (() => {});
  const picture = await privatePicture(ctx, pictureId);
  if (picture.status !== "queued") return picture;
  await updatePictureRow(ctx, { id: pictureId, status: "generating" });
  let costUsdMicros = options.extraCostUsdMicros ?? 0;
  try {
    const references: FalReference[] = picture.referenceIds.length ? await loadReferences(ctx, picture.referenceIds) : [];
    const model = picture.model;
    const call = (prompt: string, drawWith = model) => draw(drawWith, prompt, picture.composition, references, options);
    let result: Drawn;
    try {
      result = await call(picture.prompt);
    } catch (error) {
      if (!isContentRefusal(error)) throw error;
      // The checker refused the prompt itself: one re-submit with a softened description, never a loop.
      log("picture_content_refusal", { campaignId: ctx.campaignId, pictureId, model, detail: (error as { detail?: string }).detail ?? null });
      try {
        result = await call(softenPrompt(picture.prompt));
      } catch (second) {
        const fallback = refusalFallbackModel(model);
        if (!isContentRefusal(second) || !fallback) throw second;
        log("picture_fast_fallback", { campaignId: ctx.campaignId, pictureId, model, fallback, detail: (second as { detail?: string }).detail ?? null });
        result = await call(picture.prompt, fallback);
      }
    }
    costUsdMicros += result.priceUsdMicros;
    const storagePath = pictureStoragePath(ctx.campaignId, pictureId, result.contentType);
    await ctx.storage.put(storagePath, result.bytes, result.contentType);
    const ready = await updatePictureRow(ctx, {
      id: pictureId, status: "ready",
      output: { storagePath, contentType: result.contentType, width: result.width, height: result.height, bytes: result.bytes.byteLength, sha256: ctx.sha256(result.bytes) },
      costUsdMicros, ...(result.requestId ? { requestId: result.requestId } : {}), elapsedMs: Date.now() - started, model: result.model,
    });
    log("picture_ready", { campaignId: ctx.campaignId, pictureId, kind: picture.kind, model: result.model, endpoint: result.endpoint, references: references.length, ms: Date.now() - started, providerMs: result.elapsedMs, costUsdMicros });
    return ready;
  } catch (error) {
    const code = (error as { code?: string })?.code ?? "failed";
    const detail = (error as { detail?: string })?.detail ?? null;
    // The shot's cost stays in the ledger even when the picture failed.
    const failed = await updatePictureRow(ctx, { id: pictureId, status: "failed", error: `${code}${detail ? `: ${detail}` : ""}`.slice(0, 200), costUsdMicros, elapsedMs: Date.now() - started });
    log("picture_failed", { campaignId: ctx.campaignId, pictureId, kind: picture.kind, code, detail, ms: Date.now() - started });
    return failed;
  }
}
