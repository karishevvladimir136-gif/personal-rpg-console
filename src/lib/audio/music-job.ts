// The paid work of a world's soundtrack over an injected context (rows through
// the rpg_music RPC, bytes through the private bucket, the track through fal's
// queue): planning a pack, generating one queued track at a time, storing an
// upload. Errors end in the row, never in a retry loop; the cap is counted in
// SQL before a request is sent. No environment access: the server passes the
// key, tests pass fakes. Gameplay never waits for any of this.
import { isUuid } from "../persistence/validation.ts";
import { audioDurationMs } from "./audio-meta.ts";
import { parseMusicPack, parseMusicTrack, type MusicPack, type MusicSettings, type MusicTrack } from "./contracts.ts";
import { FalMusicError, type FalMusicResult } from "./fal-music.ts";
import { AUDIO_EXTENSIONS, MAX_TRACK_BYTES, musicModel, musicPriceUsdMicros, requestedSeconds, sniffAudio, type MusicRequest } from "./models.ts";
import { isMoodId, MOOD_IDS, mood, type MoodId } from "./moods.ts";
import { AMBIENT_IDS, ambientKind, ambientSeconds, isAmbientId, type AmbientId } from "./ambient.ts";
import { AMBIENT_NEGATIVE_PROMPT, ambientRequestFor, cueSeconds, musicRequestFor, NEGATIVE_PROMPT } from "./prompts.ts";
import type { MusicLayer, TrackTag } from "./contracts.ts";

export type MusicRpcAction = "read" | "settings.save" | "pack.create" | "pack.cancel" | "track.next" | "track.update" | "upload.create" | "track.hide" | "track.tag" | "track.private";
export type MusicJobContext = {
  campaignId: string;
  rpc: (action: MusicRpcAction, payload?: unknown) => Promise<unknown>;
  storage: {
    put: (path: string, bytes: Uint8Array, contentType: string) => Promise<void>;
  };
  sha256: (bytes: Uint8Array) => string;
  /** One paid request to fal (the server binds the key; tests bind a fake). */
  generate: (request: MusicRequest) => Promise<FalMusicResult>;
  newId: () => string;
  log?: (event: string, data: Record<string, unknown>) => void;
};
export class MusicJobError extends Error {
  code: "validation" | "conflict" | "not_found" | "unavailable";
  constructor(code: MusicJobError["code"]) { super(code); this.code = code; }
}

export const trackStoragePath = (campaignId: string, trackId: string, contentType: keyof typeof AUDIO_EXTENSIONS) => `${campaignId}/music/${trackId}.${AUDIO_EXTENSIONS[contentType]}`;

export type PackPlan = {
  id: string;
  layer: MusicLayer;
  styleText: string;
  model: string;
  moods: TrackTag[];
  variants: number;
  capUsdMicros: number;
  tracks: { id: string; moods: TrackTag[]; variant: number; title: string; model: string; prompt: string; seed: number | null; requestedSeconds: number }[];
  /** The list price of the whole plan, counted before anything is sent. */
  expectedUsdMicros: number;
};

/** The tracks of a new pack: every mood × the variants, with their prompts and list prices. */
export function planPack(input: { settings: MusicSettings; styleText?: string; moods?: MoodId[]; model?: string; variants?: number; newId: () => string }): PackPlan {
  const styleText = (input.styleText ?? input.settings.styleText).trim();
  if (!styleText || styleText.length > 1200) throw new MusicJobError("validation");
  const modelId = input.model ?? input.settings.model;
  const model = musicModel(modelId);
  if (!model) throw new MusicJobError("validation");
  const moods = input.moods ?? [...MOOD_IDS];
  if (!moods.length || !moods.every(isMoodId) || new Set(moods).size !== moods.length) throw new MusicJobError("validation");
  const variants = input.variants ?? input.settings.variants;
  if (!Number.isSafeInteger(variants) || variants < 1 || variants > 3) throw new MusicJobError("validation");
  const tracks: PackPlan["tracks"] = [];
  let expected = 0;
  moods.forEach((moodId, index) => {
    for (let variant = 1; variant <= variants; variant += 1) {
      const seconds = requestedSeconds(model, cueSeconds(moodId));
      const request = musicRequestFor({ styleText, moodId, model: modelId, seconds, variant, seed: variant * 1009 + index });
      tracks.push({ id: input.newId(), moods: [moodId], variant, title: `${mood(moodId).label.en} ${variant}`, model: modelId, prompt: request.prompt, seed: model.seed ? request.seed ?? null : null, requestedSeconds: seconds });
      expected += musicPriceUsdMicros(modelId, seconds);
    }
  });
  return { id: input.newId(), layer: "music", styleText, model: modelId, moods, variants, capUsdMicros: input.settings.packCapUsdMicros, tracks, expectedUsdMicros: expected };
}

