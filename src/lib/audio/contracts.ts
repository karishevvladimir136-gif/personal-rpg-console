// What the music API exchanges with the client (the music stage): settings, the
// active pack, its tracks and the owner's uploads — projections only, never a
// prompt, a seed or a storage path. Pure parsers.
import { isUuid } from "../persistence/validation.ts";
import { isMoodId, type MoodId } from "./moods.ts";
import { isAmbientId, type AmbientId } from "./ambient.ts";
import { MUSIC_MODEL_IDS } from "./models.ts";

export type MusicLayer = "music" | "ambient";
/** Moods of a music track; place kinds and weathers of an ambient track. */
export type TrackTag = MoodId | AmbientId;

export type MusicSettings = {
  enabled: boolean;
  /** The ambient layer (place sounds and weather) under the music. */
  ambient: boolean;
  model: string;
  variants: number;
  packCapUsdMicros: number;
  styleText: string;
  revision: number;
};
export type MusicPack = {
  id: string;
  scope: "world" | "campaign";
  scopeId: string;
  layer: MusicLayer;
  version: number;
  styleText: string;
  model: string;
  moods: TrackTag[];
  variants: number;
  capUsdMicros: number;
  status: "generating" | "ready" | "failed" | "cancelled";
  costUsdMicros: number;
  createdAt: string;
  finishedAt: string | null;
};
export type MusicTrack = {
  id: string;
  packId: string | null;
  scope: "world" | "campaign";
  layer: MusicLayer;
  source: "generated" | "upload";
  moods: TrackTag[];
  variant: number;
  title: string;
  model: string | null;
  requestedSeconds: number | null;
  status: "queued" | "generating" | "ready" | "failed";
  hidden: boolean;
  contentType: string | null;
  bytes: number | null;
  durationMs: number | null;
  costUsdMicros: number;
  elapsedMs: number | null;
  error: string | null;
  createdAt: string;
  readyAt: string | null;
};
export type MusicState = {
  campaignId: string;
  worldId: string | null;
  scope: "world" | "campaign";
  scopeId: string;
  settings: MusicSettings;
  pack: MusicPack | null;
  /** The active ambient pack of the scope (place sounds and weathers), when one exists. */
  ambientPack: MusicPack | null;
  packs: MusicPack[];
  tracks: MusicTrack[];
  spentUsdMicros: number;
  /** Whether the server can generate (a fal key is configured); never the key. */
  generation: { configured: boolean };
};

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown) => (typeof v === "number" && Number.isSafeInteger(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : null);
const layerOf = (v: unknown): MusicLayer | null => (v === "music" || v === "ambient" ? v : v === undefined ? "music" : null);
const tags = (v: unknown, layer: MusicLayer | null): TrackTag[] | null =>
  Array.isArray(v) && v.length >= 1 && v.every(layer === "ambient" ? isAmbientId : isMoodId) ? (v as TrackTag[]) : null;

export function parseMusicSettings(v: unknown): MusicSettings | null {
  if (!isRecord(v) || typeof v.enabled !== "boolean" || typeof v.model !== "string" || int(v.variants) === null || int(v.packCapUsdMicros) === null || typeof v.styleText !== "string" || int(v.revision) === null) return null;
  return { enabled: v.enabled, ambient: v.ambient !== false, model: v.model, variants: v.variants as number, packCapUsdMicros: v.packCapUsdMicros as number, styleText: v.styleText, revision: v.revision as number };
}
export function parseMusicPack(v: unknown): MusicPack | null {
  const layer = isRecord(v) ? layerOf(v.layer) : null;
  if (!isRecord(v) || !layer || !isUuid(v.id) || (v.scope !== "world" && v.scope !== "campaign") || !isUuid(v.scopeId) || int(v.version) === null || typeof v.styleText !== "string" || typeof v.model !== "string"
    || !tags(v.moods, layer) || int(v.variants) === null || int(v.capUsdMicros) === null || !["generating", "ready", "failed", "cancelled"].includes(v.status as string) || int(v.costUsdMicros) === null || typeof v.createdAt !== "string") return null;
  return { id: v.id, scope: v.scope, scopeId: v.scopeId, layer, version: v.version as number, styleText: v.styleText, model: v.model, moods: tags(v.moods, layer)!, variants: v.variants as number, capUsdMicros: v.capUsdMicros as number,
    status: v.status as MusicPack["status"], costUsdMicros: v.costUsdMicros as number, createdAt: v.createdAt, finishedAt: str(v.finishedAt) };
}
export function parseMusicTrack(v: unknown): MusicTrack | null {
  const layer = isRecord(v) ? layerOf(v.layer) : null;
  if (!isRecord(v) || !layer || !isUuid(v.id) || (v.packId !== null && !isUuid(v.packId)) || (v.scope !== "world" && v.scope !== "campaign") || (v.source !== "generated" && v.source !== "upload") || !tags(v.moods, layer)
    || int(v.variant) === null || typeof v.title !== "string" || !["queued", "generating", "ready", "failed"].includes(v.status as string) || typeof v.hidden !== "boolean" || int(v.costUsdMicros) === null || typeof v.createdAt !== "string") return null;
  return { id: v.id, packId: v.packId as string | null, scope: v.scope, layer, source: v.source, moods: tags(v.moods, layer)!, variant: v.variant as number, title: v.title, model: str(v.model), requestedSeconds: int(v.requestedSeconds),
    status: v.status as MusicTrack["status"], hidden: v.hidden, contentType: str(v.contentType), bytes: int(v.bytes), durationMs: int(v.durationMs), costUsdMicros: v.costUsdMicros as number, elapsedMs: int(v.elapsedMs),
    error: str(v.error), createdAt: v.createdAt, readyAt: str(v.readyAt) };
}
export function parseMusicState(v: unknown): MusicState | null {
  if (!isRecord(v) || !isUuid(v.campaignId) || (v.worldId !== null && !isUuid(v.worldId)) || (v.scope !== "world" && v.scope !== "campaign") || !isUuid(v.scopeId) || !Array.isArray(v.packs) || !Array.isArray(v.tracks) || int(v.spentUsdMicros) === null) return null;
  const settings = parseMusicSettings(v.settings);
  const pack = v.pack === null ? null : parseMusicPack(v.pack);
  const ambientRaw = v.ambientPack ?? null;
  const ambientPack = ambientRaw === null ? null : parseMusicPack(ambientRaw);
  const packs = v.packs.map(parseMusicPack), tracks = v.tracks.map(parseMusicTrack);
  if (!settings || (v.pack !== null && !pack) || (ambientRaw !== null && !ambientPack) || packs.some((p) => !p) || tracks.some((t) => !t)) return null;
  const generation = isRecord(v.generation) && typeof v.generation.configured === "boolean" ? { configured: v.generation.configured } : { configured: false };
  return { campaignId: v.campaignId, worldId: v.worldId as string | null, scope: v.scope, scopeId: v.scopeId, settings, pack, ambientPack, packs: packs as MusicPack[], tracks: tracks as MusicTrack[], spentUsdMicros: v.spentUsdMicros as number, generation };
}

/** The settings a client may save (validated again in SQL). */
export function parseMusicSettingsInput(v: unknown): (Omit<MusicSettings, "revision"> & { expectedRevision: number }) | null {
  if (!isRecord(v) || int(v.expectedRevision) === null || typeof v.enabled !== "boolean" || typeof v.ambient !== "boolean" || typeof v.model !== "string" || !MUSIC_MODEL_IDS.includes(v.model) || int(v.variants) === null || (v.variants as number) < 1 || (v.variants as number) > 3
    || int(v.packCapUsdMicros) === null || (v.packCapUsdMicros as number) < 0 || (v.packCapUsdMicros as number) > 50_000_000 || typeof v.styleText !== "string" || v.styleText.length > 1200) return null;
  return { expectedRevision: v.expectedRevision as number, enabled: v.enabled, ambient: v.ambient, model: v.model, variants: v.variants as number, packCapUsdMicros: v.packCapUsdMicros as number, styleText: v.styleText };
}

/** The public scene signal the player polls between turns (nothing private: the committed turn's
 * public projection, the clock, the current place's public name). */
export type SceneSignalView = {
  turnId: string | null;
  sceneKinds: string[];
  tension: "calm" | "tense" | "climax" | null;
  hint: "calm" | "tense" | "climax" | null;
  playerMoment: boolean;
  encounterActive: boolean;
  worldMinutes: number | null;
  place: { name: string; description: string } | null;
  /** The committed turn's public narration (the ambient layer reads the weather from it). */
  narration: string | null;
  /** Whether a turn is in flight (the client polls faster then). */
  turnPending: boolean;
};