export const DEFAULT_AMBIENT_MODEL = "fal-ai/elevenlabs/sound-effects/v2";

/** The ambient pack: every place kind and weather × the takes, short seamless loops by default. */
export function planAmbientPack(input: { settings: MusicSettings; styleText?: string; kinds?: AmbientId[]; model?: string; variants?: number; newId: () => string }): PackPlan {
  const styleText = (input.styleText ?? input.settings.styleText).trim() || "a fantasy world";
  if (styleText.length > 1200) throw new MusicJobError("validation");
  const modelId = input.model ?? DEFAULT_AMBIENT_MODEL;
  const model = musicModel(modelId);
  if (!model) throw new MusicJobError("validation");
  const kinds = input.kinds ?? [...AMBIENT_IDS];
  if (!kinds.length || !kinds.every(isAmbientId) || new Set(kinds).size !== kinds.length) throw new MusicJobError("validation");
  const variants = input.variants ?? 1;
  if (!Number.isSafeInteger(variants) || variants < 1 || variants > 3) throw new MusicJobError("validation");
  const tracks: PackPlan["tracks"] = [];
  let expected = 0;
  kinds.forEach((ambientId, index) => {
    for (let variant = 1; variant <= variants; variant += 1) {
      const seconds = requestedSeconds(model, ambientSeconds(modelId));
      const request = ambientRequestFor({ styleText, ambientId, model: modelId, seconds, variant, seed: variant * 7 + index });
      tracks.push({ id: input.newId(), moods: [ambientId], variant, title: `${ambientKind(ambientId).label.en} ${variant}`, model: modelId, prompt: request.prompt, seed: model.seed ? request.seed ?? null : null, requestedSeconds: seconds });
      expected += musicPriceUsdMicros(modelId, seconds);
    }
  });
  return { id: input.newId(), layer: "ambient", styleText, model: modelId, moods: kinds, variants, capUsdMicros: input.settings.packCapUsdMicros, tracks, expectedUsdMicros: expected };
}

export async function createPack(ctx: MusicJobContext, plan: PackPlan): Promise<MusicPack> {
  const pack = parseMusicPack(await ctx.rpc("pack.create", { id: plan.id, layer: plan.layer, styleText: plan.styleText, model: plan.model, moods: plan.moods, variants: plan.variants, capUsdMicros: plan.capUsdMicros, tracks: plan.tracks }));
  if (!pack) throw new MusicJobError("unavailable");
  ctx.log?.("music_pack_created", { campaignId: ctx.campaignId, packId: pack.id, layer: plan.layer, tracks: plan.tracks.length, expectedUsdMicros: plan.expectedUsdMicros, model: plan.model });
  return pack;
}

type NextTrack = MusicTrack & { prompt: string; seed: number | null; capUsdMicros: number; packCostUsdMicros: number };
async function nextTrack(ctx: MusicJobContext): Promise<NextTrack | null> {
  const raw = await ctx.rpc("track.next");
  if (raw === null || raw === undefined) return null;
  const track = parseMusicTrack(raw);
  const record = raw as Record<string, unknown>;
  if (!track || typeof record.prompt !== "string" || !Number.isSafeInteger(record.capUsdMicros) || !Number.isSafeInteger(record.packCostUsdMicros)) throw new MusicJobError("unavailable");
  return { ...track, prompt: record.prompt, seed: Number.isSafeInteger(record.seed) ? (record.seed as number) : null, capUsdMicros: record.capUsdMicros as number, packCostUsdMicros: record.packCostUsdMicros as number };
}

export type RunOutcome = { track: MusicTrack | null; outcome: "idle" | "ready" | "failed" | "cap" };

/** Generate the oldest queued track of the campaign's pack: claim it against the cap, one fal request,
 * store the bytes, settle the row. One track per call; the client calls again while tracks are queued. */
export async function runNextTrack(ctx: MusicJobContext): Promise<RunOutcome> {
  const next = await nextTrack(ctx);
  if (!next || !next.model || next.requestedSeconds === null) return { track: null, outcome: "idle" };
  const expected = musicPriceUsdMicros(next.model, next.requestedSeconds);
  const claimed = parseMusicTrack(await ctx.rpc("track.update", { id: next.id, status: "generating", costUsdMicros: expected }));
  if (!claimed) throw new MusicJobError("unavailable");
  if (claimed.status === "failed") {
    ctx.log?.("music_track_cap", { campaignId: ctx.campaignId, trackId: next.id, capUsdMicros: next.capUsdMicros, packCostUsdMicros: next.packCostUsdMicros, expected });
    return { track: claimed, outcome: "cap" };
  }
  const request: MusicRequest = { model: next.model, prompt: next.prompt, negativePrompt: next.layer === "ambient" ? AMBIENT_NEGATIVE_PROMPT : NEGATIVE_PROMPT, seconds: next.requestedSeconds, seed: next.seed, styleWords: [] };
  try {
    const result = await ctx.generate(request);
    const storagePath = trackStoragePath(ctx.campaignId, next.id, result.contentType);
    await ctx.storage.put(storagePath, result.bytes, result.contentType);
    const track = parseMusicTrack(await ctx.rpc("track.update", {
      id: next.id, status: "ready", costUsdMicros: result.priceUsdMicros, requestId: result.requestId, elapsedMs: result.elapsedMs,
      output: { storagePath, contentType: result.contentType, bytes: result.bytes.byteLength, durationMs: audioDurationMs(result.bytes), sha256: ctx.sha256(result.bytes) },
    }));
    if (!track) throw new MusicJobError("unavailable");
    ctx.log?.("music_track_ready", { campaignId: ctx.campaignId, trackId: next.id, model: next.model, seconds: next.requestedSeconds, costUsdMicros: result.priceUsdMicros, elapsedMs: result.elapsedMs });
    return { track, outcome: "ready" };
  } catch (error) {
    const code = error instanceof FalMusicError ? error.code : "unavailable";
    const detail = error instanceof FalMusicError && error.detail ? `${code}: ${error.detail}` : code;
    // A request refused at submit was never queued and is not billed; any other failure stays counted at the list price.
    const refused = error instanceof FalMusicError && error.code === "validation" && /^HTTP 4/.test(error.detail ?? "");
    const track = parseMusicTrack(await ctx.rpc("track.update", { id: next.id, status: "failed", error: detail.slice(0, 200), costUsdMicros: refused ? 0 : expected }));
    ctx.log?.("music_track_failed", { campaignId: ctx.campaignId, trackId: next.id, model: next.model, error: detail.slice(0, 200) });
    return { track, outcome: "failed" };
  }
}

export const MAX_UPLOAD_BYTES = 25_000_000;

/** The owner's own track: checked as audio, stored, tagged with its moods. */
export async function storeUpload(ctx: MusicJobContext, input: { bytes: Uint8Array; title: string; moods: unknown }): Promise<MusicTrack> {
  const contentType = sniffAudio(input.bytes);
  const title = input.title.trim();
  if (!contentType || input.bytes.byteLength < 1000 || input.bytes.byteLength > Math.min(MAX_UPLOAD_BYTES, MAX_TRACK_BYTES) || !title || title.length > 120) throw new MusicJobError("validation");
  if (!Array.isArray(input.moods) || !input.moods.length || !input.moods.every(isMoodId) || new Set(input.moods).size !== input.moods.length) throw new MusicJobError("validation");
  const id = ctx.newId();
  if (!isUuid(id)) throw new MusicJobError("unavailable");
  const storagePath = trackStoragePath(ctx.campaignId, id, contentType);
  await ctx.storage.put(storagePath, input.bytes, contentType);
  const track = parseMusicTrack(await ctx.rpc("upload.create", { id, title, moods: input.moods, output: { storagePath, contentType, bytes: input.bytes.byteLength, durationMs: audioDurationMs(input.bytes), sha256: ctx.sha256(input.bytes) } }));
  if (!track) throw new MusicJobError("unavailable");
  return track;
}
